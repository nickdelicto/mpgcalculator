import { Coordinates } from './routingService';

// Type definitions
interface DestinationCenter {
  latitude: number;
  longitude: number;
}

export interface ViatorDestination {
  destinationId: number;
  name: string;
  type: string;
  parentDestinationId: number;
  lookupId: string;
  defaultCurrencyCode: string;
  timeZone: string;
  center?: DestinationCenter;
}

// Cache for destinations
let destinationsCache: ViatorDestination[] = [];
let lastFetchTime: number = 0;
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 1 week in milliseconds

// Function to fetch and cache destinations
export async function getViatorDestinations(forceRefresh = false): Promise<ViatorDestination[]> {
  const now = Date.now();
  
  // Use cache if available and not expired
  if (
    !forceRefresh && 
    destinationsCache.length > 0 && 
    lastFetchTime > 0 && 
    now - lastFetchTime < CACHE_DURATION
  ) {
    console.log('[ViatorDestination] Using cached destinations');
    return destinationsCache;
  }
  
  try {
    console.log('[ViatorDestination] Fetching destinations from API');
    const response = await fetch('/api/viator/destinations');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch destinations: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.destinations || !Array.isArray(data.destinations)) {
      throw new Error('Invalid destinations data format');
    }
    
    // Update cache
    destinationsCache = data.destinations;
    lastFetchTime = now;
    
    console.log(`[ViatorDestination] Cached ${destinationsCache.length} destinations`);
    return destinationsCache;
  } catch (error) {
    console.error('[ViatorDestination] Error fetching destinations:', error);
    
    // Return existing cache if available, even if expired
    if (destinationsCache.length > 0) {
      console.log('[ViatorDestination] Using expired cache due to fetch error');
      return destinationsCache;
    }
    
    // Return empty array if no cache available
    return [];
  }
}

// Function to find nearest destination to coordinates, prioritizing smaller geographical areas
export async function findNearestDestination(
  coords: Coordinates
): Promise<ViatorDestination | null> {
  try {
    // Get destinations (using cache if available)
    const destinations = await getViatorDestinations();
    
    // Filter destinations with valid coordinates
    const destinationsWithCoords = destinations.filter(
      dest => dest.center?.latitude && dest.center?.longitude
    );
    
    if (destinationsWithCoords.length === 0) {
      console.warn('[ViatorDestination] No destinations with coordinates found');
      return null;
    }

    // Define geographical hierarchy with same distance threshold (60 miles)
    const geoLevels = [
      { types: ['CITY', 'TOWN', 'VILLAGE'], maxDistanceMiles: 60 },
      { types: ['DISTRICT', 'COUNTY', 'ISLAND'], maxDistanceMiles: 60 },
      { types: ['REGION', 'STATE', 'PROVINCE'], maxDistanceMiles: 60 },
      { types: ['COUNTRY'], maxDistanceMiles: 120 } // Keep a larger fallback for countries
    ];
    
    // Group destinations by their geographic type
    const destByType: Record<string, ViatorDestination[]> = {};
    destinationsWithCoords.forEach(dest => {
      if (!destByType[dest.type]) {
        destByType[dest.type] = [];
      }
      destByType[dest.type].push(dest);
    });
    
    // Find closest destination at each geographic level
    for (const level of geoLevels) {
      let closestDest: ViatorDestination | null = null;
      let minDistance = Infinity;
      
      // Get all destinations that match the current geographic level
      const levelDestinations: ViatorDestination[] = [];
      level.types.forEach(type => {
        if (destByType[type]) {
          levelDestinations.push(...destByType[type]);
        }
      });
      
      // Skip if no destinations at this level
      if (levelDestinations.length === 0) {
        console.log(`[ViatorDestination] No destinations found for types: ${level.types.join(', ')}`);
        continue;
      }
      
      // Find the closest destination at this level
      for (const dest of levelDestinations) {
        if (!dest.center) continue;
        
        const distanceKm = calculateDistance(
          coords.lat,
          coords.lng,
          dest.center.latitude,
          dest.center.longitude
        );
        
        // Convert to miles for threshold checking
        const distanceMiles = distanceKm * 0.621371;
        
        if (distanceMiles < minDistance) {
          minDistance = distanceMiles;
          closestDest = dest;
        }
      }
      
      // If found a destination within the threshold for this level, return it
      if (closestDest && minDistance <= level.maxDistanceMiles) {
        console.log(`[ViatorDestination] Found nearest ${closestDest.type} destination: ${closestDest.name} (${closestDest.destinationId}), ${minDistance.toFixed(2)} miles away`);
        return closestDest;
      }
      
      // Log the closest destination at this level even if it's outside the threshold
      if (closestDest) {
        console.log(`[ViatorDestination] Closest ${closestDest.type} (${level.types.join('/')}) destination is ${closestDest.name}, but at ${minDistance.toFixed(2)} miles exceeds threshold of ${level.maxDistanceMiles} miles`);
      }
    }
    
    // If we get here, we couldn't find any destination within the thresholds
    // As a last resort, return the overall closest destination regardless of type
    let absoluteClosestDest: ViatorDestination | null = null;
    let absoluteMinDistance = Infinity;
    
    for (const dest of destinationsWithCoords) {
      if (!dest.center) continue;
      
      const distanceKm = calculateDistance(
        coords.lat,
        coords.lng,
        dest.center.latitude,
        dest.center.longitude
      );
      
      const distanceMiles = distanceKm * 0.621371;
      
      if (distanceMiles < absoluteMinDistance) {
        absoluteMinDistance = distanceMiles;
        absoluteClosestDest = dest;
      }
    }
    
    if (absoluteClosestDest && absoluteMinDistance <= 120) {
      console.log(`[ViatorDestination] Using fallback destination ${absoluteClosestDest.name} (${absoluteClosestDest.type}) despite being ${absoluteMinDistance.toFixed(2)} miles away`);
      return absoluteClosestDest;
    }
    
    console.log('[ViatorDestination] No suitable destinations found within 120 miles');
    return null;
  } catch (error) {
    console.error('[ViatorDestination] Error finding nearest destination:', error);
    return null;
  }
}

// Calculate distance between two points using Haversine formula (returns distance in kilometers)
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
} 