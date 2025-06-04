'use client'

import React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowRight, MapPin } from 'lucide-react'

export default function VehicleComparisonRoadTripCTA() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  // Extract vehicle details from URL params
  const vehicle1 = searchParams.get('vehicle1')
  const vehicle2 = searchParams.get('vehicle2')
  const vehicle3 = searchParams.get('vehicle3')
  
  // Check if we have at least one vehicle selected
  const hasVehicles = !!(vehicle1 || vehicle2 || vehicle3)
  
  // If no vehicles selected, show a different message
  if (!hasVehicles) {
    return null
  }
  
  // Get the first selected vehicle for personalization
  const firstVehicle = vehicle1 || vehicle2 || vehicle3 || ''
  // Extract year, make, model from the format "2022-toyota-camry"
  const parts = firstVehicle.split('-')
  let vehicleYear, vehicleMake, vehicleModel
  
  if (parts.length >= 3) {
    vehicleYear = parts[0]
    vehicleMake = parts[1].charAt(0).toUpperCase() + parts[1].slice(1)
    // Remove trailing -mpg if present and capitalize first letter of each word
    vehicleModel = parts.slice(2)
      .join(' ')
      .replace(/-mpg$/, '')
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }
  
  const vehicleDisplay = vehicleYear && vehicleMake && vehicleModel
    ? `${vehicleYear} ${vehicleMake} ${vehicleModel}`
    : 'your selected vehicle'
  
  return (
    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg p-5 shadow-lg mb-10 mt-4">
      <div className="flex flex-col md:flex-row items-center">
        <div className="md:w-3/4">
          <h3 className="text-white text-xl font-bold mb-2 font-heading">
            Calculate Trip Costs for {vehicleDisplay}
          </h3>
          <p className="text-indigo-100 mb-4">
            See exactly how much your next road trip will cost with our interactive calculator. Plan your route, estimate fuel expenses, and more!
          </p>
          <a 
            href="/road-trip-cost-calculator" 
            className="inline-flex items-center px-5 py-2.5 bg-white text-indigo-700 font-semibold rounded hover:bg-indigo-100 transition-colors"
          >
            Calculate Road Trip <ArrowRight className="ml-2 h-4 w-4" />
          </a>
        </div>
        <div className="md:w-1/4 flex justify-center mt-4 md:mt-0">
          <div className="bg-indigo-400 bg-opacity-30 rounded-full p-4">
            <MapPin className="h-12 w-12 text-white" />
          </div>
        </div>
      </div>
    </div>
  )
} 