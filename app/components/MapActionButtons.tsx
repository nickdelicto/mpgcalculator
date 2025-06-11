'use client'

import React from 'react'
import { Button } from '../../components/ui/button'
import { Camera, BedDouble } from 'lucide-react'
import '../styles/poi-controls.css'

interface MapActionButtonsProps {
  showAttractions: boolean;
  showAccommodation: boolean;
  onFindAttractions: () => void;
  onFindAccommodation: () => void;
}

/**
 * Action buttons displayed at the bottom of the map for finding attractions and accommodation
 */
export default function MapActionButtons({
  showAttractions,
  showAccommodation,
  onFindAttractions,
  onFindAccommodation
}: MapActionButtonsProps) {
  // Always render the container, even if buttons are hidden (for consistent positioning)
  return (
    <div 
      className="absolute bottom-4 right-4 flex gap-3"
      data-testid="map-action-buttons"
    >
      {showAttractions && (
        <Button
          onClick={onFindAttractions}
          className="map-action-button flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full px-4 py-2.5 font-medium shadow-md"
          data-type="attractions"
        >
          <Camera className="h-4 w-4" />
          <span>Find Attractions</span>
        </Button>
      )}
      
      {showAccommodation && (
        <Button
          onClick={onFindAccommodation}
          className="map-action-button flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-4 py-2.5 font-medium shadow-md"
          data-type="accommodation"
        >
          <BedDouble className="h-4 w-4" />
          <span>Find Accommodation</span>
        </Button>
      )}
    </div>
  )
} 