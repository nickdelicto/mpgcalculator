'use client'

import React, { useState } from 'react'
import { Hotel, Navigation, Route, Camera } from 'lucide-react'
import { POI } from '../utils/overpassService'

interface TabsContainerProps {
  hotelsList?: React.ReactNode
  attractionsList?: React.ReactNode
  directions?: React.ReactNode
  tripSummary?: React.ReactNode
  activeTab?: number
  onTabChange?: (tabIndex: number) => void
  hasHotels: boolean
  hasAttractions?: boolean
  hasDirections: boolean
}

const TabsContainer: React.FC<TabsContainerProps> = ({
  hotelsList,
  attractionsList,
  directions,
  tripSummary,
  activeTab: externalActiveTab,
  onTabChange,
  hasHotels = false,
  hasAttractions = false,
  hasDirections = false
}) => {
  // Use internal state if no external control is provided
  const [internalActiveTab, setInternalActiveTab] = useState(0)
  
  // Determine which active tab state to use
  const activeTab = externalActiveTab !== undefined ? externalActiveTab : internalActiveTab
  
  // Handle tab click
  const handleTabClick = (tabIndex: number) => {
    if (onTabChange) {
      onTabChange(tabIndex)
    } else {
      setInternalActiveTab(tabIndex)
    }
  }
  
  // Calculate tab indices
  const getTabIndex = (tabName: 'hotels' | 'attractions' | 'directions' | 'summary') => {
    let index = 0;
    
    if (tabName === 'hotels') return 0;
    
    if (tabName === 'attractions') {
      return hasHotels ? 1 : 0;
    }
    
    if (tabName === 'directions') {
      if (hasHotels && hasAttractions) return 2;
      if (hasHotels || hasAttractions) return 1;
      return 0;
    }
    
    if (tabName === 'summary') {
      let count = 0;
      if (hasHotels) count++;
      if (hasAttractions) count++;
      if (hasDirections) count++;
      return count;
    }
    
    return 0;
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Tabs Header */}
      <div className="flex border-b border-gray-700">
        {hasHotels && (
          <button
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium ${
              activeTab === getTabIndex('hotels')
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
            onClick={() => handleTabClick(getTabIndex('hotels'))}
          >
            <Hotel className="h-4 w-4" />
            <span>Hotels</span>
          </button>
        )}
        
        {hasAttractions && (
          <button
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium ${
              activeTab === getTabIndex('attractions')
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
            onClick={() => handleTabClick(getTabIndex('attractions'))}
          >
            <Camera className="h-4 w-4" />
            <span>Attractions</span>
          </button>
        )}
        
        {hasDirections && (
          <button
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium ${
              activeTab === getTabIndex('directions')
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
            onClick={() => handleTabClick(getTabIndex('directions'))}
          >
            <Navigation className="h-4 w-4" />
            <span>Directions</span>
          </button>
        )}
        
        <button
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium ${
            activeTab === getTabIndex('summary')
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-300 hover:text-white hover:bg-gray-700'
          }`}
          onClick={() => handleTabClick(getTabIndex('summary'))}
        >
          <Route className="h-4 w-4" />
          <span>Trip Summary</span>
        </button>
      </div>
      
      {/* Tab Content */}
      <div className="flex-grow overflow-y-auto">
        {hasHotels && activeTab === getTabIndex('hotels') && (
          <div className="p-4">{hotelsList}</div>
        )}
        
        {hasAttractions && activeTab === getTabIndex('attractions') && (
          <div className="p-4">{attractionsList}</div>
        )}
        
        {hasDirections && activeTab === getTabIndex('directions') && (
          <div className="p-4">{directions}</div>
        )}
        
        {activeTab === getTabIndex('summary') && (
          <div className="p-4">{tripSummary}</div>
        )}
      </div>
    </div>
  )
}

export default TabsContainer 