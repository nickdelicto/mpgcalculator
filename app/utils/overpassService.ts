/**
 * POI Service
 * 
 * This service provides functions to fetch Points of Interest (POIs) around a route.
 * Currently using mock data only.
 * Previously used Overpass API (OpenStreetMap) but integration was removed in preparation for TomTom API.
 */

import { Coordinates } from './routingService';
import { searchAttractionsAlongRoute } from './viatorService';

// Define POI category types
export type POICategory = {
  id: string;
  name: string;
  icon: string;
  query: string;
  color: string;
}

// POI result type
export type POI = {
  id: string;
  name: string;
  type: string;
  location: { lat: number; lng: number };
  tags: Record<string, string>;
  icon: string;
  tomtomId?: string; // Optional TomTom entity ID for fetching detailed information
  viatorId?: string; // Optional Viator product code for attractions
  approximateLocation?: boolean; // Flag to indicate if the location is approximate
}

// Define POI categories we want to support
export const POI_CATEGORIES: POICategory[] = [
  {
    id: 'gasStations',
    name: 'Gas Stations',
    icon: 'fuel',
    query: 'amenity=fuel',
    color: '#FF3B30'  // Red
  },
  {
    id: 'evCharging',
    name: 'EV Charging',
    icon: 'charging',
    query: 'amenity=charging_station',
    color: '#34C759'  // Green
  },
  {
    id: 'hotels',
    name: 'Hotels & Lodging',
    icon: 'hotel',
    query: 'tourism=hotel,motel,hostel',
    color: '#007AFF'  // Blue
  },
  {
    id: 'restaurants',
    name: 'Restaurants',
    icon: 'restaurant',
    query: 'amenity=restaurant',
    color: '#FF9500'  // Orange
  },
  {
    id: 'attractions',
    name: 'Attractions & Tours',
    icon: 'attraction',
    query: 'viator=attraction,tour,activity',  // Updated to indicate Viator source
    color: '#AF52DE'  // Purple
  }
];

/**
 * Fetch POIs along a route
 * Note: For attractions, we use the Viator API. For other categories, we use mock data.
 * 
 * @param routeGeometry - The route geometry object with coordinates
 * @param category - The POI category ID to fetch
 * @param bufferDistance - Buffer distance in meters around route points
 * @returns Array of POIs
 */
export async function fetchPOIsAlongRoute(
  routeGeometry: any, 
  category: string,
  bufferDistance: number = 2000
): Promise<POI[]> {
  // Validate inputs
  if (!routeGeometry || !routeGeometry.coordinates || routeGeometry.coordinates.length === 0) {
    console.error('Invalid route geometry');
    return [];
  }
  
  // Find the category info
  const categoryInfo = POI_CATEGORIES.find(c => c.id === category);
  if (!categoryInfo) {
    console.error('Invalid POI category');
    return [];
  }

  console.log(`[POI Service] Fetching POIs for category: ${category}`);

  // For attractions, use the Viator service
  if (category === 'attractions') {
    console.log('[POI Service] Attractions category detected - SHOULD use Viator service');
    try {
      console.log('[POI Service] Calling searchAttractionsAlongRoute...');
      const attractions = await searchAttractionsAlongRoute(routeGeometry);
      console.log(`[POI Service] Viator returned ${attractions.length} attractions`);
      return attractions;
    } catch (error) {
      console.error('[POI Service] Error calling Viator service:', error);
      console.log('[POI Service] Falling back to mock data for attractions');
    }
  } else {
    console.log(`[POI Service] Using mock data for category: ${category}`);
  }

  // For other categories, use mock data
  // Extract start and end coordinates for mock data generation
  let startCoords: Coordinates | null = null;
  let endCoords: Coordinates | null = null;
  
  if (routeGeometry.coordinates.length > 1) {
    const first = routeGeometry.coordinates[0];
    const last = routeGeometry.coordinates[routeGeometry.coordinates.length - 1];
    
    if (first && last && first.length >= 2 && last.length >= 2) {
      startCoords = { lng: first[0], lat: first[1] };
      endCoords = { lng: last[0], lat: last[1] };
    }
  }
  
  // If we don't have valid coordinates, return empty array
  if (!startCoords || !endCoords) {
    console.error('Could not extract start/end coordinates for mock POI generation');
    return [];
  }

  // Add a small delay to simulate network request
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Generate mock POIs - adjust count based on category for more realistic data
  const countMap: {[key: string]: number} = {
    'gasStations': 8,
    'evCharging': 5, 
    'hotels': 12,
    'restaurants': 15,
    'attractions': 7
  };
  
  const count = countMap[category] || 5;
  console.log(`Generating ${count} mock POIs for ${category}`);
  
  return generateMockPOIs(category, startCoords, endCoords, count);
}

/**
 * Sample route points (kept for future API integration)
 */
function sampleRoutePoints(coordinates: number[][], count: number): number[][] {
  if (coordinates.length <= count) return coordinates;
  
  const result = [];
  const step = Math.floor(coordinates.length / count);
  
  for (let i = 0; i < count; i++) {
    result.push(coordinates[i * step]);
  }
  
  // Always include the first and last point
  if (!result.includes(coordinates[0])) result.unshift(coordinates[0]);
  if (!result.includes(coordinates[coordinates.length - 1])) 
    result.push(coordinates[coordinates.length - 1]);
  
  return result;
}

/**
 * Mock function to generate test POIs
 */
export function generateMockPOIs(category: string, startCoords: Coordinates, endCoords: Coordinates, count: number = 5): POI[] {
  const categoryInfo = POI_CATEGORIES.find(c => c.id === category);
  if (!categoryInfo) return [];
  
  // Create a bounding box between start and end, with some padding
  const minLat = Math.min(startCoords.lat, endCoords.lat) - 0.05;
  const maxLat = Math.max(startCoords.lat, endCoords.lat) + 0.05;
  const minLng = Math.min(startCoords.lng, endCoords.lng) - 0.05;
  const maxLng = Math.max(startCoords.lng, endCoords.lng) + 0.05;
  
  const results: POI[] = [];
  
  for (let i = 0; i < count; i++) {
    // Generate random coordinates within the bounding box
    const lat = minLat + Math.random() * (maxLat - minLat);
    const lng = minLng + Math.random() * (maxLng - minLng);
    
    // Create mock POI data based on category
    let name, tags;
    
    switch (category) {
      case 'gasStations':
        name = `${['Shell', 'BP', 'Exxon', 'Chevron', 'Texaco'][Math.floor(Math.random() * 5)]} Gas Station`;
        tags = {
          brand: name.split(' ')[0],
          opening_hours: '24/7',
          amenity: 'fuel'
        };
        break;
      case 'hotels':
        name = `${['Grand', 'Royal', 'Comfort', 'Holiday', 'Best'][Math.floor(Math.random() * 5)]} ${['Hotel', 'Inn', 'Suites', 'Lodge', 'Motel'][Math.floor(Math.random() * 5)]}`;
        tags = {
          stars: String(Math.floor(Math.random() * 3) + 2),
          rooms: String(Math.floor(Math.random() * 50) + 20),
          tourism: 'hotel'
        };
        break;
      case 'restaurants':
        name = `${['Italian', 'Mexican', 'Chinese', 'American', 'Indian'][Math.floor(Math.random() * 5)]} ${['Restaurant', 'Cafe', 'Bistro', 'Diner', 'Eatery'][Math.floor(Math.random() * 5)]}`;
        tags = {
          cuisine: name.split(' ')[0].toLowerCase(),
          opening_hours: '11:00-22:00',
          amenity: 'restaurant'
        };
        break;
      case 'evCharging':
        name = `${['Tesla', 'Electrify', 'ChargePoint', 'EVgo', 'Blink'][Math.floor(Math.random() * 5)]} Charging Station`;
        tags = {
          operator: name.split(' ')[0],
          capacity: String(Math.floor(Math.random() * 6) + 2),
          amenity: 'charging_station'
        };
        break;
      case 'attractions':
        name = `${['Historic', 'National', 'City', 'Famous', 'Local'][Math.floor(Math.random() * 5)]} ${['Museum', 'Park', 'Monument', 'Gallery', 'Landmark'][Math.floor(Math.random() * 5)]}`;
        tags = {
          description: `A popular ${name.split(' ')[1].toLowerCase()} in the area`,
          tourism: 'attraction'
        };
        break;
      default:
        name = `${categoryInfo.name} #${i+1}`;
        tags = {};
    }
    
    results.push({
      id: `mock-${category}-${i}`,
      name,
      type: category,
      location: { lat, lng },
      tags,
      icon: categoryInfo.icon
    });
  }
  
  return results;
} 