// This is a specialized version of VehicleLookup for the fuel savings calculator
// that uses optimized makes fetching to prevent repeated API calls

'use client'

import React, { JSX } from 'react'
import { useState, useEffect, useMemo } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { CarFront, Fuel, Gauge } from 'lucide-react'
import { Vehicle, Make, Model, Year } from '../types/vehicle'

export interface FuelSavingsVehicleLookupProps {
  onVehicleSelect: (vehicle: Vehicle) => void
  makes: Make[]
  customResultDisplay?: (vehicle: Vehicle) => JSX.Element
}

export default function FuelSavingsVehicleLookup({ 
  onVehicleSelect,
  makes,
  customResultDisplay
}: FuelSavingsVehicleLookupProps) {
  // Memoize the sorted makes array to prevent unnecessary re-sorting
  const sortedMakes = useMemo(() => 
    [...makes].sort((a, b) => a.make.localeCompare(b.make)),
    [makes]
  )

  const [models, setModels] = useState<Model[]>([])
  const [selectedMake, setSelectedMake] = useState<string>('')
  const [selectedModel, setSelectedModel] = useState<string>('')
  const [isLoadingModels, setIsLoadingModels] = useState(false)
  const [years, setYears] = useState<Year[]>([])
  const [selectedYear, setSelectedYear] = useState<string>('')
  const [isLoadingYears, setIsLoadingYears] = useState(false)
  const [vehicleDetails, setVehicleDetails] = useState<Vehicle[]>([])
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)

  // Reset dependent fields when make changes
  useEffect(() => {
    if (selectedMake) {
      setSelectedModel('')
      setSelectedYear('')
      setYears([])
      setVehicleDetails([])
      fetchModels(selectedMake)
    }
  }, [selectedMake])

  // Reset dependent fields when model changes
  useEffect(() => {
    if (selectedMake && selectedModel) {
      setSelectedYear('')
      setVehicleDetails([])
      fetchYears(selectedMake, selectedModel)
    }
  }, [selectedModel])

  // Memoize the fetch functions to prevent recreating them on every render
  const fetchModels = async (make: string) => {
    if (!make) return

    setIsLoadingModels(true)
    try {
      const response = await fetch(`/api/vehicles/models?make=${encodeURIComponent(make)}`)
      if (!response.ok) throw new Error('Failed to fetch models')
      const data = await response.json()
      setModels(data)
    } catch (error) {
      console.error('Error fetching models:', error)
    } finally {
      setIsLoadingModels(false)
    }
  }

  const fetchYears = async (make: string, model: string) => {
    if (!make || !model) return

    setIsLoadingYears(true)
    try {
      const response = await fetch(
        `/api/vehicles/years?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}`
      )
      if (!response.ok) throw new Error('Failed to fetch years')
      const data = await response.json()
      setYears(data)
    } catch (error) {
      console.error('Error fetching years:', error)
    } finally {
      setIsLoadingYears(false)
    }
  }

  const handleSearch = async () => {
    if (!selectedMake || !selectedModel || !selectedYear) return

    setIsLoadingDetails(true)
    try {
      const response = await fetch(
        `/api/vehicles/details?make=${encodeURIComponent(selectedMake)}&model=${encodeURIComponent(selectedModel)}&year=${encodeURIComponent(selectedYear)}`
      )
      if (!response.ok) throw new Error('Failed to fetch vehicle details')
      const data = await response.json()
      setVehicleDetails(data)
    } catch (error) {
      console.error('Error fetching vehicle details:', error)
    } finally {
      setIsLoadingDetails(false)
    }
  }

  // Helper function to determine if fuel type uses MPGe
  const usesMPGe = (fuelType: string): boolean => {
    const MPGeTypes = [
      'Electricity',
      'Natural Gas',
      'Hydrogen',
      'Propane',
      'LPG'
    ]
    return MPGeTypes.includes(fuelType)
  }

  return (
    <div className="space-y-8 font-heading">
      {/* Selection Controls */}
      <div className="space-y-6">
        <div className="grid gap-6">
          {/* Make Selection */}
          <div className="grid gap-2">
            <label className="text-sm font-medium text-gray-200">
              Select Make
            </label>
            <Select
              value={selectedMake}
              onValueChange={setSelectedMake}
            >
              <SelectTrigger className="w-full bg-gray-900 border-gray-600 hover:bg-gray-800 
                transition-colors text-blue-300">
                <SelectValue placeholder="Select a make" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px] overflow-y-auto bg-gray-900 border-gray-700">
                {sortedMakes.map((make) => (
                  <SelectItem 
                    key={make.make} 
                    value={make.make}
                    className="text-gray-300 hover:bg-gray-800 hover:text-blue-300"
                  >
                    {make.make}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Model Selection */}
          <div className="grid gap-2">
            <label className="text-sm font-medium text-gray-200">
              Select Model
            </label>
            <Select
              value={selectedModel}
              onValueChange={setSelectedModel}
              disabled={isLoadingModels || !selectedMake}
            >
              <SelectTrigger className="w-full bg-gray-900 border-gray-600 hover:bg-gray-800 
                transition-colors text-blue-300">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px] overflow-y-auto bg-gray-900 border-gray-700">
                {models.map((model) => (
                  <SelectItem 
                    key={model.model} 
                    value={model.model}
                    className="text-gray-300 hover:bg-gray-800 hover:text-blue-300"
                  >
                    {model.model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Year Selection */}
          <div className="grid gap-2">
            <label className="text-sm font-medium text-gray-200">
              Select Year
            </label>
            <Select
              value={selectedYear}
              onValueChange={setSelectedYear}
              disabled={isLoadingYears || !selectedModel}
            >
              <SelectTrigger className="w-full bg-gray-900 border-gray-600 hover:bg-gray-800 
                transition-colors text-blue-300">
                <SelectValue placeholder="Select a year" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px] overflow-y-auto bg-gray-900 border-gray-700">
                {years.map((year) => (
                  <SelectItem 
                    key={year.year} 
                    value={year.year.toString()}
                    className="text-gray-300 hover:bg-gray-800 hover:text-blue-300"
                  >
                    {year.year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Search Button */}
          <Button 
            onClick={handleSearch}
            disabled={!selectedMake || !selectedModel || !selectedYear || isLoadingDetails}
            className="mt-4 bg-green-600 hover:bg-green-700"
          >
            {isLoadingDetails ? 'Loading...' : 'View Vehicle Details'}
          </Button>
        </div>
      </div>

      {/* Results Display */}
      {vehicleDetails.length > 0 && (
        customResultDisplay ? (
          customResultDisplay(vehicleDetails[0])
        ) : (
          <Card className="mt-8 bg-gray-700 border-gray-700 font-heading">
            <CardHeader className="bg-gradient-to-r from-blue-800 to-blue-900 border-b border-gray-700">
              <div className="flex justify-between items-center">
                <CardTitle className="text-2xl flex items-center gap-3 text-white">
                  <CarFront className="h-6 w-6" />
                  {selectedYear} {selectedMake} {selectedModel}
                </CardTitle>
                
                {/* Add Compare Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onVehicleSelect(vehicleDetails[0])}
                  className="text-blue-600 border-blue-300 hover:bg-blue-600 hover:text-white"
                >
                  <CarFront className="h-4 w-4 mr-2" />
                  Select Vehicle
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="bg-gray-600/50 p-4 rounded-lg">
                  <p className="text-2xl font-mono text-green-400 flex items-center justify-between">
                    <span className="text-gray-200 text-sm">Combined</span>
                    {vehicleDetails[0].comb08} {usesMPGe(vehicleDetails[0].fuelType1) ? 'MPGe' : 'MPG'}
                  </p>
                </div>
                <div className="bg-gray-600/50 p-4 rounded-lg">
                  <p className="text-2xl font-mono text-blue-400 flex items-center justify-between">
                    <span className="text-gray-200 text-sm">City</span>
                    {vehicleDetails[0].city08} {usesMPGe(vehicleDetails[0].fuelType1) ? 'MPGe' : 'MPG'}
                  </p>
                </div>
                <div className="bg-gray-600/50 p-4 rounded-lg">
                  <p className="text-2xl font-mono text-red-400 flex items-center justify-between">
                    <span className="text-gray-200 text-sm">Highway</span>
                    {vehicleDetails[0].highway08} {usesMPGe(vehicleDetails[0].fuelType1) ? 'MPGe' : 'MPG'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      )}
    </div>
  )
}