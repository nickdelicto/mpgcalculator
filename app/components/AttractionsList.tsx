'use client'

import React from 'react'
import AttractionCard from './AttractionCard'
import { POI } from '../utils/overpassService'

interface AttractionsListProps {
  attractions: POI[]
  onAttractionSelect: (attraction: POI) => void
}

const AttractionsList: React.FC<AttractionsListProps> = ({ attractions, onAttractionSelect }) => {
  // Limit to max 14 attractions
  const limitedAttractions = attractions.slice(0, 14)
  
  if (attractions.length === 0) {
    return (
      <div className="text-center p-6 text-gray-400">
        <p>No attractions found near your route.</p>
        <p className="text-sm mt-2">Try adjusting your route or enabling the Attractions layer.</p>
      </div>
    )
  }
  
  return (
    <div>
      <h3 className="text-white font-medium mb-4">Attractions & Tours Along Your Route</h3>
      <div className="grid grid-cols-2 gap-4">
        {limitedAttractions.map((attraction) => (
          <AttractionCard
            key={attraction.id}
            attraction={attraction}
            onClick={onAttractionSelect}
          />
        ))}
      </div>
      {attractions.length > 14 && (
        <p className="text-center text-gray-400 text-sm mt-4">
          Showing 14 of {attractions.length} attractions. Zoom in on the map to see more.
        </p>
      )}
    </div>
  )
}

export default AttractionsList 