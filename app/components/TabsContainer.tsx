'use client'

import React, { useState, useEffect, useRef } from 'react'
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
  
  // Refs and state for scroll indicators
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [showLeftIndicator, setShowLeftIndicator] = useState(false)
  const [showRightIndicator, setShowRightIndicator] = useState(false)

  // Update scroll indicators based on scroll position
  const updateScrollIndicators = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setShowLeftIndicator(scrollLeft > 10) // Show left indicator if scrolled right
      setShowRightIndicator(scrollLeft + clientWidth < scrollWidth - 10) // Show right indicator if more content to scroll
    }
  }
  
  // Add CSS for hiding scrollbar while maintaining scroll functionality
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .scrollbar-hide {
        -ms-overflow-style: none;  /* IE and Edge */
        scrollbar-width: none;     /* Firefox */
      }
      .scrollbar-hide::-webkit-scrollbar {
        display: none;             /* Chrome, Safari and Opera */
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  // Set up scroll event listener
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current
    if (scrollContainer) {
      // Check initial scroll state
      updateScrollIndicators()
      
      // Add scroll event listener
      scrollContainer.addEventListener('scroll', updateScrollIndicators)
      
      // Check after initial render and window resize
      window.addEventListener('resize', updateScrollIndicators)
      
      return () => {
        scrollContainer.removeEventListener('scroll', updateScrollIndicators)
        window.removeEventListener('resize', updateScrollIndicators)
      }
    }
  }, [])
  
  // Update indicators when tab content changes
  useEffect(() => {
    updateScrollIndicators()
  }, [hasHotels, hasAttractions, hasDirections])
  
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
    <div className="flex flex-col h-full bg-white dark:bg-gray-50">
      {/* Tabs Header with horizontal scrolling */}
      <div className="relative">
        <div className="overflow-x-auto scrollbar-hide" ref={scrollContainerRef}>
          <div className="flex border-b border-gray-200 min-w-max">
            {hasHotels && (
              <button
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium ${
                  activeTab === getTabIndex('hotels')
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
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
                    ? 'text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
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
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
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
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
              onClick={() => handleTabClick(getTabIndex('summary'))}
            >
              <Route className="h-4 w-4" />
              <span>Trip Summary</span>
            </button>
          </div>
        </div>
        
        {/* Right shadow indicator for more tabs */}
        {showRightIndicator && (
          <div className="absolute right-0 top-0 bottom-0 w-8 pointer-events-none bg-gradient-to-l from-white dark:from-gray-50 to-transparent"></div>
        )}
        
        {/* Left shadow indicator for scrolled tabs */}
        {showLeftIndicator && (
          <div className="absolute left-0 top-0 bottom-0 w-8 pointer-events-none bg-gradient-to-r from-white dark:from-gray-50 to-transparent"></div>
        )}
      </div>
      
      {/* Tab Content - Updated to fill remaining height */}
      <div className="flex-grow overflow-y-auto">
        {hasHotels && activeTab === getTabIndex('hotels') && (
          <div className="p-4 h-full">{hotelsList}</div>
        )}
        
        {hasAttractions && activeTab === getTabIndex('attractions') && (
          <div className="p-4 h-full">{attractionsList}</div>
        )}
        
        {hasDirections && activeTab === getTabIndex('directions') && (
          <div className="p-4 h-full">{directions}</div>
        )}
        
        {activeTab === getTabIndex('summary') && (
          <div className="p-4 h-full">{tripSummary}</div>
        )}
      </div>
    </div>
  )
}

export default TabsContainer 