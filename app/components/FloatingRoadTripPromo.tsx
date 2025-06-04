'use client'

import { useState, useEffect } from 'react'
import { X, Car, ArrowRight } from 'lucide-react'

export default function FloatingRoadTripPromo() {
  const [isVisible, setIsVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Check if user has previously dismissed this notification
    const hasDismissed = localStorage.getItem('roadTripPromoDismissed')
    if (hasDismissed === 'true') {
      setDismissed(true)
      return
    }

    // Show notification after scrolling down a bit
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      const showThreshold = 1000 // Show after scrolling down 1000px
      
      if (scrollPosition > showThreshold) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const dismissNotification = () => {
    setDismissed(true)
    localStorage.setItem('roadTripPromoDismissed', 'true')
  }

  if (dismissed) return null

  return (
    <div 
      className={`fixed bottom-4 right-4 md:bottom-8 md:right-8 z-50 transition-all duration-300 transform ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0 pointer-events-none'
      }`}
    >
      <div className="bg-white rounded-lg shadow-2xl overflow-hidden w-72 border-2 border-blue-400">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-4 py-2 flex justify-between items-center">
          <div className="flex items-center">
            <Car className="text-white mr-2 h-4 w-4" />
            <h4 className="text-white font-bold text-sm">Road Trip Planner</h4>
          </div>
          <button onClick={dismissNotification} className="text-white hover:text-blue-200">
            <X className="h-4 w-4" />
          </button>
        </div>
        
        <div className="p-4">
          <p className="text-gray-700 text-sm mb-3">
            Planning a road trip? Our new calculator helps you estimate fuel costs and visualize your route!
          </p>
          <a 
            href="/road-trip-cost-calculator"
            className="inline-flex items-center justify-center w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded transition-colors"
          >
            Try it now <ArrowRight className="ml-2 h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  )
} 