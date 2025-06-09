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
    if (attraction.viatorId) {
      deepLink = generateViatorDeepLink(attraction.viatorId, VIATOR_AFFILIATE_ID);
    } else {
      // Fallback to a search on Viator
      deepLink = `https://www.viator.com/search?pid=${VIATOR_AFFILIATE_ID}&q=${encodeURIComponent(attraction.name)}`;
    }
    
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
      className="bg-gray-800 hover:bg-gray-750 border-gray-700 overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-xl hover:border-purple-500"
      onClick={() => onClick(attraction)}
    >
      {/* Image section */}
      <div className="relative h-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent z-10" />
        
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
          <div className="absolute top-2 right-2 bg-black bg-opacity-80 px-2 py-1 rounded-full z-20 flex items-center">
            <DollarSign className="h-3 w-3 text-green-400 mr-1" />
            <span className="text-white text-xs font-medium">{attraction.tags.price}</span>
          </div>
        )}
      </div>
      
      {/* Content section */}
      <div className="p-3">
        <h3 className="font-medium text-white text-sm mb-2 line-clamp-2 h-10">
          {attraction.name}
        </h3>
        
        <div className="flex items-center text-gray-400 text-xs mb-1">
          <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
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
          <div className="flex items-center text-gray-400 text-xs mb-2">
            <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
            <span>{attraction.tags.duration}</span>
          </div>
        )}
        
        <Button 
          className="w-full bg-purple-700 hover:bg-purple-600 text-xs h-8 mt-1"
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