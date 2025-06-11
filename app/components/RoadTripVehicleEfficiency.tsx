'use client'

import React, { useState, useEffect } from 'react'
import { Label } from '../../components/ui/label'
import { Input } from '../../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../components/ui/tooltip'
import { Info } from 'lucide-react'

interface VehicleEfficiencyProps {
  onDataChange: (data: any) => void;
}

// Define the fuel type and unit system types
type FuelType = 'gasoline' | 'diesel' | 'electric';
type UnitSystem = 'imperial' | 'metric';

export default function RoadTripVehicleEfficiency({ onDataChange }: VehicleEfficiencyProps) {
  const [fuelType, setFuelType] = useState<FuelType>('gasoline')
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('imperial')
  const [efficiency, setEfficiency] = useState('')
  const [fuelCost, setFuelCost] = useState('')
  const [lastUpdate, setLastUpdate] = useState({efficiency: '', fuelCost: '', fuelType: 'gasoline' as FuelType, unitSystem: 'imperial' as UnitSystem})
  
  // Set default fuel prices based on type and unit system
  useEffect(() => {
    const defaults = {
      gasoline: { imperial: 3.50, metric: 0.92 },
      diesel: { imperial: 3.75, metric: 0.99 },
      electric: { imperial: 0.14, metric: 0.14 }
    }
    
    setFuelCost(defaults[fuelType][unitSystem].toFixed(2))
  }, [fuelType, unitSystem])
  
  // Update parent component when values change
  useEffect(() => {
    // Skip if values are empty or the same as last update
    if (!efficiency || !fuelCost) return;
    
    // Check if values are the same as last update to prevent infinite loops
    if (
      efficiency === lastUpdate.efficiency && 
      fuelCost === lastUpdate.fuelCost && 
      fuelType === lastUpdate.fuelType && 
      unitSystem === lastUpdate.unitSystem
    ) {
      return;
    }
    
    const efficiencyValue = parseFloat(efficiency)
    const fuelCostValue = parseFloat(fuelCost)
    
    if (!isNaN(efficiencyValue) && !isNaN(fuelCostValue)) {
      // Convert to standard units for calculations (MPG and $/gallon)
      let standardEfficiency = efficiencyValue
      
      // Handle unit conversions
      if (unitSystem === 'metric') {
        if (fuelType === 'electric') {
          // kWh/100km to kWh/100mi
          standardEfficiency = efficiencyValue * 0.621371
        } else {
          // L/100km to MPG
          standardEfficiency = 235.215 / efficiencyValue
        }
      } else {
        // Imperial units
        if (fuelType === 'electric') {
          // kWh/100mi as is
          standardEfficiency = efficiencyValue
        }
        // MPG as is
      }
      
      // Update last values to prevent redundant updates
      setLastUpdate({
        efficiency,
        fuelCost,
        fuelType,
        unitSystem
      });
      
      // Send data to parent
      onDataChange({
        type: fuelType,
        efficiency: standardEfficiency,
        unitSystem,
        fuelCost: fuelCostValue,
        original: {
          efficiency: efficiencyValue,
          fuelCost: fuelCostValue
        }
      })
    }
  }, [efficiency, fuelCost, fuelType, unitSystem, onDataChange, lastUpdate])
  
  // Handle input changes with validation
  const handleEfficiencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEfficiency(value);
  }
  
  const handleFuelCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFuelCost(value);
  }
  
  const getEfficiencyLabel = () => {
    if (fuelType === 'electric') {
      return unitSystem === 'imperial' ? 'kWh/100mi' : 'kWh/100km'
    } else {
      return unitSystem === 'imperial' ? 'MPG' : 'L/100km'
    }
  }
  
  const getFuelCostLabel = () => {
    if (fuelType === 'electric') {
      return '$/kWh'
    } else {
      return unitSystem === 'imperial' ? '$/gallon' : '$/liter'
    }
  }
  
  const getEfficiencyTooltip = () => {
    if (fuelType === 'electric') {
      return unitSystem === 'imperial' 
        ? 'Kilowatt-hours per 100 miles' 
        : 'Kilowatt-hours per 100 kilometers'
    } else {
      return unitSystem === 'imperial' 
        ? 'Miles per gallon' 
        : 'Liters per 100 kilometers'
    }
  }
  
  const getFuelCostTooltip = () => {
    if (fuelType === 'electric') {
      return 'Cost per kilowatt-hour of electricity'
    } else {
      return unitSystem === 'imperial' 
        ? 'Cost per gallon of fuel' 
        : 'Cost per liter of fuel'
    }
  }
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fuel-type" className="text-gray-700 font-medium">Fuel Type</Label>
          <Select
            value={fuelType}
            onValueChange={(value: FuelType) => setFuelType(value)}
          >
            <SelectTrigger id="fuel-type" className="bg-white border-gray-200 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
              <SelectValue placeholder="Select fuel type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gasoline">Gasoline</SelectItem>
              <SelectItem value="diesel">Diesel</SelectItem>
              <SelectItem value="electric">Electric</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="unit-system" className="text-gray-700 font-medium">Unit System</Label>
          <Select
            value={unitSystem}
            onValueChange={(value: UnitSystem) => setUnitSystem(value)}
          >
            <SelectTrigger id="unit-system" className="bg-white border-gray-200 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
              <SelectValue placeholder="Select units" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="imperial">US (MPG, gal)</SelectItem>
              <SelectItem value="metric">Metric (L/100km)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="efficiency" className="text-gray-700 font-medium">
              {getEfficiencyLabel()}
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="bg-blue-100 rounded-full p-0.5 cursor-help">
                    <Info className="h-3.5 w-3.5 text-blue-600" />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-white text-gray-800 border border-gray-200 shadow-lg">
                  <p>{getEfficiencyTooltip()}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input
            id="efficiency"
            type="number"
            step="0.1"
            min="0"
            value={efficiency}
            onChange={handleEfficiencyChange}
            placeholder={fuelType === 'electric' ? 
              (unitSystem === 'imperial' ? '30' : '18') : 
              (unitSystem === 'imperial' ? '25' : '9.4')}
            className="bg-white border-gray-200 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="fuel-cost" className="text-gray-700 font-medium">
              {getFuelCostLabel()}
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="bg-green-100 rounded-full p-0.5 cursor-help">
                    <Info className="h-3.5 w-3.5 text-green-600" />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-white text-gray-800 border border-gray-200 shadow-lg">
                  <p>{getFuelCostTooltip()}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input
            id="fuel-cost"
            type="number"
            step="0.01"
            min="0"
            value={fuelCost}
            onChange={handleFuelCostChange}
            className="bg-white border-gray-200 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
          />
        </div>
      </div>
    </div>
  )
} 