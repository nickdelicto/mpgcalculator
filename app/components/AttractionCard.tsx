'use client'

import React from 'react'
import { Card } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { DollarSign, Star, MapPin, Clock, Camera, Navigation } from 'lucide-react'
import { POI } from '../utils/overpassService'
import { generateViatorDeepLink } from '../utils/viatorService'

// Your Viator affiliate ID
const VIATOR_AFFILIATE_ID = 'P00255194'; // Replace with your actual ID

interface AttractionCardProps {
  attraction: POI
  onClick: (attraction: POI) => void
}

const AttractionCard: React.FC<AttractionCardProps> = ({ attraction, onClick }) => {
  // Extract location part from address
  const getLocationPart = (address: string) => {
    if (!address) return '';
    
    // Try to extract city or neighborhood
    const parts = address.split(',');
    if (parts.length >= 2) {
      return parts[1].trim(); // Usually the second part is city/neighborhood
    }
    return parts[0].trim(); // Fallback to first part
  }
  
  // Generate a vibrant, deterministic color based on attraction name
  const getAttractionColor = (name: string) => {
    // Simple hash function to generate a number from the name
    const hash = Array.from(name).reduce(
      (acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0
    );
    
    // Use the hash to generate a hue value (0-360)
    const hue = Math.abs(hash % 360);
    
    // Return a vibrant color with fixed saturation and lightness
    return `hsl(${hue}, 85%, 45%)`;
  }
  
  // Format rating stars
  const renderRating = () => {
    if (!attraction.tags.rating) return null;
    
    const rating = parseFloat(attraction.tags.rating);
    if (isNaN(rating)) return null;
    
    return (
      <div className="flex items-center">
        <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
        <span className="ml-1 text-xs">{rating.toFixed(1)}</span>
        {attraction.tags.reviews && (
          <span className="text-xs text-gray-400 ml-1">
            ({attraction.tags.reviews} reviews)
          </span>
        )}
      </div>
    );
  }
  
  // Get attraction thumbnail
  const getThumbnail = () => {
    return attraction.tags.thumbnailHiResURL || 
           attraction.tags.thumbnailURL || 
           null;
  }
  
  // Get background color for attraction
  const bgColor = getAttractionColor(attraction.name);
  const thumbnail = getThumbnail();
  
  const handleBookNow = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the card's onClick
    
    // Generate deep link with affiliate ID
    let deepLink = '';
    let searchFallbackLink = '';
    
    if (attraction.viatorId) {
      console.log(`[AttractionCard] Creating Viator deep link for product: ${attraction.viatorId}`);
      
      // Campaign value can be added to track specific placements
      const campaignValue = 'road-trip-cost-calculator'; 
      
      // Extract destination information
      // For destination name, we'll use the first part of the address if available
      const addressParts = (attraction.tags.address || '').split(',');
      const destinationName = addressParts.length > 0 ? addressParts[0].trim() : '';
      
      // Extract destination ID if present in the approximateLocation field
      // Format: if we have something like "d12345" in tags.locationId or similar
      const destinationIdMatch = attraction.tags.locationId?.match(/d(\d+)/) || 
                                attraction.id.match(/d(\d+)/);
      const destinationId = destinationIdMatch ? destinationIdMatch[1] : undefined;
      
      // Log what we're using to build the URL
      console.log(`[AttractionCard] Building deep link with:`, {
        productCode: attraction.viatorId,
        productTitle: attraction.name,
        destinationName,
        destinationId: destinationId || 'UNKNOWN'
      });
      
      // Generate the primary deep link with all available information
      deepLink = generateViatorDeepLink(
        attraction.viatorId, 
        VIATOR_AFFILIATE_ID, 
        campaignValue,
        attraction.name,          // Product title
        destinationName,          // Destination name
        destinationId             // Destination ID
      );
      
      // Generate a destination-based fallback link - this is more reliable than search
      // Format is https://www.viator.com/[Destination]/d[DestinationID]-ttd
      
      // Slugify the destination name
      const slugify = (text: string): string => {
        if (!text) return '';
        return text
          .toString()
          .normalize('NFKD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9 ]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-');
      };
      
      const destinationSlug = slugify(destinationName);
      
      // Create either a destination-based fallback or a search fallback
      if (destinationSlug && destinationId) {
        // Create a reliable destination page URL with the canonical format we observed
        searchFallbackLink = `https://www.viator.com/${destinationSlug}/d${destinationId}-ttd?pid=${VIATOR_AFFILIATE_ID}&mcid=42383&medium=api&campaign=${campaignValue}`;
      } else {
        // Fall back to general search if we don't have destination info
        const searchParams = new URLSearchParams({
          q: attraction.name,
          pid: VIATOR_AFFILIATE_ID,
          mcid: '42383',
          medium: 'api',
          campaign: campaignValue
        });
        searchFallbackLink = `https://www.viator.com/search?${searchParams.toString()}`;
      }
    } else {
      // Fallback to a search on Viator
      console.log(`[AttractionCard] No viatorId found for "${attraction.name}", using search fallback`);
      
      // Get location part if available
      const locationPart = attraction.tags.address ? getLocationPart(attraction.tags.address) : '';
      
      // Create search URL with proper attribution parameters per Viator docs
      const searchParams = new URLSearchParams({
        pid: VIATOR_AFFILIATE_ID,
        mcid: '42383', // Add MCID parameter for proper attribution
        medium: 'api',
        campaign: 'road-trip-cost-calculator',
        q: attraction.name + (locationPart ? ` ${locationPart}` : '')
      });
      
      deepLink = `https://www.viator.com/search?${searchParams.toString()}`;
      searchFallbackLink = deepLink; // Same as primary link in this case
    }
    
    console.log(`[AttractionCard] Generated link: ${deepLink}`);
    
    // If Shift key is pressed, just log the link without opening it (for testing)
    if (e.shiftKey) {
      console.log(`%c[DEBUG] Link not opened - TEST MODE`, 'background: #ffeb3b; color: #000; font-weight: bold; padding: 3px;');
      console.log(`%cPrimary link (copy to test): ${deepLink}`, 'background: #e3f2fd; color: #0d47a1; padding: 5px; border-radius: 3px; font-family: monospace;');
      
      // Also log the search fallback link
      if (searchFallbackLink !== deepLink) {
        console.log(`%cSearch fallback link (if primary fails): ${searchFallbackLink}`, 'background: #e8f5e9; color: #2e7d32; padding: 5px; border-radius: 3px; font-family: monospace;');
      }
      
      // If Alt key is also pressed, test the search fallback link instead
      if (e.altKey) {
        console.log(`%c[DEBUG] Using search fallback link instead for testing`, 'background: #ff9800; color: #000; font-weight: bold; padding: 3px;');
        deepLink = searchFallbackLink;
      }
      
      // Add more detailed debug info
      console.log(`%c[DEBUG] Attraction Details:`, 'background: #2196f3; color: white; padding: 3px;');
      console.log({
        name: attraction.name,
        viatorId: attraction.viatorId || 'MISSING',
        address: attraction.tags.address || 'MISSING',
        locationPart: attraction.tags.address ? getLocationPart(attraction.tags.address) : 'MISSING'
      });
      
      return; // Don't open the URL
    }
    
    // Normal mode - open the URL
    window.open(deepLink, '_blank');
  };
  
  // For debugging - log the thumbnail URLs and price
  React.useEffect(() => {
    // Log detailed object with all values
    console.log(`Attraction "${attraction.name}" details:`, {
      thumbnailHiResURL: attraction.tags.thumbnailHiResURL || 'MISSING',
      thumbnailURL: attraction.tags.thumbnailURL || 'MISSING',
      price: attraction.tags.price || 'MISSING',
      rating: attraction.tags.rating || 'MISSING',
      reviews: attraction.tags.reviews || 'MISSING',
      address: attraction.tags.address || 'MISSING'
    });
    
    // Warn about any missing critical data
    if (!attraction.tags.thumbnailHiResURL && !attraction.tags.thumbnailURL) {
      console.warn(`⚠️ Missing thumbnail for attraction: ${attraction.name}`);
    }
    
    if (!attraction.tags.price) {
      console.warn(`⚠️ Missing price for attraction: ${attraction.name}`);
    }
    
    if (!attraction.tags.rating) {
      console.warn(`⚠️ Missing rating for attraction: ${attraction.name}`);
    }
  }, [attraction]);
  
  return (
    <Card 
      className="bg-white dark:bg-gray-100 border-gray-200 dark:border-gray-300 overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-xl hover:scale-[1.02] hover:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
      onClick={() => onClick(attraction)}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${attraction.name}`}
    >
      {/* Image section */}
      <div className="relative h-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-gray-800/70 to-transparent z-10" />
        
        {thumbnail ? (
          <img 
            src={thumbnail} 
            alt={attraction.name}
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const fallbackEl = e.currentTarget.parentElement?.querySelector('.fallback-bg');
              if (fallbackEl) fallbackEl.classList.remove('hidden');
            }}
          />
        ) : null}
        
        {/* Fallback background - always render but hide if we have a thumbnail */}
        <div 
          className={`fallback-bg absolute inset-0 flex flex-col items-center justify-center ${thumbnail ? 'hidden' : ''}`}
          style={{ backgroundColor: bgColor }}
        >
          <div className="flex items-center justify-center">
            <Camera className="h-10 w-10 text-white opacity-25 absolute" />
            <div className="relative flex items-center justify-center w-16 h-16 bg-white bg-opacity-20 rounded-full">
              <span className="text-white text-2xl font-bold">{attraction.name.charAt(0).toUpperCase()}</span>
            </div>
          </div>
        </div>
        
        {/* Price badge - make sure it's more visible */}
        {attraction.tags.price && (
          <div className="absolute top-2 right-2 bg-green-600 bg-opacity-90 px-2 py-1 rounded-full z-20 flex items-center">
            <DollarSign className="h-3 w-3 text-white mr-1" />
            <span className="text-white text-xs font-medium">{attraction.tags.price}</span>
          </div>
        )}
      </div>
      
      {/* Content section */}
      <div className="p-3">
        <h3 className="font-medium text-gray-800 text-sm mb-2 line-clamp-2 h-10">
          {attraction.name}
        </h3>
        
        <div className="flex items-center text-gray-600 text-xs mb-1">
          <MapPin className="h-3 w-3 mr-1 flex-shrink-0 text-gray-500" />
          <span className="truncate">{attraction.tags.address ? getLocationPart(attraction.tags.address) : 'Location info unavailable'}</span>
        </div>
        
        {/* Rating display - make more prominent */}
        <div className="mb-1">
          {renderRating() || (
            <div className="h-3 mb-1"></div> /* Empty space to maintain layout if no rating */
          )}
        </div>
        
        {/* Duration if available */}
        {attraction.tags.duration && (
          <div className="flex items-center text-gray-600 text-xs mb-2">
            <Clock className="h-3 w-3 mr-1 flex-shrink-0 text-gray-500" />
            <span>{attraction.tags.duration}</span>
          </div>
        )}
        
        <Button 
          className="w-full bg-purple-600 hover:bg-purple-500 text-xs h-8 mt-1"
          onClick={handleBookNow}
        >
          <DollarSign className="h-3 w-3 mr-1" />
          {attraction.tags.price && attraction.tags.price !== 'Price varies' 
            ? 'Book Now' 
            : 'Check Pricing'}
        </Button>
      </div>
    </Card>
  )
}

export default AttractionCard 