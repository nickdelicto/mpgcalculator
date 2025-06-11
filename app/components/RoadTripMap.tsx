'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Coordinates } from '../utils/routingService'
import ServiceMarkers from './ServiceMarkers'
import { POI } from '../utils/overpassService'
import MapPOIControls from './MapPOIControls'
import MapActionButtons from './MapActionButtons'

// Define prop types for the map component
interface MapProps {
  startCoords?: Coordinates;
  endCoords?: Coordinates;
  routeGeometry?: any;
  isFallbackRoute?: boolean; // New prop to indicate if this is a fallback route
  startLocation?: string;
  endLocation?: string;
  activePOILayers?: string[]; // Add this prop
  onLayerChange?: (layers: string[]) => void; // Add callback to update parent state
  onSelectPOI?: (poi: POI) => void; // Add callback for POI selection
}

const RoadTripMap: React.FC<MapProps> = ({ 
  startCoords, 
  endCoords, 
  routeGeometry, 
  isFallbackRoute = false,
  startLocation = 'Starting Point',
  endLocation = 'Destination',
  activePOILayers = [],
  onLayerChange,
  onSelectPOI
}) => {
  // Refs for the map container and map instance
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  
  // Refs for map layers
  const markersRef = useRef<L.Marker[]>([])
  const routeLayerRef = useRef<L.GeoJSON | null>(null)
  
  // State to track if Leaflet's CSS has been fixed (for marker icons)
  const [isLeafletFixed, setIsLeafletFixed] = useState(false)
  const [mapStatus, setMapStatus] = useState<string>('Initializing map...')
  const [isMapInitialized, setIsMapInitialized] = useState(false)
  
  // State for POI layers and selected POI
  const [activeLayers, setActiveLayers] = useState<string[]>(activePOILayers || []);
  const [selectedPOI, setSelectedPOI] = useState<POI | null>(null)
  
  // Add a state to track when the map is fully ready for user interaction
  const [mapFullyReady, setMapFullyReady] = useState(false)
  const [poiCount, setPoiCount] = useState(0)
  
  // States to determine when to show the action buttons
  const [showAttractionButton, setShowAttractionButton] = useState(false)
  const [showAccommodationButton, setShowAccommodationButton] = useState(false)
  
  // Load saved layers from localStorage after mount (client-side only)
  useEffect(() => {
    if (activePOILayers && activePOILayers.length > 0) {
      setActiveLayers(activePOILayers);
      console.log('Updated map activeLayers from parent:', activePOILayers);
    }
  }, [activePOILayers]);
  
  // Fix Leaflet marker icon issue in Next.js
  useEffect(() => {
    if (!isLeafletFixed) {
      // Fix icon paths
      delete (L.Icon.Default.prototype as any)._getIconUrl
      
      L.Icon.Default.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
      })
      
      setIsLeafletFixed(true)
    }
  }, [isLeafletFixed])
  
  // Initialize the map on component mount
  useEffect(() => {
    // Only run if we have a ref to the container
    if (!mapContainerRef.current) {
      console.error('Map container ref is null');
      return;
    }
    
    // Create map if it doesn't exist
    if (!mapRef.current) {
      try {
        console.log('Initializing map...');
        mapRef.current = L.map(mapContainerRef.current).setView([39.8283, -98.5795], 4)
        
        // Add tile layer (OpenStreetMap)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mapRef.current)
        
        setMapStatus('Map ready');
        console.log('Map initialized successfully');
        setIsMapInitialized(true)
        
        // Mark map as fully ready after a short delay to ensure all operations complete
        setTimeout(() => {
          setMapFullyReady(true);
        }, 1000);
      } catch (error) {
        console.error('Error initializing map:', error);
        setMapStatus('Error initializing map');
      }
    }
    
    // Clean up on component unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])
  
  // Update markers and route when coordinates change
  useEffect(() => {
    if (!mapRef.current || !isMapInitialized) return
    
    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []
    
    // Clear existing route
    if (routeLayerRef.current) {
      routeLayerRef.current.remove()
      routeLayerRef.current = null
    }
    
    // Add start marker if coordinates are available
    if (startCoords) {
      // Create a custom icon for the start marker using SVG (standard pin with green color)
      const startIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `
          <svg width="24" height="36" viewBox="0 0 24 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 0C5.383 0 0 5.383 0 12C0 20.383 12 36 12 36C12 36 24 20.383 24 12C24 5.383 18.617 0 12 0Z" fill="#008000"/>
            <circle cx="12" cy="12" r="6" fill="white"/>
          </svg>
        `,
        iconSize: [24, 36],
        iconAnchor: [12, 36]
      });
      
      const marker = L.marker([startCoords.lat, startCoords.lng], { icon: startIcon }).addTo(mapRef.current)
      marker.bindPopup('<strong>Starting Point</strong><br>' + startLocation)
      markersRef.current.push(marker)
    }
    
    // Add end marker if coordinates are available
    if (endCoords) {
      // Create a custom icon for the end marker using SVG (red checkered flag)
      const endIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `
          <svg width="28" height="32" viewBox="0 0 28 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="0" width="4" height="32" fill="#666"/>
            <rect x="6" y="0" width="20" height="20" fill="#FF3B30"/>
            <rect x="6" y="0" width="10" height="10" fill="white"/>
            <rect x="16" y="10" width="10" height="10" fill="white"/>
          </svg>
        `,
        iconSize: [28, 32],
        iconAnchor: [4, 32]
      });
      
      const marker = L.marker([endCoords.lat, endCoords.lng], { icon: endIcon }).addTo(mapRef.current)
      marker.bindPopup('<strong>Destination</strong><br>' + endLocation)
      markersRef.current.push(marker)
    }
    
    // Add route if geometry is available
    if (routeGeometry && startCoords && endCoords) {
      // Choose color based on whether this is a fallback route or real API route
      const routeColor = isFallbackRoute ? '#FF8C00' : '#0066FF'; // Orange for fallback, vibrant blue for real
      
      // Log route geometry to debug
      console.log('Route geometry type:', routeGeometry.type);
      console.log('Route coordinates count:', routeGeometry.coordinates?.length || 0);
      console.log('First few coordinates:', routeGeometry.coordinates?.slice(0, 3));
      
      try {
        // Extract the coordinates and convert them for Leaflet
        if (routeGeometry.coordinates && routeGeometry.coordinates.length > 0) {
          // Create a filtered and validated list of coordinates
          const validCoordinates = routeGeometry.coordinates.filter((coord: number[]) => {
            if (!Array.isArray(coord) || coord.length < 2) {
              console.warn('Invalid coordinate format:', coord);
              return false;
            }
            
            // Basic validation for global bounds
            const [lng, lat] = coord;
            if (Math.abs(lat) > 90 || Math.abs(lng) > 180) {
              console.warn(`Skipping out-of-range coordinate: [${lng}, ${lat}]`);
              return false;
            }
            
            return true;
          });
          
          console.log(`Filtered ${routeGeometry.coordinates.length} coordinates to ${validCoordinates.length} valid points`);
          
          // Apply additional validation - make sure all points are reasonably close to our start/end
          // Calculate the expected bounding box with some padding
          const minLat = Math.min(startCoords.lat, endCoords.lat) - 2; // 2 degrees padding
          const maxLat = Math.max(startCoords.lat, endCoords.lat) + 2;
          const minLng = Math.min(startCoords.lng, endCoords.lng) - 2;
          const maxLng = Math.max(startCoords.lng, endCoords.lng) + 2;
          
          console.log(`Expected route bounds: lng ${minLng} to ${maxLng}, lat ${minLat} to ${maxLat}`);
          
          // Filter points to those within the reasonable bounds
          const routeCoordinates = validCoordinates.filter((coord: number[]) => {
            const [lng, lat] = coord;
            // Check if the point is within our expected region
            const inBounds = 
              lat >= minLat && 
              lat <= maxLat && 
              lng >= minLng && 
              lng <= maxLng;
              
            if (!inBounds) {
              console.warn(`Filtering out-of-bounds coordinate: [${lng}, ${lat}]`);
            }
            
            return inBounds;
          });
          
          console.log(`Further filtered to ${routeCoordinates.length} points within expected bounds`);
          
          // If we don't have enough points for a route, create a direct line
          if (routeCoordinates.length < 3) {
            console.warn('Not enough valid route points, using direct line');
            routeCoordinates.length = 0;
            routeCoordinates.push([startCoords.lng, startCoords.lat]);
            routeCoordinates.push([endCoords.lng, endCoords.lat]);
          } else {
            // Ensure the route begins and ends at our actual start/end points
            routeCoordinates[0] = [startCoords.lng, startCoords.lat];
            routeCoordinates[routeCoordinates.length - 1] = [endCoords.lng, endCoords.lat];
            console.log('Anchored route to start/end points');
          }
          
          // Convert [lng, lat] to [lat, lng] for Leaflet
          const latlngs = routeCoordinates.map((coord: number[]) => {
            // Ensure we're correctly ordering as [lat, lng] for Leaflet
            return [coord[1], coord[0]];
          });
          
          console.log('Creating polyline with points:', latlngs.length);
          console.log('Sample points:', latlngs.slice(0, 3));
          
          // Create a white outline first (thicker line behind)
          const routeOutline = L.polyline([], {
            color: '#FFFFFF',
            weight: 5,
            opacity: 0.7,
            lineJoin: 'round',
            lineCap: 'round',
            className: 'route-outline'
          }).addTo(mapRef.current);
          
          // Create the main route line
          const routeLine = L.polyline([], {
            color: routeColor,
            weight: 3,
            opacity: 1,
            lineJoin: 'round',
            lineCap: 'round',
            className: 'route-line'
          }).addTo(mapRef.current);
          
          // Ensure proper layer order
          routeOutline.bringToFront();
          routeLine.bringToFront();
          
          // Store reference to clean up later
          routeLayerRef.current = routeLine as any;
          
          // Animate the route drawing
          const animateRoute = () => {
            let step = 0;
            const totalPoints = latlngs.length;
            const animationSteps = Math.min(50, totalPoints); // Max 50 animation steps
            const pointsPerStep = Math.max(1, Math.floor(totalPoints / animationSteps));
            
            // Set animation status
            setMapStatus('Drawing route...');
            
            const animation = setInterval(() => {
              step++;
              const pointsToShow = Math.min(step * pointsPerStep, totalPoints);
              const currentPoints = latlngs.slice(0, pointsToShow);
              
              // Update the polylines with current points
              routeOutline.setLatLngs(currentPoints);
              routeLine.setLatLngs(currentPoints);
              
              // Check if animation is complete
              if (pointsToShow >= totalPoints) {
                clearInterval(animation);
                setMapStatus('Route complete');
          
                // Force map refresh after animation completes
          setTimeout(() => {
            if (mapRef.current) {
              mapRef.current.invalidateSize();
                    
                    // Zoom in to destination after animation completes
                    if (endCoords) {
                      // First show the entire route
                      setTimeout(() => {
                        // Then smoothly zoom in to destination
                        mapRef.current?.flyTo(
                          [endCoords.lat, endCoords.lng],
                          14, // Zoom level for destination
                          {
                            duration: 2, // Animation duration in seconds
                            easeLinearity: 0.5
                          }
                        );
                        setMapStatus('Destination reached');
                      }, 1000); // Wait 1 second after route completes
                    }
            }
          }, 100);
              }
            }, 50); // Update every 50ms
          };
          
          // Start animation after a short delay to ensure map is ready
          setTimeout(animateRoute, 200);
          
          console.log('Added animated route');
          
          // Create a more generous bounding box that includes some padding
          try {
            // Create a bounds based just on start and end points for reliability
            const bounds = L.latLngBounds([
              [startCoords.lat, startCoords.lng],
              [endCoords.lat, endCoords.lng]
            ]);
            
            // Extend bounds slightly for better visibility
            bounds.pad(0.2); // Add 20% padding
            
            console.log('Route bounds:', bounds.toBBoxString());
            
            // Set the view
            mapRef.current.fitBounds(bounds, { 
              padding: [50, 50],
              maxZoom: 14 // Limit zoom level
            });
            
            console.log('Map bounds set to include route endpoints');
            
          } catch (boundsError) {
            console.error('Error setting bounds:', boundsError);
            
            // Ultra-safe fallback
            mapRef.current.setView([
              (startCoords.lat + endCoords.lat) / 2, 
              (startCoords.lng + endCoords.lng) / 2
            ], 10);
          }
        } else {
          console.error('Route geometry has no coordinates');
        }
      } catch (error) {
        console.error('Error rendering route:', error);
      }
    }
    // If we have only start and end but no route, show both points
    else if (startCoords && endCoords) {
      const bounds = L.latLngBounds([
        [startCoords.lat, startCoords.lng],
        [endCoords.lat, endCoords.lng]
      ])
      mapRef.current.fitBounds(bounds, { padding: [50, 50] })
    }
    // If we only have one point, center on it
    else if (startCoords || endCoords) {
      const coords = startCoords || endCoords
      if (coords) {
        mapRef.current.setView([coords.lat, coords.lng], 10)
      }
    }
  }, [startCoords, endCoords, routeGeometry, isMapInitialized, isFallbackRoute, startLocation, endLocation])
  
  // Use callback for POI clicks to prevent re-renders
  const handlePOIClick = useCallback((poi: POI) => {
    console.log('POI clicked:', poi);
    setSelectedPOI(poi);
  }, []);
  
  // Handler for POI layer changes in MapPOIControls
  const handleLayerChange = useCallback((newLayers: string[]) => {
    setActiveLayers(newLayers);
    // Propagate changes up to parent component if callback exists
    if (onLayerChange) {
      console.log('Propagating layer change to parent:', newLayers);
      onLayerChange(newLayers);
    }
  }, [onLayerChange]);
  
  // Add a function to update POI count
  const updatePOICount = useCallback((count: number) => {
    setPoiCount(count);
  }, []);
  
  // Instead, add a one-time setup to ensure the map properly renders on events
  useEffect(() => {
    if (!mapRef.current || !isMapInitialized) return;
    
    const map = mapRef.current;
    
    // The key issue with Leaflet in React is handling redraw events properly
    map.on('layeradd', () => {
      // Give the browser a moment to render
      setTimeout(() => {
        map.invalidateSize();
      }, 10);
    });
    
    return () => {
      map.off('layeradd');
    };
  }, [isMapInitialized]);
  
  // Add a critical fix to maintain layer visibility during map interactions
  useEffect(() => {
    if (!mapRef.current || !isMapInitialized) return;
    
    const map = mapRef.current;
    
    // These event handlers ensure layers remain visible during map interactions
    const handleZoomStart = () => {
      console.log("Zoom started - preserving layer visibility");
      
      // Disable CSS transitions during zoom to prevent flickering
      const mapPane = map.getPane('mapPane');
      if (mapPane) {
        mapPane.style.transition = 'none';
      }
    };
    
    const handleZoomEnd = () => {
      console.log("Zoom ended - restoring normal behavior");
      
      // Re-enable transitions after zoom
      const mapPane = map.getPane('mapPane');
      if (mapPane) {
        mapPane.style.transition = '';
      }
      
      // Force a redraw of the map to ensure all layers are visible
      map.invalidateSize();
    };
    
    map.on('zoomstart', handleZoomStart);
    map.on('zoomend', handleZoomEnd);
    
    return () => {
      map.off('zoomstart', handleZoomStart);
      map.off('zoomend', handleZoomEnd);
    };
  }, [isMapInitialized]);
  
  // Add CSS to prevent marker flicker during zoom/pan
  useEffect(() => {
    if (!mapRef.current) return;
    
    // Add custom CSS to the document to fix marker visibility
    const styleId = 'map-marker-fix-style';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.innerHTML = `
        .leaflet-marker-pane, .leaflet-overlay-pane, .leaflet-shadow-pane {
          transition: none !important;
          will-change: transform;
          transform: translate3d(0, 0, 0);
          backface-visibility: hidden;
        }
        
        /* Custom tooltip styling */
        .poi-tooltip {
          min-width: 150px;
          max-width: 220px;
          padding: 8px;
          white-space: normal;
          word-wrap: break-word;
          border-radius: 6px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .poi-tooltip .poi-name {
          margin-bottom: 6px;
          display: block;
          font-size: 14px;
          line-height: 1.3;
          font-weight: 600;
        }
        
        .poi-tooltip .address {
          margin-top: 4px;
          font-size: 12px;
          color: #ccc;
          line-height: 1.3;
        }
        
        .poi-tooltip .tooltip-hint {
          margin-top: 8px;
          padding-top: 6px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          font-size: 11px;
          color: #999;
          font-style: italic;
          text-align: center;
        }
      `;
      document.head.appendChild(style);
    }
    
    return () => {
      const style = document.getElementById(styleId);
      if (style) style.remove();
    };
  }, []);
  
  // Add event handlers to ensure POI markers stay on top after map interactions
  useEffect(() => {
    if (!mapRef.current || !isMapInitialized) return;
    
    const map = mapRef.current;
    
    // Function to ensure POI markers are on top
    const ensureMarkersOnTop = () => {
      console.log('Ensuring POI markers are on top');
      const poiPane = map.getPane('poi');
      if (poiPane) {
        // Force the POI pane to have the highest z-index
        poiPane.style.zIndex = '650';
        
        // Bring all POI markers to front
        document.querySelectorAll('.poi-marker').forEach((marker) => {
          // This will force a DOM reflow of the marker elements
          if (marker.parentNode) {
            const parent = marker.parentNode;
            const detached = parent.removeChild(marker);
            parent.appendChild(detached);
          }
        });
      }
    };
    
    // Add event listeners for map interactions
    map.on('zoomend', ensureMarkersOnTop);
    map.on('moveend', ensureMarkersOnTop);
    map.on('layeradd', ensureMarkersOnTop);
    
    // Also force markers to top after a short delay (helps with initial loading)
    const initialTimer = setTimeout(ensureMarkersOnTop, 1000);
    
    // Clean up event listeners
    return () => {
      map.off('zoomend', ensureMarkersOnTop);
      map.off('moveend', ensureMarkersOnTop);
      map.off('layeradd', ensureMarkersOnTop);
      clearTimeout(initialTimer);
    };
  }, [isMapInitialized]);
  
  // Update POI count display and ensure it's accurate after layer changes
  useEffect(() => {
    // When activeLayers changes, update the POI count display in the debugging indicator
    const activeLayerCount = activeLayers.length;
    
    // Force update the displayed layer count
    setPoiCount(prevCount => {
      console.log(`Updating layer count display: ${activeLayerCount} active layers`);
      return prevCount; // Just trigger a re-render without changing the count
    });
    
  }, [activeLayers]);
  
  // Fix the POI counter display
  const debugInfo = `Map Ready: ${mapFullyReady ? 'Yes' : 'No'} | Layers: ${activeLayers.length} | POIs: ${poiCount}`;
  
  // Extract destination location details from full location string
  const extractLocationDetails = (location: string): { city: string, region: string, fullLocation: string } => {
    if (!location) return { city: '', region: '', fullLocation: '' }
    
    // Split the string by commas
    const parts = location.split(',').map(part => part.trim())
    
    // Default values
    let city = ''
    let region = ''
    let fullLocation = ''
    
    // If we have multiple parts, extract city and region
    if (parts.length >= 2) {
      city = parts[0]
      region = parts[1]
      
      // Create a more complete location string for better search results
      fullLocation = `${city}, ${region}`
    } else if (parts.length === 1) {
      // If we only have one part, use it as the city
      city = parts[0]
      fullLocation = city
    }
    
    return { city, region, fullLocation }
  }
  
  // Handle Find Attractions button click - now opens Viator search in new tab
  const handleFindAttractions = () => {
    if (!endCoords || !endLocation) {
      console.log('Cannot find attractions: No destination set')
      return
    }
    
    // Extract location details
    const { city, region, fullLocation } = extractLocationDetails(endLocation)
    
    // Create a Viator search URL with proper attribution parameters
    const viatorAffiliateId = 'P00255194'
    
    // Base URL with tracking parameters - using the new format
    const baseViatorUrl = 'https://www.viator.com/'
    
    // Prepare the attribution parameters
    const searchParams = new URLSearchParams({
      pid: viatorAffiliateId,
      mcid: '42383',
      medium: 'link',
      medium_version: 'selector',
      campaign: 'road-trip-cost-calculator-map-button'
    })
    
    // Create the final URL with just the tracking parameters, no search query
    const viatorUrl = `${baseViatorUrl}?${searchParams.toString()}`
    console.log(`Opening Viator for attractions: ${viatorUrl}`)
    
    // Open in new tab
    window.open(viatorUrl, '_blank')
  }
  
  // Handle Find Accommodation button click - now opens TripAdvisor search in new tab
  const handleFindAccommodation = () => {
    if (!endCoords || !endLocation) {
      console.log('Cannot find accommodation: No destination set')
      return
    }
    
    // Extract location details
    const { city, region, fullLocation } = extractLocationDetails(endLocation)
    
    // Create a more effective TripAdvisor URL
    // Include both city and region in the search query if available
    const searchQuery = region ? `${city}, ${region} hotels` : `${city} hotels`
    
    // For now, use the search approach which is more forgiving with destination names
    const tripAdvisorUrl = `https://www.tripadvisor.com/Search?q=${encodeURIComponent(searchQuery)}&searchSessionId=road-trip-calc-${Date.now()}`
    
    console.log(`Opening TripAdvisor search for hotels in ${fullLocation}: ${tripAdvisorUrl}`)
    
    // Open in new tab
    window.open(tripAdvisorUrl, '_blank')
  }
  
  // Only show buttons when we have a destination
  useEffect(() => {
    // Only show buttons when we have a route and destination
    const hasDestination = mapFullyReady && routeGeometry && endCoords && endLocation
    
    setShowAttractionButton(hasDestination)
    setShowAccommodationButton(hasDestination)
    
  }, [mapFullyReady, routeGeometry, endCoords, endLocation])
  
  return (
    <div className="flex flex-col h-full w-full">
      {/* POI Controls positioned OUTSIDE the map */}
      {mapFullyReady && (
        <MapPOIControls 
          activeLayers={activeLayers}
          onChange={handleLayerChange}
        />
      )}
      
      {/* Map container */}
      <div className="relative flex-grow">
      <div ref={mapContainerRef} className="h-full w-full" />
        
        {/* Service Markers (POIs) - Only add when map is fully ready */}
        {mapFullyReady && mapRef.current && routeGeometry && startCoords && endCoords && (
          <ServiceMarkers
            map={mapRef.current}
            routeGeometry={routeGeometry}
            startCoords={startCoords}
            endCoords={endCoords}
            activeLayers={activeLayers}
            onPOIClick={handlePOIClick}
            onCountUpdate={updatePOICount}
            onSelectPOI={onSelectPOI}
          />
        )}
        
        {/* Map Action Buttons */}
        {mapFullyReady && (
          <MapActionButtons
            showAttractions={showAttractionButton}
            showAccommodation={showAccommodationButton}
            onFindAttractions={handleFindAttractions}
            onFindAccommodation={handleFindAccommodation}
          />
        )}
        
        {/* Map Status Indicator */}
      {mapStatus && (
        <div className="absolute bottom-2 left-2 right-2 bg-gray-800 bg-opacity-70 text-white text-xs p-1 rounded">
          {mapStatus}
          {isFallbackRoute && (
            <span className="ml-2 px-1 py-0.5 bg-amber-600 text-white rounded text-xs">Fallback Route</span>
          )}
        </div>
      )}
        
        {/* Debugging indicator - only show in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="fixed bottom-2 right-2 text-xs bg-black bg-opacity-70 text-white p-1 rounded z-50">
            {debugInfo}
          </div>
        )}
      </div>
    </div>
  )
}

export default RoadTripMap 