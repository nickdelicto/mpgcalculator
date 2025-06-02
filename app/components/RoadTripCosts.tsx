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
    <div className="space-y-6">
      {/* Trip stats */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="stat">
          <div className="text-2xl font-bold text-blue-300">
            {unitSystem === 'imperial' 
              ? `${Math.round(costs.distanceMiles)} mi` 
              : `${Math.round(costs.distanceKm)} km`}
          </div>
          <div className="text-sm text-gray-400">Distance</div>
        </div>
        
        <div className="stat">
          <div className="text-2xl font-bold text-blue-300">
            {formatDuration(costs.durationHours)}
          </div>
          <div className="text-sm text-gray-400">Drive Time</div>
        </div>
        
        <div className="stat">
          <div className="text-2xl font-bold text-green-300">
            ${costs.totalCost.toFixed(2)}
          </div>
          <div className="text-sm text-gray-400">Total Cost</div>
        </div>
      </div>
      
      {/* Cost breakdown */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-white">Cost Breakdown</h4>
        
        {/* Fuel costs */}
        <div className="flex justify-between items-center pb-2 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <Fuel className="h-5 w-5 text-blue-400" />
            <span className="text-gray-200">{vehicleType === 'electric' ? 'Electricity' : 'Fuel'}</span>
          </div>
          <div className="text-white font-semibold">${costs.fuelCost.toFixed(2)}</div>
        </div>
        
        {/* Toll costs if any */}
        {costs.tollCost > 0 && (
          <div className="flex justify-between items-center pb-2 border-b border-gray-700">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-400" />
              <span className="text-gray-200">Tolls</span>
            </div>
            <div className="text-white font-semibold">${costs.tollCost.toFixed(2)}</div>
          </div>
        )}
        
        {/* Total cost */}
        <div className="flex justify-between items-center pt-2">
          <div className="text-gray-200 font-semibold">Total Trip Cost</div>
          <div className="text-xl text-green-300 font-bold">${costs.totalCost.toFixed(2)}</div>
        </div>
      </div>
      
      {/* Disclaimer */}
      <div className="text-gray-400 text-xs pt-2">
        <p>
          This estimate is based on your inputs and may vary based on traffic conditions, 
          driving habits, and actual {vehicleType === 'electric' ? 'energy' : 'fuel'} prices along your route.
        </p>
      </div>
    </div>
  )
} 