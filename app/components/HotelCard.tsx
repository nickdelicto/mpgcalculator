'use client'

import React from 'react'
import { Card } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { DollarSign, Star, MapPin, Building, Bed, Hotel } from 'lucide-react'
import { POI } from '../utils/overpassService'

interface HotelCardProps {
  hotel: POI
  onClick: (hotel: POI) => void
}

const HotelCard: React.FC<HotelCardProps> = ({ hotel, onClick }) => {
  // Extract city/neighborhood from address
  const getLocationPart = (address: string) => {
    if (!address) return '';
    
    // Try to extract city or neighborhood
    const parts = address.split(',');
    if (parts.length >= 2) {
      return parts[1].trim(); // Usually the second part is city/neighborhood
    }
    return parts[0].trim(); // Fallback to first part
  }
  
  // Format star rating if available
  const renderStars = () => {
    if (!hotel.tags.stars) return null;
    
    const stars = Number(hotel.tags.stars);
    if (isNaN(stars)) return null;
    
    // Create an array of stars based on rating
    return (
      <div className="flex items-center">
        {[...Array(Math.floor(stars))].map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        ))}
        {stars % 1 !== 0 && (
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 opacity-50" />
        )}
      </div>
    );
  }
  
  // Generate a vibrant, deterministic color based on hotel name
  const getHotelColor = (hotelName: string) => {
    // Simple hash function to generate a number from the hotel name
    const hash = Array.from(hotelName).reduce(
      (acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0
    );
    
    // Use the hash to generate a hue value (0-360)
    const hue = Math.abs(hash % 360);
    
    // Return a vibrant color with fixed saturation and lightness
    return `hsl(${hue}, 85%, 45%)`;
  }
  
  // Get hotel brand initial or first letter of name
  const getHotelInitial = () => {
    if (hotel.tags.brand && hotel.tags.brand.length > 0) {
      return hotel.tags.brand.charAt(0).toUpperCase();
    }
    return hotel.name.charAt(0).toUpperCase();
  }
  
  // Get background color for hotel
  const bgColor = getHotelColor(hotel.name);
  
  return (
    <Card 
      className="bg-white dark:bg-gray-100 border-gray-200 dark:border-gray-300 overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-xl hover:scale-[1.02] hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
      onClick={() => onClick(hotel)}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${hotel.name}`}
    >
      {/* Stylish Hotel Icon Display */}
      <div className="relative h-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-gray-800/70 to-transparent z-10" />
        
        {/* Elegant branded background with hotel icon */}
        <div 
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ backgroundColor: bgColor }}
        >
          <div className="flex items-center justify-center">
            <Hotel className="h-10 w-10 text-white opacity-25 absolute" />
            <div className="relative flex items-center justify-center w-16 h-16 bg-white bg-opacity-20 rounded-full">
              <span className="text-white text-2xl font-bold">{getHotelInitial()}</span>
            </div>
          </div>
        </div>
        
        {/* Star rating badge */}
        {hotel.tags.stars && (
          <div className="absolute top-2 right-2 bg-blue-600 bg-opacity-90 px-2 py-1 rounded-full z-20 flex items-center">
            {renderStars()}
          </div>
        )}
      </div>
      
      {/* Content section */}
      <div className="p-3">
        <h3 className="font-medium text-gray-800 text-sm mb-2 line-clamp-2 h-10">
          {hotel.name}
        </h3>
        
        <div className="flex items-center text-gray-600 text-xs mb-2">
          <MapPin className="h-3 w-3 mr-1 flex-shrink-0 text-gray-500" />
          <span className="truncate">{getLocationPart(hotel.tags.address || '')}</span>
        </div>
        
        {/* Display stars rating only if we actually have this data */}
        {hotel.tags.stars && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex">
              {renderStars()}
            </div>
            <span className="text-xs text-gray-600 ml-1">Rating</span>
          </div>
        )}

        {/* Display brand if available */}
        {hotel.tags.brand && (
          <div className="flex items-center text-xs text-gray-600 mb-2">
            <Hotel className="h-3 w-3 mr-1 flex-shrink-0 text-gray-500" />
            <span className="truncate">{hotel.tags.brand}</span>
          </div>
        )}
        
        <Button 
          className="w-full bg-blue-600 hover:bg-blue-500 text-xs h-8 mt-1"
          onClick={(e) => {
            e.stopPropagation(); // Prevent triggering the card's onClick
            window.open(`https://www.tripadvisor.com/Search?q=${encodeURIComponent(hotel.name + ' ' + (hotel.tags.address || ''))}`, '_blank');
          }}
        >
          <DollarSign className="h-3 w-3 mr-1" />
          Check Availability
        </Button>
      </div>
    </Card>
  )
}

export default HotelCard 