// Utility functions for geocoding and routing using OpenRouteService API through our proxy

// Import the polyline decoder
import { decodePolyline } from './polyline';

// Get a free API key from https://openrouteservice.org/dev/#/signup
const ORS_API_KEY = process.env.NEXT_PUBLIC_ORS_API_KEY || '';

// Debug logs
console.log('OpenRouteService config:', { 
  hasApiKey: !!ORS_API_KEY, 
  keyLength: ORS_API_KEY?.length || 0 
});

// Define types for our geocoding and routing functions
export interface Coordinates {
  lat: number;
  lng: number;
}

export interface RouteStep {
  instruction: string;
  distance: number; // in meters
  duration: number; // in seconds
  type: number; // maneuver type
  name: string; // road name
  way_points: number[]; // indices into geometry
}

export interface RouteSegment {
  distance: number;
  duration: number;
  steps: RouteStep[];
}

export interface RouteData {
  distance: number; // in meters
  duration: number; // in seconds
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  routeGeometry: any; // GeoJSON geometry
  segments?: RouteSegment[]; // Add segments with steps
}

/**
 * Geocode an address to coordinates
 * @param {string} address - The address to geocode
 * @returns {Promise<Coordinates>} - The coordinates
 */
export async function geocodeAddress(address: string): Promise<Coordinates> {
  console.log('Geocoding address:', address);
  try {
    // Check if we have an API key
    if (!ORS_API_KEY) {
      console.warn('No OpenRouteService API key provided. Using fallback geocoding.');
      return fallbackGeocode(address);
    }
    
    // Try to use our proxy API endpoint first
    try {
      // Use our proxy API to avoid CORS issues
      const url = `/api/route/geocode?text=${encodeURIComponent(address)}`;
      console.log('Geocoding via proxy URL:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Geocoding API error response:', errorText);
        throw new Error(`Geocoding failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Geocoding response features:', data.features?.length || 0);
      
      // Check if we got valid results
      if (!data.features || data.features.length === 0) {
        console.warn('No geocoding results found, using fallback');
        return fallbackGeocode(address);
      }
      
      // Get coordinates from the first result - note the structure is [lng, lat]
      const [lng, lat] = data.features[0].geometry.coordinates;
      
      console.log('Geocoded coordinates:', { lat, lng });
      return { lat, lng };
    } catch (error) {
      console.error('Proxy geocoding error:', error);
      console.warn('Falling back to local geocoding due to proxy error');
      return fallbackGeocode(address);
    }
  } catch (error) {
    console.error('Geocoding error:', error);
    // Fall back to mock geocoding if API fails
    return fallbackGeocode(address);
  }
}

/**
 * Calculate a route between two points
 * @param {Coordinates} start - The starting coordinates {lat, lng}
 * @param {Coordinates} end - The ending coordinates {lat, lng}
 * @returns {Promise<RouteData>} - The route data
 */
export async function calculateRoute(start: Coordinates, end: Coordinates): Promise<RouteData> {
  console.log('Calculating route from', start, 'to', end);
  try {
    // Check if we have an API key
    if (!ORS_API_KEY) {
      console.warn('No OpenRouteService API key provided. Using fallback routing.');
      return fallbackRouteCalculation(start, end);
    }

    // Try to use our proxy API endpoint first
    try {
      const body = {
        coordinates: [
          [start.lng, start.lat],
          [end.lng, end.lat]
        ],
        format: 'geojson'
      };
      
      console.log('Route request body:', body);
      
      // Use our proxy API to avoid CORS issues
      const url = `/api/route/directions`;
      console.log('Routing via proxy URL:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Route API error response:', errorText);
        throw new Error(`Routing failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // For the directions API, the response might be in a different format
      // Check if it's using the bbox/routes format or the features format
      if (data.routes && data.routes.length > 0) {
        // Handle "routes" format response
        const route = data.routes[0];
        
        // Raw route geometry from API
        console.log('Raw route geometry from API:', 
          typeof route.geometry === 'string' ? 
          'Encoded string (length: ' + route.geometry.length + ')' : 
          route.geometry ? 
            `Object with ${route.geometry.coordinates ? route.geometry.coordinates.length : 0} coordinates` : 
            'null'
        );
        
        // Extract geometry - if it's an encoded polyline, we need to decode it
        let routeGeometry;
        if (typeof route.geometry === 'string') {
          try {
            // This is an encoded polyline - decode it to get coordinates
            const decodedCoordinates = decodePolyline(route.geometry);
            
            // Get the bbox from the API response for validation
            const bbox = route.bbox || data.bbox;
            
            // If we have a bounding box from API, use it to validate coordinates
            if (bbox && Array.isArray(bbox) && bbox.length >= 4) {
              console.log(`API provided bbox: ${bbox.join(', ')}`);
              
              // API bboxes are typically [minLng, minLat, maxLng, maxLat]
              const [minLng, minLat, maxLng, maxLat] = bbox;
              
              // Check if we need to correct flipped signs in coordinates
              const correctedCoordinates = correctCoordinateSignsIfNeeded(decodedCoordinates, { minLng, minLat, maxLng, maxLat });
              
              // Create a GeoJSON LineString from the corrected coordinates
              routeGeometry = {
                type: "LineString",
                coordinates: correctedCoordinates
              };
              
              console.log(`Successfully processed polyline to ${routeGeometry.coordinates.length} points`);
            } else {
              // If no bbox available, use the decoded coordinates directly
              routeGeometry = {
                type: "LineString",
                coordinates: decodedCoordinates
              };
              
              console.log(`Successfully decoded polyline to ${routeGeometry.coordinates.length} points`);
            }
          } catch (error) {
            console.error('Error decoding polyline:', error);
            // Fallback to simple line if decoding fails
            routeGeometry = {
              type: "LineString",
              coordinates: [
                [start.lng, start.lat],
                [end.lng, end.lat]
              ]
            };
            console.log('Error decoding polyline, using simplified line');
          }
        } else if (route.geometry && route.geometry.coordinates && route.geometry.coordinates.length > 0) {
          // This is a GeoJSON geometry with coordinates
          routeGeometry = {
            type: "LineString",
            coordinates: route.geometry.coordinates
          };
          console.log(`Using ${route.geometry.coordinates.length} points from API response`);
        } else if (route.segments && route.segments[0] && route.segments[0].steps) {
          // Try to extract waypoints from steps if geometry is missing
          console.log('Trying to extract coordinates from route steps');
          const waypoints = route.segments[0].steps
            .filter((step: any) => step.way_points && step.way_points.length)
            .flatMap((step: any) => step.way_points);
          
          if (waypoints.length > 0) {
            // If we have waypoints, create a simple route with them
            routeGeometry = {
              type: "LineString",
              coordinates: [
                [start.lng, start.lat],
                ...waypoints.map((wp: number) => [route.way_points[wp].lng, route.way_points[wp].lat]),
                [end.lng, end.lat]
              ]
            };
            console.log(`Created route with ${routeGeometry.coordinates.length} points from steps`);
          } else {
            // Fallback to simple line
            routeGeometry = {
              type: "LineString",
              coordinates: [
                [start.lng, start.lat],
                [end.lng, end.lat]
              ]
            };
            console.log('No steps with waypoints found, using simple line');
          }
        } else {
          // Fallback to simple line if no coordinates
          routeGeometry = {
            type: "LineString",
            coordinates: [
              [start.lng, start.lat],
              [end.lng, end.lat]
            ]
          };
          console.log('No geometry or valid coordinates found, using simple line');
        }
        
        // Create a standardized route data object
        const routeData: RouteData = {
          distance: route.summary.distance, // in meters
          duration: route.summary.duration, // in seconds
          startLat: start.lat,
          startLng: start.lng,
          endLat: end.lat,
          endLng: end.lng,
          routeGeometry: routeGeometry,
          segments: route.segments // Add segments with steps
        };
        
        // Check if we should consider this a fallback route despite getting API data
        const isEffectivelyFallback = routeGeometry.coordinates.length <= 2;
        
        console.log('Processed route data (routes format):', {
          distance: routeData.distance,
          duration: routeData.duration,
          points: routeData.routeGeometry.coordinates.length,
          isEffectivelyFallback
        });
        
        // If we only have 2 points, the API didn't give us a real route
        // Despite getting a response, we should indicate this is effectively a fallback
        if (isEffectivelyFallback) {
          console.warn('API returned only basic route information without detailed geometry');
        }
        
        return routeData;
      } else if (data.features && data.features[0]) {
        // Original "features" format - handle as before
        const routeData: RouteData = {
          distance: data.features[0].properties.summary.distance, // in meters
          duration: data.features[0].properties.summary.duration, // in seconds
          startLat: start.lat,
          startLng: start.lng,
          endLat: end.lat,
          endLng: end.lng,
          routeGeometry: data.features[0].geometry
        };
        
        console.log('Processed route data (features format):', {
          distance: routeData.distance,
          duration: routeData.duration,
          points: routeData.routeGeometry.coordinates.length
        });
        
        return routeData;
      } else {
        console.warn('Unexpected API response format:', data);
        throw new Error('Unexpected API response format');
      }
    } catch (error) {
      console.error('Proxy routing error:', error);
      console.warn('Falling back to local routing due to proxy error');
      return fallbackRouteCalculation(start, end);
    }
  } catch (error) {
    console.error('Routing error:', error);
    // Fall back to mock routing if API fails
    return fallbackRouteCalculation(start, end);
  }
}

/**
 * Fallback geocoding function with better location support
 * @param {string} address - The address to geocode
 * @returns {Promise<Coordinates>} - The coordinates
 */
function fallbackGeocode(address: string): Promise<Coordinates> {
  console.log('Using fallback geocoding for:', address);
  
  const addressLower = address.toLowerCase();
  
  // Better mapping of common locations to coordinates
  const locations: Record<string, Coordinates> = {
    'new york': { lat: 40.7128, lng: -74.0060 },
    'nyc': { lat: 40.7128, lng: -74.0060 },
    'los angeles': { lat: 34.0522, lng: -118.2437 },
    'la': { lat: 34.0522, lng: -118.2437 },
    'chicago': { lat: 41.8781, lng: -87.6298 },
    'houston': { lat: 29.7604, lng: -95.3698 },
    'phoenix': { lat: 33.4484, lng: -112.0740 },
    'philadelphia': { lat: 39.9526, lng: -75.1652 },
    'san antonio': { lat: 29.4241, lng: -98.4936 },
    'san diego': { lat: 32.7157, lng: -117.1611 },
    'dallas': { lat: 32.7767, lng: -96.7970 },
    'san francisco': { lat: 37.7749, lng: -122.4194 },
    'austin': { lat: 30.2672, lng: -97.7431 },
    'seattle': { lat: 47.6062, lng: -122.3321 },
    'denver': { lat: 39.7392, lng: -104.9903 },
    'boston': { lat: 42.3601, lng: -71.0589 },
    'miami': { lat: 25.7617, lng: -80.1918 },
    'atlanta': { lat: 33.7490, lng: -84.3880 },
    'washington': { lat: 38.9072, lng: -77.0369 },
    'washington dc': { lat: 38.9072, lng: -77.0369 },
    'dc': { lat: 38.9072, lng: -77.0369 },
    'binghamton': { lat: 42.0987, lng: -75.9180 },
    'syracuse': { lat: 43.0481, lng: -76.1474 },
    'ithaca': { lat: 42.4440, lng: -76.5019 },
    'buffalo': { lat: 42.8864, lng: -78.8784 },
    'rochester': { lat: 43.1566, lng: -77.6088 },
    'albany': { lat: 42.6526, lng: -73.7562 },
    'columbus': { lat: 39.9612, lng: -82.9988 },
  };
  
  // Check if we have coordinates for this location
  for (const [key, coords] of Object.entries(locations)) {
    if (addressLower.includes(key)) {
      console.log(`Found coordinates for "${address}" using key "${key}"`);
      return Promise.resolve(coords);
    }
  }
  
  // If location is not found in our map, generate coordinates in the Northeast US
  // (since we're dealing with NY locations)
  console.log(`No matching location found for "${address}", generating coordinates in Northeast US`);
  const lat = 41 + (Math.random() * 3);
  const lng = -75 + (Math.random() * 3);
  return Promise.resolve({ lat, lng });
}

/**
 * Fallback route calculation function
 * @param {Coordinates} start - The starting coordinates {lat, lng}
 * @param {Coordinates} end - The ending coordinates {lat, lng}
 * @returns {Promise<RouteData>} - The route data
 */
function fallbackRouteCalculation(start: Coordinates, end: Coordinates): Promise<RouteData> {
  console.log('Using fallback route calculation');
  // Calculate crow-flies distance (Haversine formula)
  const R = 6371e3; // Earth radius in meters
  const φ1 = start.lat * Math.PI/180;
  const φ2 = end.lat * Math.PI/180;
  const Δφ = (end.lat - start.lat) * Math.PI/180;
  const Δλ = (end.lng - start.lng) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  // Multiply by 1.3 to simulate road distance vs direct distance
  const roadDistance = distance * 1.3;
  
  // Assume average speed of 60 mph (26.8224 m/s)
  const duration = roadDistance / 26.8224;
  
  // Simple line string for the route
  const routeGeometry = {
    type: "LineString",
    coordinates: [
      [start.lng, start.lat],
      [end.lng, end.lat]
    ]
  };
  
  const result = {
    distance: roadDistance,
    duration: duration,
    startLat: start.lat,
    startLng: start.lng,
    endLat: end.lat,
    endLng: end.lng,
    routeGeometry
  };
  console.log('Fallback route result:', result);
  return Promise.resolve(result);
}

/**
 * Detects and corrects flipped signs in coordinates if needed
 * @param {Array<[number, number]>} coordinates - Array of [lng, lat] coordinates
 * @param {Object} bbox - Bounding box with minLng, minLat, maxLng, maxLat
 * @returns {Array<[number, number]>} - Corrected coordinates
 */
function correctCoordinateSignsIfNeeded(coordinates: [number, number][], bbox: { minLng: number, minLat: number, maxLng: number, maxLat: number }): [number, number][] {
  if (coordinates.length === 0) return coordinates;
  
  // First check if we have a sign problem by sampling a few coordinates
  const sampleSize = Math.min(10, coordinates.length);
  let incorrectLngSign = 0;
  let incorrectLatSign = 0;
  
  // Check first few coordinates against the bbox
  for (let i = 0; i < sampleSize; i++) {
    const [lng, lat] = coordinates[i];
    
    // Check if longitude sign appears flipped
    if ((bbox.minLng < 0 && lng > 0) || (bbox.minLng > 0 && lng < 0)) {
      incorrectLngSign++;
    }
    
    // Check if latitude sign appears flipped
    if ((bbox.minLat < 0 && lat > 0) || (bbox.minLat > 0 && lat < 0)) {
      incorrectLatSign++;
    }
  }
  
  // Determine if we need to flip signs based on majority of samples
  const shouldFlipLng = incorrectLngSign >= sampleSize / 2;
  const shouldFlipLat = incorrectLatSign >= sampleSize / 2;
  
  // If neither sign needs flipping, return original coordinates
  if (!shouldFlipLng && !shouldFlipLat) {
    return coordinates;
  }
  
  console.log(`Detected sign issue - flipping: lng=${shouldFlipLng}, lat=${shouldFlipLat}`);
  
  // Apply the correction to all coordinates
  const correctedCoordinates = coordinates.map(([lng, lat]) => {
    const correctedLng = shouldFlipLng ? -lng : lng;
    const correctedLat = shouldFlipLat ? -lat : lat;
    return [correctedLng, correctedLat] as [number, number];
  });
  
  // Final validation - ensure the corrected coordinates are within a reasonable range of the bbox
  const buffer = 1.0; // Allow 1 degree outside the bbox to accommodate route variations
  const validCoordinates = correctedCoordinates.filter(([lng, lat]) => {
    const isInRange = 
      lat >= bbox.minLat - buffer && 
      lat <= bbox.maxLat + buffer && 
      lng >= bbox.minLng - buffer && 
      lng <= bbox.maxLng + buffer;
      
    if (!isInRange) {
      console.warn(`Filtered out-of-range coordinate after correction: [${lng}, ${lat}]`);
    }
    
    return isInRange;
  });
  
  console.log(`Validated ${correctedCoordinates.length} coordinates to ${validCoordinates.length} valid coordinates`);
  
  // Ensure we have at least the start and end points if filtering was too aggressive
  if (validCoordinates.length < 2 && coordinates.length >= 2) {
    console.warn('Too few valid coordinates after filtering, using just the start and end points');
    return [coordinates[0], coordinates[coordinates.length - 1]];
  }
  
  return validCoordinates;
} 