'use client'

import React from 'react'
import { Fuel, Clock, Route, DollarSign } from 'lucide-react'

interface RoadTripCostsProps {
  costs: {
    fuelCost: number;
    tollCost: number;
    totalCost: number;
    distanceMiles: number;
    distanceKm: number;
    durationHours: number;
  };
  vehicleType: string;
  unitSystem: string;
}

export default function RoadTripCosts({ costs, vehicleType, unitSystem }: RoadTripCostsProps) {
  // Format hours and minutes from duration
  const formatDuration = (hours: number) => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}h ${minutes}m`;
  };
  
  return (
    <div className="space-y-8 p-2 bg-gray-50 rounded-lg">
      {/* Trip stats cards with subtle animation */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-gradient-to-b from-white to-blue-50 rounded-xl p-4 shadow-md border border-blue-100 hover:shadow-lg transition-all duration-300 flex flex-col items-center justify-center">
          <div className="bg-blue-100 p-2 rounded-full mb-2 flex items-center justify-center">
            <Route className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-700">
            {unitSystem === 'imperial' 
              ? `${Math.round(costs.distanceMiles)} mi` 
              : `${Math.round(costs.distanceKm)} km`}
          </div>
          <div className="text-sm text-gray-600 font-medium mt-1">Distance</div>
        </div>
        
        <div className="bg-gradient-to-b from-white to-indigo-50 rounded-xl p-4 shadow-md border border-indigo-100 hover:shadow-lg transition-all duration-300 flex flex-col items-center justify-center">
          <div className="bg-indigo-100 p-2 rounded-full mb-2 flex items-center justify-center">
            <Clock className="h-5 w-5 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-indigo-700">
            {formatDuration(costs.durationHours)}
          </div>
          <div className="text-sm text-gray-600 font-medium mt-1">Drive Time</div>
        </div>
        
        <div className="bg-gradient-to-b from-white to-green-50 rounded-xl p-4 shadow-md border border-green-100 hover:shadow-lg transition-all duration-300 flex flex-col items-center justify-center">
          <div className="bg-green-100 p-2 rounded-full mb-2 flex items-center justify-center">
            <DollarSign className="h-5 w-5 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-700">
            ${costs.totalCost.toFixed(2)}
          </div>
          <div className="text-sm text-gray-600 font-medium mt-1">Total Cost</div>
        </div>
      </div>
      
      {/* Cost breakdown */}
      <div className="bg-white rounded-xl p-5 shadow-md border border-gray-200">
        <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center pb-2 border-b border-gray-200">
          <DollarSign className="h-5 w-5 mr-2 text-blue-600" />
          Cost Breakdown
        </h4>
        
        {/* Fuel costs */}
        <div className="flex justify-between items-center py-3 border-b border-gray-100 hover:bg-gray-50 px-2 rounded-md transition-colors">
          <div className="flex items-center gap-2">
            <div className="bg-blue-100 p-1.5 rounded-md">
              <Fuel className="h-4 w-4 text-blue-600" />
            </div>
            <span className="text-gray-700 font-medium">{vehicleType === 'electric' ? 'Electricity' : 'Fuel'}</span>
          </div>
          <div className="text-gray-800 font-semibold">${costs.fuelCost.toFixed(2)}</div>
        </div>
        
        {/* Toll costs if any */}
        {costs.tollCost > 0 && (
          <div className="flex justify-between items-center py-3 border-b border-gray-100 hover:bg-gray-50 px-2 rounded-md transition-colors">
            <div className="flex items-center gap-2">
              <div className="bg-amber-100 p-1.5 rounded-md">
                <DollarSign className="h-4 w-4 text-amber-600" />
              </div>
              <span className="text-gray-700 font-medium">Tolls</span>
            </div>
            <div className="text-gray-800 font-semibold">${costs.tollCost.toFixed(2)}</div>
          </div>
        )}
        
        {/* Total cost */}
        <div className="flex justify-between items-center mt-4 pt-3 bg-gray-50 px-3 py-2 rounded-lg">
          <div className="text-gray-800 font-bold">Total Trip Cost</div>
          <div className="text-xl text-white font-bold px-4 py-1.5 bg-gradient-to-r from-green-600 to-green-700 rounded-lg shadow-sm">
            ${costs.totalCost.toFixed(2)}
          </div>
        </div>
      </div>
      
      {/* Disclaimer */}
      <div className="bg-blue-100 text-blue-800 text-sm rounded-lg p-3 flex items-start border border-blue-200 shadow-sm">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 flex-shrink-0 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p>
          This estimate is based on your inputs and may vary based on traffic conditions, 
          driving habits, and actual {vehicleType === 'electric' ? 'energy' : 'fuel'} prices along your route.
        </p>
      </div>
    </div>
  )
} 