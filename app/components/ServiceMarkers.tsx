'use client'

import React, { useEffect, useState, useRef } from 'react'
import L from 'leaflet'
import { POI_CATEGORIES, POI } from '../utils/overpassService'
import { searchPOIsAlongRoute, searchPOIsNearDestination, getFallbackPOIs } from '../utils/tomtomService'
import { searchAttractionsAlongRoute, searchAttractionsNearLocation } from '../utils/viatorService'
import { Coordinates } from '../utils/routingService'

interface ServiceMarkersProps {
  map: L.Map | null;
  routeGeometry: any;
  startCoords?: Coordinates;
  endCoords?: Coordinates;
  activeLayers: string[];
  onPOIClick?: (poi: POI) => void;
  onCountUpdate?: (count: number) => void;
  onStatusUpdate?: (status: string) => void;
  onSelectPOI?: (poi: POI) => void;
}

/**
 * Component to display service markers (POIs) on the map
 * This component doesn't render any visible UI elements directly,
 * but adds markers to the provided map instance
 */
export default function ServiceMarkers({ 
  map, 
  routeGeometry, 
  startCoords,
  endCoords,
  activeLayers,
  onPOIClick,
  onCountUpdate,
  onStatusUpdate,
  onSelectPOI
}: ServiceMarkersProps) {
  // Store marker layer groups for each POI category
  const markerGroupsRef = useRef<{[key: string]: L.LayerGroup}>({})
  
  // Track loading state for each POI category
  const loadingLayersRef = useRef<Set<string>>(new Set())
  const [loadedLayers, setLoadedLayers] = useState<Set<string>>(new Set())
  const totalPOICountRef = useRef<number>(0)

  // Create custom SVG icon for each POI type
  const createPOIIcon = (poiType: string, poiColor: string) => {
    // Base SVG for the pin
    let pinSvg = `
      <svg width="24" height="36" viewBox="0 0 24 36" fill="none" xmlns="http://www.w3.org/2000/svg" class="poi-svg-icon">
        <path d="M12 0C5.383 0 0 5.383 0 12C0 20.383 12 36 12 36C12 36 24 20.383 24 12C24 5.383 18.617 0 12 0Z" fill="${poiColor}"/>
        <circle cx="12" cy="12" r="8" fill="white"/>
      `;
    
    // Add category-specific icon to the center - matching the POI control buttons from screenshot
    switch (poiType) {
      case 'gasStations':
        // Droplet/flame icon for gas stations (red)
        pinSvg += `
          <path d="M12 6.5C10.21 9.57 8 11.47 8 13.95C8 16.83 9.8 18.5 12 18.5C14.2 18.5 16 16.83 16 13.95C16 11.47 13.79 9.57 12 6.5Z" fill="${poiColor}"/>
        `;
        break;
      case 'evCharging':
        // Lightning bolt icon for EV charging (green)
        pinSvg += `
          <path d="M13.19 6.75H10.81L8.75 12.25H11.12L9.06 18.25L15.25 11.12H12.31L13.19 6.75Z" fill="${poiColor}"/>
        `;
        break;
      case 'hotels':
        // Bed icon for hotels (blue) - fixed to match exactly what's in screenshot
        pinSvg += `
          <path d="M7 9.5V15.5H17V9.5H7Z" fill="${poiColor}"/>
          <path d="M7 9.5V11.5H17V9.5H7Z" fill="white"/>
        `;
        break;
      case 'restaurants':
        // Fork and knife icon for restaurants (orange)
        pinSvg += `
          <path d="M9 7V17H10.5V13H11.5C12.6 13 13.5 12.1 13.5 11V9C13.5 7.9 12.6 7 11.5 7H9ZM11.5 11.5H10.5V8.5H11.5V11.5Z" fill="${poiColor}"/>
          <path d="M15 7V17H16.5V12.5H17V10H16.5V7H15Z" fill="${poiColor}"/>
        `;
        break;
      case 'attractions':
        // Camera icon for attractions (purple)
        pinSvg += `
          <path d="M16 9.5H14L13 8.5H11L10 9.5H8V15.5H16V9.5ZM12 14.5C11.17 14.5 10.5 13.83 10.5 13C10.5 12.17 11.17 11.5 12 11.5C12.83 11.5 13.5 12.17 13.5 13C13.5 13.83 12.83 14.5 12 14.5Z" fill="${poiColor}"/>
        `;
        break;
      default:
        // Default circular dot
        pinSvg += `
          <circle cx="12" cy="12" r="4" fill="${poiColor}"/>
        `;
    }
    
    // Close the SVG
    pinSvg += `</svg>`;
    
    return L.divIcon({
      className: `poi-marker-icon poi-${poiType}`,
      html: pinSvg,
      iconSize: [24, 36],
      iconAnchor: [12, 36],
      popupAnchor: [0, -34]
    });
  };

  // Initialize layer groups when the map is ready
  useEffect(() => {
    if (!map) return;
    
    console.log('Initializing layer groups for categories');
    
    // Create custom pane for POIs to ensure they stay on top
    try {
      if (!map.getPane('poi')) {
        map.createPane('poi');
        // Set a very high z-index to ensure POIs stay above all map elements
        const poiPane = map.getPane('poi');
        if (poiPane) {
          poiPane.style.zIndex = '650';
          // Add pointer-events configuration to ensure clicks pass through when needed
          poiPane.style.pointerEvents = 'auto';
          console.log('Created custom pane for POIs with high z-index');
        }
      }
    } catch (error) {
      console.error('Error creating custom pane:', error);
    }
    
    // Create layer groups for each POI category but don't add to map yet
    POI_CATEGORIES.forEach(category => {
      if (!markerGroupsRef.current[category.id]) {
        // Create but DON'T add to map yet - this avoids visibility issues
        const group = L.layerGroup();
        markerGroupsRef.current[category.id] = group;
        console.log(`Created layer group for ${category.id}`);
      }
    });
    
    // Cleanup function
    return () => {
      console.log('Cleaning up all marker groups');
      // Remove all layers when component unmounts
      Object.values(markerGroupsRef.current).forEach(group => {
        if (map) map.removeLayer(group);
      });
      markerGroupsRef.current = {};
      totalPOICountRef.current = 0;
      if (onCountUpdate) onCountUpdate(0);
    };
  }, [map, onCountUpdate]);
  
  // Load and display POIs when active layers or route changes
  useEffect(() => {
    if (!map || !routeGeometry) return;
    
    console.log('Active layers update:', activeLayers);
    
    // Only show/hide layers without constantly removing/adding markers
    Object.keys(markerGroupsRef.current).forEach(layerId => {
      const group = markerGroupsRef.current[layerId];
      
      if (activeLayers.includes(layerId)) {
        // Add the layer to the map if it's active and not already there
        if (!map.hasLayer(group)) {
          map.addLayer(group);
          console.log(`Showing layer: ${layerId}`);
        }
      } else {
        // Remove the layer from the map if it's not active but is currently shown
        if (map.hasLayer(group)) {
          map.removeLayer(group);
          console.log(`Hiding layer: ${layerId}`);
        }
      }
    });
    
    // Process each active layer - only fetch data if not already loaded
    const processActiveLayers = async () => {
      // Use destination-focused POI search when possible
      if (endCoords && activeLayers.length > 0) {
        try {
          // Filter out layers that are already loaded or loading
          const layersToLoad = activeLayers.filter(layerId => 
            !loadedLayers.has(layerId) && !loadingLayersRef.current.has(layerId)
          );
          
          if (layersToLoad.length === 0) {
            console.log('No new layers to load');
            return;
          }
          
          // Mark these layers as loading
          layersToLoad.forEach(layerId => {
            loadingLayersRef.current.add(layerId);
            console.log(`Starting to load POIs for ${layerId}`);
          });
          
          // Update status
          if (onStatusUpdate) onStatusUpdate(`Loading POIs near destination...`);
          
          // Use batch search for destination POIs - more efficient than multiple API calls
          console.log(`Fetching POIs for ${layersToLoad.length} categories near destination`);
          
          // Split the layers into attractions and non-attractions
          const attractionsLayer = layersToLoad.includes('attractions') ? ['attractions'] : [];
          const otherLayers = layersToLoad.filter(layer => layer !== 'attractions');
          
          // Track all POIs to emit in event
          let allPOIs: POI[] = [];
          
          // Process non-attraction layers with TomTom
          if (otherLayers.length > 0) {
            console.log(`[ServiceMarkers] Fetching ${otherLayers.length} non-attraction categories with TomTom`);
            const poisByType = await searchPOIsNearDestination(endCoords, otherLayers);
            
            // Process each POI type's results
            Object.entries(poisByType).forEach(([layerId, pois]) => {
              console.log(`Found ${pois.length} POIs for ${layerId} near destination`);
              
              // Add to allPOIs collection for event
              allPOIs = [...allPOIs, ...pois];
              
              // Get the layer group for this category
              const layerGroup = markerGroupsRef.current[layerId];
              if (!layerGroup) return;
              
              // Clear any existing markers
              layerGroup.clearLayers();
              
              // Create markers for each POI
              pois.forEach(poi => {
                addPOIToMap(poi, layerId, layerGroup);
              });
              
              // Mark this layer as loaded
              loadingLayersRef.current.delete(layerId);
              setLoadedLayers(prev => {
                const next = new Set(prev);
                next.add(layerId);
                return next;
              });
              
              // Update total POI count
              totalPOICountRef.current += pois.length;
              if (onCountUpdate) onCountUpdate(totalPOICountRef.current);
            });
          }
          
          // Process attractions with Viator
          if (attractionsLayer.length > 0 && routeGeometry) {
            console.log('[ServiceMarkers] Fetching attractions with Viator service');
            try {
              // Use Viator service for attractions
              const attractions = await searchAttractionsAlongRoute(routeGeometry);
              console.log(`[ServiceMarkers] Viator returned ${attractions.length} attractions`);
              
              // Add to allPOIs collection
              allPOIs = [...allPOIs, ...attractions];
              
              // Get the layer group for attractions
              const layerGroup = markerGroupsRef.current['attractions'];
              if (layerGroup) {
                // Clear any existing markers
                layerGroup.clearLayers();
                
                // Create markers for each attraction
                attractions.forEach(poi => {
                  addPOIToMap(poi, 'attractions', layerGroup);
                });
              }
              
              // Mark attractions as loaded
              loadingLayersRef.current.delete('attractions');
              setLoadedLayers(prev => {
                const next = new Set(prev);
                next.add('attractions');
                return next;
              });
              
              // Update total POI count
              totalPOICountRef.current += attractions.length;
              if (onCountUpdate) onCountUpdate(totalPOICountRef.current);
            } catch (error) {
              console.error('[ServiceMarkers] Error fetching attractions from Viator:', error);
              console.log('[ServiceMarkers] Falling back to TomTom for attractions');
              
              // Fallback to TomTom for attractions
              const poisByType = await searchPOIsNearDestination(endCoords, ['attractions']);
              
              if (poisByType.attractions) {
                const attractions = poisByType.attractions;
                console.log(`[ServiceMarkers] TomTom fallback returned ${attractions.length} attractions`);
                
                // Add to allPOIs collection
                allPOIs = [...allPOIs, ...attractions];
                
                // Get the layer group for attractions
                const layerGroup = markerGroupsRef.current['attractions'];
                if (layerGroup) {
                  // Clear any existing markers
                  layerGroup.clearLayers();
                  
                  // Create markers for each attraction
                  attractions.forEach(poi => {
                    addPOIToMap(poi, 'attractions', layerGroup);
                  });
                }
              }
              
              // Mark attractions as loaded
              loadingLayersRef.current.delete('attractions');
              setLoadedLayers(prev => {
                const next = new Set(prev);
                next.add('attractions');
                return next;
              });
            }
          }
          
          // Dispatch custom event with all POIs
          if (typeof window !== 'undefined') {
            const poiEvent = new CustomEvent('poiDataUpdated', {
              detail: { pois: allPOIs }
            });
            window.dispatchEvent(poiEvent);
            console.log('Dispatched poiDataUpdated event with', allPOIs.length, 'POIs');
          }
          
          // Success status
          if (onStatusUpdate) onStatusUpdate(`Found POIs near ${endCoords ? 'destination' : 'route'}`);
        } catch (error) {
          console.error('Error fetching destination POIs:', error);
          
          // Fall back to individual processing for each active layer
          fallbackToIndividualLoading(activeLayers);
        }
      } else {
        // Fall back to original route-based processing if we don't have destination coords
        fallbackToIndividualLoading(activeLayers);
      }
    };
    
    // Helper function to fall back to original processing method
    const fallbackToIndividualLoading = async (layersToProcess: string[]) => {
      for (const layerId of layersToProcess) {
        // Skip if already loaded or currently loading
        if (loadedLayers.has(layerId) || loadingLayersRef.current.has(layerId)) {
          console.log(`Skipping ${layerId}: already loaded or loading`);
          continue;
        }
        
        // Mark this layer as loading
        loadingLayersRef.current.add(layerId);
        console.log(`Starting to load POIs for ${layerId}`);
        
        try {
          // Get the layer group for this category
          const layerGroup = markerGroupsRef.current[layerId];
          if (!layerGroup) continue;
          
          // Update status
          if (onStatusUpdate) onStatusUpdate(`Loading ${layerId}...`);
          
          // Fetch POIs
          let pois: POI[] = [];
          
          if (routeGeometry) {
            // For attractions, use Viator at destination only
            if (layerId === 'attractions') {
              console.log('[ServiceMarkers] Fallback: Using Viator for attractions at destination only');
              try {
                // If we have end coordinates, use them directly
                if (endCoords) {
                  console.log('[ServiceMarkers] Using end coordinates for attractions search');
                  pois = await searchAttractionsNearLocation(endCoords, 15); // 15km radius
                } else {
                  // Otherwise extract destination from route
                  pois = await searchAttractionsAlongRoute(routeGeometry);
                }
                console.log(`[ServiceMarkers] Viator returned ${pois.length} attractions`);
              } catch (viatorError) {
                console.error('[ServiceMarkers] Error with Viator, falling back to TomTom:', viatorError);
                // If Viator fails, try TomTom
                if (endCoords) {
                  // If we have end coordinates, search near destination only
                  const poisByType = await searchPOIsNearDestination(endCoords, ['attractions']);
                  pois = poisByType.attractions || [];
                } else {
                  // Otherwise use route-based search which will only use destination for attractions
                  pois = await searchPOIsAlongRoute(routeGeometry, layerId);
                }
              }
            } else {
              // For other POI types, use TomTom
              console.log(`Fetching POIs for ${layerId} using TomTom API`);
              try {
                // Try TomTom API first
                pois = await searchPOIsAlongRoute(routeGeometry, layerId);
                console.log(`Found ${pois.length} POIs from TomTom API for ${layerId}`);
              } catch (apiError) {
                console.error(`TomTom API error for ${layerId}:`, apiError);
                
                // Fall back to mock data if API fails
                console.log(`Falling back to mock data for ${layerId}`);
                if (onStatusUpdate) onStatusUpdate(`Using fallback data for ${layerId}`);
                
                pois = await getFallbackPOIs(routeGeometry, layerId);
              }
            }
          } else {
            console.error('Missing route geometry for POI generation');
          }
          
          console.log(`Found ${pois.length} POIs for ${layerId}`);
          
          // Clear any existing markers
          layerGroup.clearLayers();
          
          // Create markers for each POI
          pois.forEach(poi => {
            addPOIToMap(poi, layerId, layerGroup);
          });
          
          // Update total POI count
          totalPOICountRef.current += pois.length;
          if (onCountUpdate) onCountUpdate(totalPOICountRef.current);
          
          // Mark this layer as loaded
          loadingLayersRef.current.delete(layerId);
          setLoadedLayers(prev => {
            const next = new Set(prev);
            next.add(layerId);
            return next;
          });
        } catch (error) {
          console.error(`Error loading POIs for ${layerId}:`, error);
          loadingLayersRef.current.delete(layerId);
        }
      }
    };
    
    // Call the function to process active layers
    processActiveLayers();
  }, [map, routeGeometry, activeLayers, endCoords, startCoords, loadedLayers, onCountUpdate, onStatusUpdate]);
  
  // Extract the POI marker creation into a reusable helper function
  const addPOIToMap = (poi: POI, poiType: string, layerGroup: L.LayerGroup) => {
    // Get color for this POI type
    const colors: {[key: string]: string} = {
      gasStations: '#FF3B30', // Red
      evCharging: '#34C759', // Green
      hotels: '#007AFF',     // Blue
      restaurants: '#FF9500', // Orange
      attractions: '#AF52DE'  // Purple
    };
    const color = colors[poi.type] || '#8E8E93';
    
    // Create marker with custom icon
    const icon = createPOIIcon(poi.type, color);
    const marker = L.marker([poi.location.lat, poi.location.lng], { 
      icon: icon,
      pane: 'poi',
      zIndexOffset: 1000,
      riseOnHover: true,
      riseOffset: 1500
    })
    // Use tooltip for hover behavior instead of popup
    .bindTooltip(createTooltipContent(poi), {
      direction: 'top',
      offset: L.point(0, -36),
      className: poi.approximateLocation ? 'poi-tooltip approximate-tooltip' : 'poi-tooltip',
      opacity: 0.9
    })
    // Handle click to show detailed panel
    .on('click', () => {
      if (onPOIClick) onPOIClick(poi);
      
      // Send selected POI to parent for detailed view
      if (onSelectPOI) onSelectPOI(poi);
    });
    
    // Add classes for approximate locations via DOM element after marker is created
    if (poi.approximateLocation) {
      // Access the DOM element via the Leaflet icon element
      setTimeout(() => {
        const markerElement = marker.getElement();
        if (markerElement) {
          markerElement.classList.add('approximate-location-marker');
        }
      }, 0);
    }
    
    // Add to layer group
    layerGroup.addLayer(marker);
  };
  
  // Create simple tooltip content for hover
  const createTooltipContent = (poi: POI): string => {
    // Create a simplified tooltip for hover
    let content = `<div class="poi-tooltip-content">
      <strong class="poi-name" style="display:block; max-width:200px; word-wrap:break-word;">${poi.name}</strong>`;
    
    // Add minimal details based on POI type
    switch (poi.type) {
      case 'hotels':
        if (poi.tags.stars) content += `<div>${poi.tags.stars} ★</div>`;
        break;
      case 'restaurants':
        if (poi.tags.cuisine) content += `<div>${poi.tags.cuisine}</div>`;
        break;
      case 'gasStations':
        if (poi.tags.brand) content += `<div>${poi.tags.brand}</div>`;
        break;
      case 'evCharging':
        content += `<div>EV Charging</div>`;
        break;
      case 'attractions':
        if (poi.tags.duration) content += `<div>${poi.tags.duration}</div>`;
        break;
    }
    
    if (poi.tags.address) {
      // Allow address to wrap naturally instead of truncating
      content += `<div class="address" style="max-width:200px; word-wrap:break-word;">${poi.tags.address}</div>`;
    }
    
    // Add distance information if available
    if (poi.tags.distance) {
      content += `<div class="distance" style="font-style:italic;">${poi.tags.distance}</div>`;
    }
    
    // Indicate if location is approximate
    if (poi.approximateLocation) {
      content += `<div class="approximate-note" style="font-size:0.8em; color:#FF9500;">Approximate location</div>`;
    }
    
    // Enhance the tooltip hint based on whether we have a TomTom ID for photos
    if (poi.tomtomId) {
      content += `<div class="tooltip-hint">Click for details and photos</div>`;
    } else {
      content += `<div class="tooltip-hint">Click for details</div>`;
    }
    
    content += `</div>`;
    
    return content;
  };
  
  // This component doesn't render any visible UI
  return null;
} 