'use client'

import React, { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Coordinates } from '../utils/routingService'

// Define prop types for the map component
interface MapProps {
  startCoords?: Coordinates;
  endCoords?: Coordinates;
  routeGeometry?: any;
  isFallbackRoute?: boolean; // New prop to indicate if this is a fallback route
  startLocation?: string;
  endLocation?: string;
}

const RoadTripMap: React.FC<MapProps> = ({ 
  startCoords, 
  endCoords, 
  routeGeometry, 
  isFallbackRoute = false,
  startLocation = '',
  endLocation = ''
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
            weight: 9,
            opacity: 0.7,
            lineJoin: 'round',
            lineCap: 'round',
            className: 'route-outline'
          }).addTo(mapRef.current);
          
          // Create the main route line
          const routeLine = L.polyline([], {
            color: routeColor,
            weight: 6,
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
  
  return (
    <div className="relative h-full w-full">
      <div ref={mapContainerRef} className="h-full w-full" />
      {mapStatus && (
        <div className="absolute bottom-2 left-2 right-2 bg-gray-800 bg-opacity-70 text-white text-xs p-1 rounded">
          {mapStatus}
          {isFallbackRoute && (
            <span className="ml-2 px-1 py-0.5 bg-amber-600 text-white rounded text-xs">Fallback Route</span>
          )}
        </div>
      )}
    </div>
  )
}

export default RoadTripMap 