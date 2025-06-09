'use client'

import React from 'react'
import HotelCard from './HotelCard'
import { POI } from '../utils/overpassService'

interface HotelsListProps {
  hotels: POI[]
  onHotelSelect: (hotel: POI) => void
}

const HotelsList: React.FC<HotelsListProps> = ({ hotels, onHotelSelect }) => {
  // Limit to max 14 hotels as specified
  const limitedHotels = hotels.slice(0, 14)
  
  if (hotels.length === 0) {
    return (
      <div className="text-center p-6 text-gray-400">
        <p>No hotels found near your destination.</p>
        <p className="text-sm mt-2">Try adjusting your route or enabling the Hotels layer.</p>
      </div>
    )
  }
  
  return (
    <div>
      <h3 className="text-white font-medium mb-4">Hotels Near Your Destination</h3>
      <div className="grid grid-cols-2 gap-4">
        {limitedHotels.map((hotel) => (
          <HotelCard
            key={hotel.id}
            hotel={hotel}
            onClick={onHotelSelect}
          />
        ))}
      </div>
      {hotels.length > 14 && (
        <p className="text-center text-gray-400 text-sm mt-4">
          Showing 14 of {hotels.length} hotels. Zoom in on the map to see more.
        </p>
      )}
    </div>
  )
}

export default HotelsList 