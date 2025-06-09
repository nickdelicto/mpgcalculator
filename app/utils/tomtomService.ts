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
  if (poi.openingHours && category !== 'hotels') {
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
      // Add website only for non-hotel POIs
      ...(category !== 'hotels' && poi.url ? { website: poi.url } : {}),
      // Add additional extracted information
      ...poiExtras
    },
    // Add icon property to satisfy POI interface
    icon: category
  };
};

/**
 * Search for POIs along a route using TomTom API
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
    
    // For attractions, only use the destination point
    if (poiType === 'attractions') {
      const lastCoord = coordinates[coordinates.length - 1];
      const destination = { lng: lastCoord[0], lat: lastCoord[1] };
      
      console.log(`[TomTom] Searching for attractions only at destination: lat=${destination.lat}, lng=${destination.lng}`);
      
      // Search for attractions at the destination only with a larger radius
      const pois = await searchPOIsAroundPoint(destination, categoryId, 15000); // 15km radius
      
      // Convert to our internal format
      const convertedPOIs = pois.map(poi => convertTomTomPOI(poi, poiType));
      console.log(`[TomTom] Found ${convertedPOIs.length} attractions at destination`);
      
      return convertedPOIs;
    } else {
      // For other POI types, use the original sampling approach
      // For longer routes, sample points along the route to search around
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
    }
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
  categoryId: string,
  radius: number = 5000 // Default 5km radius
): Promise<any[]> => {
  // TomTom API parameters
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
};

/**
 * Convert miles to meters
 */
const milesToMeters = (miles: number): number => {
  return miles * 1609.34;
};

/**
 * Get appropriate search radius for POI type
 */
const getSearchRadiusForPOI = (poiType: string): number => {
  // Different POI types have different reasonable search radii
  const radii: Record<string, number> = {
    gasStations: 5000,    // 5km for gas stations
    evCharging: 10000,    // 10km for EV charging
    hotels: 5000,         // 5km for hotels
    restaurants: 3000,    // 3km for restaurants
    attractions: 10000    // 10km for attractions
  };
  
  return radii[poiType] || 5000; // Default to 5km
};

/**
 * Search for POIs near a destination
 */
export const searchPOIsNearDestination = async (
  destination: Coordinates,
  poiTypes: string[]
): Promise<{[key: string]: POI[]}> => {
  if (!TOMTOM_API_KEY) {
    console.error('TomTom API key not found');
    throw new Error('TomTom API key not configured');
  }
  
  try {
    // Create an object to store POIs by type
    const result: {[key: string]: POI[]} = {};
    
    // Perform searches for each POI type
    const searchPromises = poiTypes.map(async (poiType) => {
      // Get TomTom category ID
      const categoryId = CATEGORY_MAPPING[poiType as keyof typeof CATEGORY_MAPPING];
      if (!categoryId) {
        console.warn(`Unknown POI type: ${poiType}`);
        return;
      }
      
      // Determine appropriate search radius for this POI type
      const radius = getSearchRadiusForPOI(poiType);
      
      // Search for POIs
      const pois = await searchPOIsWithRadius(destination, categoryId, radius);
      
      // Convert to our internal format
      result[poiType] = pois.map(poi => convertTomTomPOI(poi, poiType));
    });
    
    // Wait for all searches to complete
    await Promise.all(searchPromises);
    
    return result;
  } catch (error) {
    console.error('Error searching for POIs with TomTom API:', error);
    return {};
  }
};

/**
 * Batch search for POIs near a destination
 */
const batchSearchPOIsNearDestination = async (
  destination: Coordinates,
  poiTypes: string[]
): Promise<{[key: string]: POI[]}> => {
  if (!TOMTOM_API_KEY) {
    console.error('TomTom API key not found');
    throw new Error('TomTom API key not configured');
  }
  
  try {
    // Create batch request URL
    const batchRequests = poiTypes.map(poiType => {
      // Get TomTom category ID
      const categoryId = CATEGORY_MAPPING[poiType as keyof typeof CATEGORY_MAPPING];
      if (!categoryId) {
        console.warn(`Unknown POI type: ${poiType}`);
        return null;
      }
      
      // Determine appropriate search radius for this POI type
      const radius = getSearchRadiusForPOI(poiType);
      
      // Create batch request
      return {
        query: `nearby/${destination.lat},${destination.lng}.json?key=${TOMTOM_API_KEY}&radius=${radius}&limit=20&categorySet=${categoryId}`,
        poiType
      };
    }).filter(Boolean);
    
    if (batchRequests.length === 0) {
      throw new Error('No valid POI types to search for');
    }
    
    // Construct batch request
    const batchUrl = 'https://api.tomtom.com/search/2/batch.json';
    const batchData = {
      batchItems: batchRequests.map(req => ({
        query: `/search/2/${req?.query}`
      }))
    };
    
    // Make batch request
    const response = await fetch(batchUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(batchData)
    });
    
    if (!response.ok) {
      throw new Error(`TomTom API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Process batch response
    const result: {[key: string]: POI[]} = {};
    
    if (data.batchItems && Array.isArray(data.batchItems)) {
      data.batchItems.forEach((item: any, index: number) => {
        if (item.statusCode === 200 && item.response && item.response.results) {
          const poiType = batchRequests[index]?.poiType;
          if (poiType) {
            result[poiType] = item.response.results.map((poi: any) => 
              convertTomTomPOI(poi, poiType)
            );
          }
        }
      });
    }
    
    return result;
  } catch (error) {
    console.error('Error performing batch search with TomTom API:', error);
    return {};
  }
};

/**
 * Search for POIs within a specified radius
 */
const searchPOIsWithRadius = async (
  point: Coordinates,
  categoryId: string,
  radius: number = 5000 // Default 5km radius
): Promise<any[]> => {
  // TomTom API parameters
  const limit = 20; // Maximum 20 results
  
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
 * Fetch detailed information about a POI by its TomTom ID
 */
export const fetchPOIDetails = async (poiId: string): Promise<any> => {
  if (!poiId) {
    console.error('POI ID is required to fetch details');
    return null;
  }
  
  if (!TOMTOM_API_KEY) {
    console.error('TomTom API key not found');
    return null;
  }
  
  try {
    // Use the Place API endpoint
    const url = `https://api.tomtom.com/search/2/place.json?key=${TOMTOM_API_KEY}&entityId=${poiId}`;
    
    console.log(`Fetching POI details for ID: ${poiId}`);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`TomTom Place API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching POI details:', error);
    throw error;
  }
};

/**
 * Enhanced version of the convertTomTomPOI function that can handle detailed POI information
 */
export const convertTomTomPOIWithDetails = (
  result: any, 
  category: string,
  detailsData?: any
): POI => {
  // Start with basic POI conversion
  const poi = convertTomTomPOI(result, category);
  
  // If we have detailed data, enhance the POI
  if (detailsData && detailsData.results && detailsData.results.length > 0) {
    const details = detailsData.results[0];
    
    // Enhanced POI tags
    if (details.poi) {
      // Website URL
      if (details.poi.url) {
        poi.tags.website = details.poi.url;
      }
      
      // Enhanced description
      if (details.poi.descriptions && details.poi.descriptions.length > 0) {
        poi.tags.description = details.poi.descriptions[0].text;
      }
      
      // Enhanced opening hours
      if (details.poi.openingHours && details.poi.openingHours.timeRanges) {
        // This would be handled by the base convertTomTomPOI function
      }
    }
    
    // Enhanced address information
    if (details.address) {
      poi.tags.address = details.address.freeformAddress;
      
      if (details.address.streetNumber) {
        poi.tags.street_number = details.address.streetNumber;
      }
      
      if (details.address.streetName) {
        poi.tags.street = details.address.streetName;
      }
      
      if (details.address.municipality) {
        poi.tags.city = details.address.municipality;
      }
      
      if (details.address.postalCode) {
        poi.tags.postcode = details.address.postalCode;
      }
    }
  }
  
  return poi;
};

/**
 * Fallback to mock data if TomTom API fails or for development
 */
export const getFallbackPOIs = async (
  routeGeometry: any,
  poiType: string
): Promise<POI[]> => {
  // Simplified fallback
  const startCoord = routeGeometry.coordinates[0];
  const endCoord = routeGeometry.coordinates[routeGeometry.coordinates.length - 1];
  
  // Create a few fallback POIs near the start and end of route
  const fallbackPOIs: POI[] = [];
  
  // Add POIs near start
  fallbackPOIs.push({
    id: `fallback-${poiType}-start-1`,
    name: `${poiType.charAt(0).toUpperCase() + poiType.slice(1)} Near Start`,
    type: poiType,
    location: {
      lat: startCoord[1] + 0.01,
      lng: startCoord[0] + 0.01
    },
    icon: poiType,
    tags: {
      address: 'Near Starting Point'
    }
  });
  
  // Add POIs near end
  fallbackPOIs.push({
    id: `fallback-${poiType}-end-1`,
    name: `${poiType.charAt(0).toUpperCase() + poiType.slice(1)} Near Destination`,
    type: poiType,
    location: {
      lat: endCoord[1] - 0.01,
      lng: endCoord[0] - 0.01
    },
    icon: poiType,
    tags: {
      address: 'Near Destination'
    }
  });
  
  return fallbackPOIs;
}; 