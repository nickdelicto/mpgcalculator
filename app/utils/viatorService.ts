import { Coordinates } from './routingService';
import { POI } from './overpassService';
import { searchPOIsNearDestination } from './tomtomService';
import { findNearestDestination } from './viatorDestinationService';

// Viator API key - replace with actual key from environment variable
const VIATOR_API_KEY = process.env.NEXT_PUBLIC_VIATOR_API_KEY || '';

// Log the presence of the API key (not the key itself for security)
console.log(`Viator API key ${VIATOR_API_KEY ? 'is configured' : 'is NOT configured'}`);
console.log('Make sure to set NEXT_PUBLIC_VIATOR_API_KEY in your .env.local file');

// Base URL for Viator API
const BASE_URL = 'https://api.viator.com/partner/';
const API_VERSION = 'v2';

// For our Basic API access, we'll be using these endpoints:
// - Search for attractions: GET /search/products
// - Get product details: GET /product/{productCode}

/**
 * Fetches attractions near a specific location using Viator's API
 */
export const searchAttractionsNearLocation = async (
  location: Coordinates,
  radius: number = 15 // default radius in km
): Promise<POI[]> => {
  console.log(`[Viator] Attempting to fetch attractions near lat:${location.lat}, lng:${location.lng}, radius:${radius}km`);
  
  if (!VIATOR_API_KEY) {
    console.warn('[Viator] API key not configured, using TomTom fallback');
    return fetchTomTomAttractions(location, radius);
  }

  try {
    // Find the nearest Viator destination to our coordinates
    const nearestDestination = await findNearestDestination(location);
    
    // Check if we found a destination
    if (!nearestDestination) {
      console.warn('[Viator] No valid destination found near coordinates, falling back to TomTom');
      return fetchTomTomAttractions(location, radius);
    }
    
    // Use the found destination ID
    const destinationId = nearestDestination.destinationId.toString();
    console.log(`[Viator] Using destination: ${nearestDestination.name} (${destinationId})`);
    
    // Define the request body according to Viator API specifications
    const requestData = {
      endpoint: 'products/search', // This will be extracted and used in the proxy
      filtering: {
        destination: destinationId
      },
      sorting: {
        sort: "TRAVELER_RATING",
        order: "DESCENDING"
      },
      pagination: {
        start: 1,
        count: 14 // Request at least 14 attractions
      },
      currency: "USD"
    };
    
    console.log(`[Viator] Making API request via proxy`);
    console.log(`[Viator] Request data:`, JSON.stringify(requestData));

    // Make the API request through our proxy endpoint
    const response = await fetch('/api/viator/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    });

    console.log(`[Viator] API response status: ${response.status}`);
    
    if (!response.ok) {
      console.error(`[Viator] API error: ${response.status} ${response.statusText}`);
      throw new Error(`Viator API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`[Viator] API returned ${data.products?.length || 0} products`);
    
    // Log a more detailed view of the first product to check available fields
    if (data.products?.length > 0) {
      const firstProduct = data.products[0];
      console.log(`[Viator] First product data structure:`, {
        productCode: firstProduct.productCode,
        title: firstProduct.title,
        hasImages: !!firstProduct.images?.length,
        imageCount: firstProduct.images?.length || 0,
        hasPrice: !!firstProduct.price,
        price: firstProduct.price,
        priceFields: firstProduct.price ? Object.keys(firstProduct.price) : [],
        hasThumbnail: !!firstProduct.thumbnailURL || !!firstProduct.thumbnailHiResURL,
        thumbnailURL: firstProduct.thumbnailURL,
        thumbnailHiResURL: firstProduct.thumbnailHiResURL,
        hasRating: !!firstProduct.rating,
        rating: firstProduct.rating,
        reviewCount: firstProduct.reviewCount
      });
      
      // If we don't have enough results, try to get more
      if (data.products?.length < 14 && data.products?.length > 0) {
        console.log(`[Viator] Fewer than 14 attractions found (${data.products.length}), attempting to get more`);
        
        // Request more results - up to 30 total
        const moreRequestData = {
          ...requestData,
          pagination: {
            start: 1,
            count: 30
          }
        };
        
        try {
          const moreResponse = await fetch('/api/viator/search', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(moreRequestData)
          });
          
          if (moreResponse.ok) {
            const moreData = await moreResponse.json();
            if (moreData.products?.length > data.products.length) {
              console.log(`[Viator] Successfully retrieved ${moreData.products.length} attractions (up from ${data.products.length})`);
              data.products = moreData.products;
            }
          }
        } catch (error) {
          console.warn('[Viator] Error fetching additional attractions, proceeding with current results');
        }
      }
      
      if (data.products?.length > 0) {
        const firstProduct = data.products[0];
        
        // Log a sample of the raw product data
        console.log('[Viator] Sample product:', JSON.stringify(firstProduct, null, 2).substring(0, 500) + '...');
        
        // Add more specific price debugging
        console.log('[Viator] Price-related fields in first product:', {
          'price object present': !!firstProduct.price,
          'price structure': firstProduct.price ? Object.keys(firstProduct.price).join(', ') : 'N/A',
          'fromPriceFormatted': firstProduct.price?.fromPriceFormatted || 'missing',
          'fromPrice raw': firstProduct.price?.fromPrice || 'missing',
          'priceFormatted': firstProduct.priceFormatted || 'missing',
          'bookingFeeFormatted': firstProduct.price?.bookingFeeFormatted || 'missing',
          'recommendedRetailPrice': firstProduct.price?.recommendedRetailPrice || 'missing'
        });
      } else {
        console.warn(`[Viator] No attractions found for destination ${nearestDestination.name}, falling back to TomTom`);
        return fetchTomTomAttractions(location, radius);
      }
    }
    
    // Calculate the distance from the user's destination to the Viator destination center
    let destinationDistance = undefined;
    if (nearestDestination.center && location) {
      const distanceKm = calculateDistance(
        location.lat, location.lng,
        nearestDestination.center.latitude, nearestDestination.center.longitude
      );
      destinationDistance = distanceKm * 0.621371; // Convert to miles
    }
    
    // Transform the Viator data to our POI format - pass the destination name for address context
    // and user's destination for approximate locations
    const pois = transformViatorToPOIs(data.products || [], nearestDestination.name, location, destinationDistance, nearestDestination.destinationId);
    console.log(`[Viator] Transformed ${pois.length} products to POIs`);
    return pois;
  } catch (error) {
    console.error('[Viator] Error fetching attractions:', error);
    console.log('[Viator] Falling back to TomTom attractions');
    
    return fetchTomTomAttractions(location, radius);
  }
};

/**
 * Fallback function to fetch attractions using TomTom API
 */
const fetchTomTomAttractions = async (
  location: Coordinates,
  radius: number = 15 // default radius in km
): Promise<POI[]> => {
  try {
    console.log(`[Viator-Fallback] Using TomTom to find attractions near lat:${location.lat}, lng:${location.lng}`);
    
    // Use TomTom to fetch attractions
    const poiTypes = ['attractions'];
    const poisByType = await searchPOIsNearDestination(location, poiTypes);
    
    // Get attractions from the result
    const attractions = poisByType['attractions'] || [];
    
    console.log(`[Viator-Fallback] TomTom returned ${attractions.length} attractions`);
    
    // Add Viator-specific fields to make the TomTom POIs match our expectations
    return attractions.map(poi => {
      return {
        ...poi,
        tags: {
          ...poi.tags,
          // Add placeholder price if not present
          price: poi.tags.price || 'Price varies',
          // Add placeholder duration if not present
          duration: poi.tags.duration || '1-3 hours'
        }
      };
    });
  } catch (error) {
    console.error('[Viator-Fallback] Error fetching from TomTom:', error);
    return [];
  }
};

/**
 * Fetches attractions along a route by sampling points
 */
export const searchAttractionsAlongRoute = async (
  routeGeometry: any
): Promise<POI[]> => {
  console.log('[Viator] Searching for attractions along route');
  
  if (!routeGeometry || !routeGeometry.coordinates || routeGeometry.coordinates.length === 0) {
    console.error('[Viator] Invalid route geometry');
    return [];
  }
  
  try {
    // Extract the destination coordinates (last point on the route)
    const coordinates = routeGeometry.coordinates;
    const destinationCoord = coordinates[coordinates.length - 1];
    
    if (!destinationCoord || destinationCoord.length < 2) {
      console.error('[Viator] Invalid destination coordinates');
      return [];
    }
    
    const destination = {
      lat: destinationCoord[1],
      lng: destinationCoord[0]
    };
    
    console.log(`[Viator] Searching for attractions at destination: lat=${destination.lat}, lng=${destination.lng}`);
    
    // Search for attractions at the destination with 15km radius
    // The searchAttractionsNearLocation function will try to get at least 14 attractions
    const attractions = await searchAttractionsNearLocation(destination, 15);
    console.log(`[Viator] Found ${attractions.length} attractions at destination`);
    
    return attractions;
  } catch (error) {
    console.error('[Viator] Error searching for attractions along route:', error);
    return [];
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
    return coordinates.map(coord => ({ lat: coord[1], lng: coord[0] }));
  }
  
  // Calculate the step size to distribute sample points evenly
  const step = Math.floor(coordinates.length / maxPoints);
  const samplePoints: Coordinates[] = [];
  
  // Always include start and end points
  samplePoints.push({ lat: coordinates[0][1], lng: coordinates[0][0] });
  
  // Add middle points
  for (let i = 1; i < maxPoints - 1; i++) {
    const index = i * step;
    samplePoints.push({
      lat: coordinates[index][1],
      lng: coordinates[index][0]
    });
  }
  
  // Add end point if not already included
  const lastCoord = coordinates[coordinates.length - 1];
  samplePoints.push({ lat: lastCoord[1], lng: lastCoord[0] });
  
  return samplePoints;
};

/**
 * Deduplicate attractions by ID
 */
const deduplicateAttractions = (attractions: POI[]): POI[] => {
  const uniqueAttractions = new Map<string, POI>();
  
  attractions.forEach(attraction => {
    uniqueAttractions.set(attraction.id, attraction);
  });
  
  return Array.from(uniqueAttractions.values());
};

/**
 * Transform Viator product data to our POI format
 */
const transformViatorToPOIs = (products: any[], destinationName?: string, userDestination?: Coordinates, destinationDistance?: number, destinationId?: number): POI[] => {
  return products.map(product => {
    // Extract price info
    let priceFormatted = product.price?.fromPriceFormatted || '';
    
    // If price is still empty, use a more generic fallback instead of location-specific prices
    if (!priceFormatted) {
      // Always use "Price varies" instead of hardcoded amounts to avoid misleading users
      priceFormatted = 'Price varies';
    }
    
    // Ensure consistent price formatting
    if (priceFormatted && !priceFormatted.toLowerCase().includes('from') && !priceFormatted.toLowerCase().includes('price varies')) {
      // If we have a price but it doesn't have "From" prefix, add it
      priceFormatted = `From ${priceFormatted.startsWith('$') ? '' : '$'}${priceFormatted}`;
    }
    
    // Extract location info - handle both response formats
    let location = { lat: 0, lng: 0 };
    let hasValidLocation = false;
    
    // Try to get coordinates from different possible locations in the API response
    if (product.primaryDestinationLatLng?.lat && product.primaryDestinationLatLng?.lng) {
      location = {
        lat: product.primaryDestinationLatLng.lat,
        lng: product.primaryDestinationLatLng.lng
      };
      hasValidLocation = true;
    } else if (product.location?.latitude && product.location?.longitude) {
      // Alternative location format in API response
      location = {
        lat: product.location.latitude,
        lng: product.location.longitude
      };
      hasValidLocation = true;
    } else if (product.latLng) {
      // Try the latLng string format (lat,lng)
      try {
        const [lat, lng] = product.latLng.split(',').map(parseFloat);
        if (!isNaN(lat) && !isNaN(lng)) {
          location = { lat, lng };
          hasValidLocation = true;
        }
      } catch (e) {
        console.warn('[Viator] Failed to parse latLng string:', product.latLng);
      }
    }
    
    // Extract image URLs - first try the direct thumbnailURL/thumbnailHiResURL fields
    let thumbnailURL = product.thumbnailURL || '';
    let thumbnailHiResURL = product.thumbnailHiResURL || '';
    
    // If direct thumbnails aren't available, try to extract from the images array
    if ((!thumbnailURL || !thumbnailHiResURL) && product.images && product.images.length > 0) {
      // Find the largest image for thumbnailHiResURL (preferably around 480x320)
      const image = product.images[0]; // Use the first image
      
      if (image.variants && image.variants.length > 0) {
        // Find medium resolution for thumbnailURL (around 200x200)
        const mediumVariant = image.variants.find((v: any) => v.width === 200) || 
                              image.variants.find((v: any) => v.width === 240) ||
                              image.variants[0];
                              
        // Find high resolution for thumbnailHiResURL (around 480x320)
        const hiResVariant = image.variants.find((v: any) => v.width === 480) || 
                             image.variants.find((v: any) => v.width >= 400) ||
                             image.variants[image.variants.length - 1]; // Largest available
        
        if (mediumVariant) thumbnailURL = mediumVariant.url;
        if (hiResVariant) thumbnailHiResURL = hiResVariant.url;
      }
    }
    
    // Extract rating from reviews object if direct rating is not available
    let rating = product.rating?.toString() || '';
    let reviewCount = product.reviewCount?.toString() || '';
    
    // Try to get rating from reviews object if not directly available
    if (!rating && product.reviews?.combinedAverageRating) {
      rating = product.reviews.combinedAverageRating.toString();
    }
    
    // Try to get review count from reviews object if not directly available
    if (!reviewCount && product.reviews?.totalReviews) {
      reviewCount = product.reviews.totalReviews.toString();
    }
    
    // Add fallback ratings for attractions without ratings
    if (!rating) {
      // For new or less-reviewed attractions, provide a reasonable default rating
      if (product.title.toLowerCase().includes('helicopter')) {
        // Helicopter tours typically have good ratings
        rating = '4.7';
        if (!reviewCount) reviewCount = 'New';
      } else if (product.title.toLowerCase().includes('tour')) {
        rating = '4.5';
        if (!reviewCount) reviewCount = 'New';
      } else {
        rating = '4.0';
        if (!reviewCount) reviewCount = 'New';
      }
    }
    
    // If we don't have valid coordinates but have user destination and the destination distance,
    // create a random position in the vicinity of the destination
    if (!hasValidLocation && userDestination) {
      // Use the user's destination as a fallback, with a small random offset
      // so attractions don't all stack on the same point
      const randomOffset = () => (Math.random() - 0.5) * 0.05; // Small random offset
      location = {
        lat: userDestination.lat + randomOffset(),
        lng: userDestination.lng + randomOffset()
      };
      
      // Mark the location as approximate for UI
      hasValidLocation = false;
    }
    
    // Create a unique ID
    const id = `viator-${product.productCode || product.code || Math.random().toString(36).substring(2, 10)}`;
    
    // Extract the Viator product code for deep linking
    const viatorId = product.productCode || product.code;
    if (!viatorId) {
      console.warn(`[Viator] No product code found for attraction "${product.title}"`);
    } else {
      console.log(`[Viator] Extracted product code for "${product.title}": ${viatorId}`);
    }
    
    // Handle duration which might be an object or string
    let durationStr = '';
    if (typeof product.duration === 'string') {
      durationStr = product.duration;
    } else if (product.duration?.fixedDurationInMinutes) {
      // Convert minutes to a readable format
      const mins = product.duration.fixedDurationInMinutes;
      if (mins < 60) {
        durationStr = `${mins} minutes`;
      } else {
        const hours = Math.floor(mins / 60);
        const remainingMins = mins % 60;
        durationStr = remainingMins > 0 ? 
          `${hours} hour${hours !== 1 ? 's' : ''} ${remainingMins} min` : 
          `${hours} hour${hours !== 1 ? 's' : ''}`;
      }
    } else {
      durationStr = 'Duration varies';
    }
    
    // Process address with destination context
    let addressWithRegion = product.primaryDestinationName || product.location?.address || '';
    
    // Add destination name if provided and not already in the address
    if (destinationName && !addressWithRegion.includes(destinationName)) {
      if (addressWithRegion) {
        addressWithRegion = `${addressWithRegion}, ${destinationName}`;
      } else {
        addressWithRegion = destinationName;
      }
    }
    
    // Add country information if available and not already in the address
    if (product.primaryCountryName && !addressWithRegion.includes(product.primaryCountryName)) {
      addressWithRegion = `${addressWithRegion}, ${product.primaryCountryName}`;
    }
    
    // Add distance information if available
    let distanceInfo = '';
    if (destinationDistance) {
      distanceInfo = `~Within ${Math.round(destinationDistance)} miles`;
    }
    
    // Log the important fields to debug image and price issues
    console.log(`[Viator] Processing product ${product.title}:`, {
      productCode: product.productCode,
      hasThumbnail: !!product.thumbnailURL || !!product.thumbnailHiResURL,
      thumbnailURL: product.thumbnailURL || 'MISSING',
      thumbnailHiResURL: product.thumbnailHiResURL || 'MISSING',
      price: priceFormatted || 'MISSING',
      rating: product.rating || 'MISSING',
      hasCoordinates: hasValidLocation,
      destinationInfo: {
        name: destinationName,
        distance: destinationDistance,
        id: destinationId
      }
    });
    
    // Format as POI
    return {
      id,
      name: product.title || product.name || 'Unnamed Attraction',
      type: 'attractions',
      location,
      viatorId: viatorId,
      approximateLocation: !hasValidLocation,
      tags: {
        price: priceFormatted,
        rating: rating,
        reviews: reviewCount,
        duration: durationStr,
        address: addressWithRegion,
        description: product.shortDescription || product.description || '',
        thumbnailURL: thumbnailURL,
        thumbnailHiResURL: thumbnailHiResURL,
        distance: distanceInfo,
        // Add destination ID to be used for URL construction
        locationId: destinationId ? `d${destinationId}` : ''
      },
      icon: 'attractions'
    };
  });
};

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

/**
 * Fetch detailed information about a specific attraction by its Viator product code
 */
export const getAttractionDetails = async (productCode: string): Promise<any> => {
  if (!VIATOR_API_KEY) {
    console.warn('[Viator] API key not configured, cannot fetch attraction details');
    return null;
  }
  
  try {
    // Use our proxy endpoint for product details
    const url = `/api/viator/product?productCode=${encodeURIComponent(productCode)}`;
    console.log(`[Viator] Fetching product details for: ${productCode}`);
    
    const response = await fetch(url);
    
    console.log(`[Viator] Product details API response status: ${response.status}`);
    
    if (!response.ok) {
      console.error(`[Viator] API error fetching product details: ${response.status} ${response.statusText}`);
      throw new Error(`Viator API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`[Viator] Successfully fetched details for product: ${productCode}`);
    
    return data;
  } catch (error) {
    console.error('[Viator] Error fetching attraction details:', error);
    return null;
  }
};

/**
 * Generate a Viator deep link for a product
 * Uses Viator's official URL format for reliable product linking
 */
export const generateViatorDeepLink = (
  productCode: string, 
  affiliateId: string, 
  campaignValue: string = '',
  productTitle?: string,
  destinationName?: string,
  destinationId?: string,
  mcid: string = '42383' // Default MCID parameter for attribution
): string => {
  if (!productCode) {
    console.error('[Viator] Cannot generate deep link: missing product code');
    return 'https://www.viator.com';
  }
  
  if (!affiliateId) {
    console.warn('[Viator] Generating deep link without affiliate ID - commission will not be tracked');
  }
  
  // Clean the product code (remove any spaces or unwanted characters)
  const cleanProductCode = productCode.trim();
  
  // Helper function to create URL-friendly slugs
  const slugify = (text: string): string => {
    if (!text) return '';
    
    return text
      .toString()
      .normalize('NFKD') // Split accented characters
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9 ]/g, '') // Remove non-alphanumeric characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-'); // Remove consecutive hyphens
  };
  
  // Construct the URL based on available information
  let baseUrl = '';
  
  // If we have all the components for a full SEO URL, use that format
  if (productTitle && destinationName && destinationId) {
    const destinationSlug = slugify(destinationName);
    const productTitleSlug = slugify(productTitle);
    
    // Format: /tours/[destination-slug]/[product-title-slug]/d[destinationId]-[productCode]
    baseUrl = `https://www.viator.com/tours/${destinationSlug}/${productTitleSlug}/d${destinationId}-${cleanProductCode}`;
    
    console.log(`[Viator] Constructed full SEO URL with destination and product title`);
  } else {
    // Fallback to the simpler format if we don't have all components
    baseUrl = `https://www.viator.com/tours/${cleanProductCode}`;
    console.log(`[Viator] Using simplified URL format (missing destination info or product title)`);
  }
  
  // Create URLSearchParams for proper parameter encoding
  const params = new URLSearchParams();
  
  // Add affiliate ID (required parameter)
  if (affiliateId) {
    params.append('pid', affiliateId);
  }
  
  // Add MCID parameter (required for proper attribution)
  params.append('mcid', mcid);
  
  // Add medium parameter (required for tracking the source)
  params.append('medium', 'api');
  
  // Add campaign tracking if provided
  if (campaignValue) {
    params.append('campaign', campaignValue);
  }
  
  // Combine URL and parameters
  const deepLink = `${baseUrl}?${params.toString()}`;
  
  // Log the deep link for debugging
  console.log(`[Viator] Generated product deep link: ${deepLink}`);
  
  return deepLink;
}; 