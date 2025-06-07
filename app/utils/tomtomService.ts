import { Coordinates } from './routingService';
import { POI } from './overpassService';

// TomTom API key - replace with actual key from environment variable
const TOMTOM_API_KEY = process.env.NEXT_PUBLIC_TOMTOM_API_KEY || '';

// Log the presence of the API key (not the key itself for security)
console.log(`TomTom API key ${TOMTOM_API_KEY ? 'is configured' : 'is NOT configured'}`);
console.log('Make sure to set NEXT_PUBLIC_TOMTOM_API_KEY in your .env.local file');

// Category mapping between our internal categories and TomTom categories
const CATEGORY_MAPPING = {
  gasStations: '7311', // Petrol/Gasoline Station
  evCharging: '7309', // EV Charging Station
  hotels: '7314', // Hotel or Motel
  restaurants: '7315', // Restaurant
  attractions: '7376' // Tourist Attraction
};

// Convert TomTom POI response to our internal POI format
const convertTomTomPOI = (result: any, category: string): POI => {
  const { poi, address, position, entryPoints, phone } = result;
  
  // Extract additional information if available
  const poiExtras: Record<string, string> = {};
  
  // Handle phone numbers
  if (phone?.primary) {
    poiExtras.phone = phone.primary;
  }
  
  // Handle fuel type for gas stations
  if (category === 'gasStations' && poi.classifications) {
    const fuelTypes = poi.classifications
      .filter((c: any) => c.code === 'FUEL_TYPE')
      .map((c: any) => c.names?.[0] || '')
      .filter(Boolean);
    
    if (fuelTypes.length > 0) {
      poiExtras.fuel_type = fuelTypes.join(', ');
    }
  }
  
  // Opening hours in a more readable format
  let formattedHours = '';
  if (poi.openingHours) {
    try {
      // Combine all time ranges into a readable format
      const timeRanges = poi.openingHours.timeRanges || [];
      const daysMap: Record<string, string> = {
        'MONDAY': 'Mon',
        'TUESDAY': 'Tue',
        'WEDNESDAY': 'Wed',
        'THURSDAY': 'Thu',
        'FRIDAY': 'Fri',
        'SATURDAY': 'Sat',
        'SUNDAY': 'Sun'
      };
      
      // Group by days with same times
      const hoursByDay: Record<string, string[]> = {};
      
      timeRanges.forEach((range: any) => {
        const day = daysMap[range.day] || range.day;
        const time = `${range.startTime}-${range.endTime}`;
        
        if (!hoursByDay[time]) {
          hoursByDay[time] = [];
        }
        hoursByDay[time].push(day);
      });
      
      // Format as "Mon-Wed: 9:00-17:00, Thu-Fri: 9:00-20:00"
      formattedHours = Object.entries(hoursByDay).map(([time, days]) => {
        if (days.length === 7) {
          return `Daily: ${time}`;
        }
        return `${days.join(', ')}: ${time}`;
      }).join('; ');
    } catch (e) {
      console.warn('Error formatting opening hours:', e);
      
      // Fallback to simple format
      formattedHours = poi.openingHours?.timeRanges?.map((time: any) => 
        `${time.startTime}-${time.endTime}`
      ).join(', ') || '';
    }
  }
  
  return {
    id: result.id || `tomtom-${Math.random().toString(36).substring(2, 10)}`,
    name: poi.name || 'Unnamed Location',
    type: category,
    location: {
      lat: position.lat,
      lng: position.lon
    },
    tomtomId: result.id, // Store the TomTom ID for fetching detailed information later
    tags: {
      // Map TomTom fields to our tag structure
      brand: poi.brands?.[0]?.name || '',
      opening_hours: formattedHours,
      // For hotels
      stars: poi.classifications?.find((c: any) => c.code === 'HOTEL_STAR_RATING')?.value || '',
      // For restaurants
      cuisine: poi.classifications?.find((c: any) => c.code === 'CUISINE')?.names?.[0] || '',
      // Add any address info
      address: address?.freeformAddress || '',
      // Add additional extracted information
      ...poiExtras
    },
    // Add icon property to satisfy POI interface
    icon: category
  };
};

/**
 * Search for POIs along a route using TomTom API
 * 
 * @param routeGeometry GeoJSON LineString of the route
 * @param poiType Type of POI to search for
 * @returns Array of POIs
 */
export const searchPOIsAlongRoute = async (
  routeGeometry: any,
  poiType: string
): Promise<POI[]> => {
  if (!TOMTOM_API_KEY) {
    console.error('TomTom API key not found');
    throw new Error('TomTom API key not configured');
  }
  
  try {
    // Extract coordinates from route geometry
    const coordinates = routeGeometry.coordinates;
    
    if (!coordinates || coordinates.length === 0) {
      throw new Error('Invalid route geometry');
    }
    
    // Get TomTom category ID
    const categoryId = CATEGORY_MAPPING[poiType as keyof typeof CATEGORY_MAPPING];
    if (!categoryId) {
      throw new Error(`Unknown POI type: ${poiType}`);
    }
    
    // For longer routes, sample points along the route to search around
    // Choose a reasonable number of sample points
    const MAX_SAMPLE_POINTS = 5;
    const samplePoints = sampleRoutePoints(coordinates, MAX_SAMPLE_POINTS);
    
    // Search for POIs around each sample point
    const poisPromises = samplePoints.map(point => 
      searchPOIsAroundPoint(point, categoryId)
    );
    
    // Wait for all searches to complete
    const poisArrays = await Promise.all(poisPromises);
    
    // Flatten and deduplicate POIs by ID
    const uniquePOIs = deduplicatePOIs(
      poisArrays.flat().map(poi => convertTomTomPOI(poi, poiType))
    );
    
    return uniquePOIs;
  } catch (error) {
    console.error('Error searching for POIs with TomTom API:', error);
    throw error;
  }
};

/**
 * Sample points along a route to use as search centers
 */
const sampleRoutePoints = (
  coordinates: number[][],
  maxPoints: number
): Coordinates[] => {
  if (coordinates.length <= maxPoints) {
    // If we have fewer coordinates than requested sample points,
    // return all coordinates
    return coordinates.map(coord => ({ lng: coord[0], lat: coord[1] }));
  }
  
  // Calculate the step size to distribute sample points evenly
  const step = Math.floor(coordinates.length / maxPoints);
  const samplePoints: Coordinates[] = [];
  
  // Always include start and end points
  samplePoints.push({ lng: coordinates[0][0], lat: coordinates[0][1] });
  
  // Add middle points
  for (let i = 1; i < maxPoints - 1; i++) {
    const index = i * step;
    samplePoints.push({
      lng: coordinates[index][0],
      lat: coordinates[index][1]
    });
  }
  
  // Add end point if not already included
  const lastCoord = coordinates[coordinates.length - 1];
  samplePoints.push({ lng: lastCoord[0], lat: lastCoord[1] });
  
  return samplePoints;
};

/**
 * Search for POIs around a specific point
 */
const searchPOIsAroundPoint = async (
  point: Coordinates,
  categoryId: string
): Promise<any[]> => {
  // TomTom API parameters
  const radius = 5000; // 5km radius
  const limit = 10; // Maximum 10 results per point
  
  const url = `https://api.tomtom.com/search/2/nearbySearch/.json?key=${TOMTOM_API_KEY}&lat=${point.lat}&lon=${point.lng}&radius=${radius}&limit=${limit}&categorySet=${categoryId}`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`TomTom API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error searching TomTom API:', error);
    return [];
  }
};

/**
 * Deduplicate POIs by ID
 */
const deduplicatePOIs = (pois: POI[]): POI[] => {
  const uniquePOIs = new Map<string, POI>();
  
  pois.forEach(poi => {
    uniquePOIs.set(poi.id, poi);
  });
  
  return Array.from(uniquePOIs.values());
};

/**
 * Convert meters to miles
 */
const metersToMiles = (meters: number): number => {
  return meters * 0.000621371;
}

/**
 * Convert miles to meters
 */
const milesToMeters = (miles: number): number => {
  return miles * 1609.34;
}

/**
 * Get appropriate search radius in meters based on POI type
 * Different POI types have different optimal search distances
 */
const getSearchRadiusForPOI = (poiType: string): number => {
  // Use 10 miles for all POI types
  return milesToMeters(10);
};

/**
 * Search for POIs near destination using TomTom Batch Search API
 * This is more efficient than making multiple API calls for each POI type
 * 
 * @param destination Coordinates of the destination
 * @param poiTypes Array of POI types to search for
 * @returns Array of POIs grouped by type
 */
export const searchPOIsNearDestination = async (
  destination: Coordinates,
  poiTypes: string[]
): Promise<{[key: string]: POI[]}> => {
  if (!TOMTOM_API_KEY) {
    console.error('TomTom API key not found');
    throw new Error('TomTom API key not configured');
  }
  
  if (!destination || !poiTypes || poiTypes.length === 0) {
    return {};
  }
  
  try {
    // Filter out any POI types that don't have a category mapping
    const validPoiTypes = poiTypes.filter(type => 
      CATEGORY_MAPPING[type as keyof typeof CATEGORY_MAPPING]
    );
    
    if (validPoiTypes.length === 0) {
      return {};
    }
    
    console.log(`Searching for ${validPoiTypes.length} POI types near destination`);
    
    // If we only have one POI type, use a regular search
    if (validPoiTypes.length === 1) {
      const poiType = validPoiTypes[0];
      const categoryId = CATEGORY_MAPPING[poiType as keyof typeof CATEGORY_MAPPING];
      const radius = getSearchRadiusForPOI(poiType);
      
      console.log(`Using single search for ${poiType} with radius ${metersToMiles(radius).toFixed(1)} miles`);
      
      const results = await searchPOIsWithRadius(destination, categoryId, radius);
      
      const pois = results.map(result => convertTomTomPOI(result, poiType));
      
      return {
        [poiType]: pois
      };
    }
    
    // Otherwise, use batch search for efficiency
    const batchResults = await batchSearchPOIsNearDestination(destination, validPoiTypes);
    return batchResults;
  } catch (error) {
    console.error('Error searching for POIs near destination:', error);
    throw error;
  }
};

/**
 * Use TomTom Batch Search API to search for multiple POI types in a single request
 * This reduces the number of API calls and helps avoid rate limiting
 * 
 * @param destination Coordinates of the destination
 * @param poiTypes Array of POI types to search for
 * @returns Object with POI arrays by type
 */
const batchSearchPOIsNearDestination = async (
  destination: Coordinates,
  poiTypes: string[]
): Promise<{[key: string]: POI[]}> => {
  try {
    // Prepare batch items for each POI type
    const batchItems = poiTypes.map(poiType => {
      const categoryId = CATEGORY_MAPPING[poiType as keyof typeof CATEGORY_MAPPING];
      const radius = getSearchRadiusForPOI(poiType);
      
      // Format the query for this POI type
      return {
        query: `/search/2/nearbySearch/.json?lat=${destination.lat}&lon=${destination.lng}&radius=${radius}&limit=15&categorySet=${categoryId}&openingHours=nextSevenDays`
      };
    });
    
    console.log(`Created batch with ${batchItems.length} items for destination POI search`);
    
    // Call the TomTom Batch Search API
    const url = `https://api.tomtom.com/search/2/batch/sync.json?key=${TOMTOM_API_KEY}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        batchItems
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`TomTom Batch API error: ${response.status} ${response.statusText}`, errorText);
      
      // If rate limited, implement exponential backoff
      if (response.status === 429) {
        throw new Error('TomTom API rate limit exceeded');
      }
      
      throw new Error(`TomTom Batch API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Process batch responses
    const result: {[key: string]: POI[]} = {};
    
    if (data.batchItems && Array.isArray(data.batchItems)) {
      data.batchItems.forEach((item: any, index: number) => {
        const poiType = poiTypes[index];
        
        if (item.statusCode === 200 && item.response && item.response.results) {
          // Convert the TomTom POIs to our internal format
          const pois = item.response.results.map((poi: any) => 
            convertTomTomPOI(poi, poiType)
          );
          
          result[poiType] = pois;
          console.log(`Found ${pois.length} POIs for ${poiType}`);
        } else {
          console.warn(`No results or error for ${poiType}:`, item.statusCode, item.errorText);
          result[poiType] = [];
        }
      });
    }
    
    return result;
  } catch (error) {
    console.error('Error in batch search:', error);
    
    // Fallback to individual searches if batch fails
    console.log('Falling back to individual searches for each POI type');
    
    const result: {[key: string]: POI[]} = {};
    
    // Process each POI type individually as a fallback
    for (const poiType of poiTypes) {
      try {
        const categoryId = CATEGORY_MAPPING[poiType as keyof typeof CATEGORY_MAPPING];
        const radius = getSearchRadiusForPOI(poiType);
        
        const poiResults = await searchPOIsWithRadius(
          destination, 
          categoryId,
          radius
        );
        
        result[poiType] = poiResults.map(poi => convertTomTomPOI(poi, poiType));
      } catch (poiError) {
        console.error(`Error searching for ${poiType}:`, poiError);
        result[poiType] = [];
      }
    }
    
    return result;
  }
};

/**
 * Enhanced version of searchPOIsAroundPoint with customizable radius
 */
const searchPOIsWithRadius = async (
  point: Coordinates,
  categoryId: string,
  radius: number = 5000 // Default 5km radius
): Promise<any[]> => {
  // TomTom API parameters
  const limit = 15; // Maximum 15 results per point
  
  const url = `https://api.tomtom.com/search/2/nearbySearch/.json?key=${TOMTOM_API_KEY}&lat=${point.lat}&lon=${point.lng}&radius=${radius}&limit=${limit}&categorySet=${categoryId}&openingHours=nextSevenDays`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`TomTom API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error searching TomTom API:', error);
    return [];
  }
};

/**
 * Fetch detailed POI information from TomTom's Place API
 * This provides rich information including photos, website, complete opening hours, etc.
 * 
 * @param poiId The ID of the POI from the initial search results
 * @returns Enhanced POI data with detailed information
 */
export const fetchPOIDetails = async (poiId: string): Promise<any> => {
  if (!TOMTOM_API_KEY) {
    console.error('TomTom API key not found');
    throw new Error('TomTom API key not configured');
  }
  
  try {
    // Use the Place API endpoint with useful parameters
    const url = `https://api.tomtom.com/search/2/place.json?entityId=${poiId}&key=${TOMTOM_API_KEY}&openingHours=nextSevenDays&timeZone=iana&relatedPois=all`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`TomTom Place API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching POI details from TomTom API:', error);
    throw error;
  }
};

/**
 * Enhanced version of the convertTomTomPOI function that can handle detailed POI information
 * 
 * @param result The POI data from TomTom
 * @param category The POI category
 * @param detailsData Optional detailed data from the Place API
 * @returns A POI object with enhanced details
 */
export const convertTomTomPOIWithDetails = (
  result: any, 
  category: string,
  detailsData?: any
): POI => {
  // Start with the basic POI conversion
  const basePOI = convertTomTomPOI(result, category);
  
  // If we have detailed data, enhance the POI
  if (detailsData && detailsData.results && detailsData.results.length > 0) {
    const poiDetails = detailsData.results[0];
    
    // Format detailed opening hours if available
    let detailedHours = '';
    if (poiDetails.poi?.openingHours?.timeRanges) {
      try {
        // This gives a more accurate representation of opening hours
        const timeRanges = poiDetails.poi.openingHours.timeRanges;
        const formattedRanges = timeRanges.slice(0, 3).map((range: any) => {
          return `${range.startTime.date.substring(5)} ${range.startTime.hour}:${String(range.startTime.minute).padStart(2, '0')}-${range.endTime.hour}:${String(range.endTime.minute).padStart(2, '0')}`;
        });
        
        detailedHours = formattedRanges.join(', ') + (timeRanges.length > 3 ? '...' : '');
      } catch (e) {
        console.warn('Error formatting detailed opening hours:', e);
      }
    }
    
    // Enhance the POI with detailed information
    return {
      ...basePOI,
      tags: {
        ...basePOI.tags,
        // Override with more detailed information if available
        phone: poiDetails.poi?.phone || basePOI.tags.phone,
        website: poiDetails.poi?.url || basePOI.tags.website,
        opening_hours: detailedHours || basePOI.tags.opening_hours,
        address: poiDetails.address?.freeformAddress || basePOI.tags.address,
        // Additional information that might be available
        description: poiDetails.poi?.descriptions?.[0]?.text || '',
        timeZone: poiDetails.poi?.timeZone?.ianaId || ''
      }
    };
  }
  
  return basePOI;
};

/**
 * Fallback to mock data if TomTom API fails or for development
 */
export const getFallbackPOIs = async (
  routeGeometry: any,
  poiType: string
): Promise<POI[]> => {
  // Import and use the existing mock data generation
  const { generateMockPOIs } = await import('./overpassService');
  
  // Extract start and end coordinates
  const coordinates = routeGeometry.coordinates;
  if (!coordinates || coordinates.length < 2) {
    return [];
  }
  
  const startCoord = {
    lat: coordinates[0][1],
    lng: coordinates[0][0]
  };
  
  const endCoord = {
    lat: coordinates[coordinates.length - 1][1],
    lng: coordinates[coordinates.length - 1][0]
  };
  
  // Call generateMockPOIs with the correct parameter order (category, start, end, count)
  return generateMockPOIs(poiType, startCoord, endCoord);
}; 