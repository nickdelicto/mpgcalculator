'use client'

import { useState, useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { CarFront, Fuel, Gauge, Car, Cog, Compass, BarChart2, Circle, Zap, Leaf, Battery, Plus } from 'lucide-react'

interface Vehicle {
  year: number
  make: string
  model: string
  VClass: string
  trany: string
  drive: string
  displ: number
  cylinders: number
  fuelType1: string
  fuelType2: string | null
  city08: number
  highway08: number
  comb08: number
  cityA08: number | null
  highwayA08: number | null
  combA08: number | null
  startStop: string
  sCharger: string
  tCharger: string
  phevBlended: boolean
  phevCity: number | null
  phevHwy: number | null
  phevComb: number | null
  co2: number | null
  co2A: number | null
  ghgScore: number | null
  ghgScoreA: number | null
}

interface Make {
  make: string
}

interface Model {
  model: string
}

interface Year {
  year: number
}

// Add prop for handling vehicle selection
interface VehicleLookupProps {
  onVehicleSelect?: (vehicle: Vehicle) => void;
  showAddComparison?: boolean;
}

export default function VehicleLookup({ onVehicleSelect, showAddComparison = false }: VehicleLookupProps) {
  const [makes, setMakes] = useState<Make[]>([])
  const [models, setModels] = useState<Model[]>([])
  const [selectedMake, setSelectedMake] = useState<string>('')
  const [selectedModel, setSelectedModel] = useState<string>('')
  const [isLoadingMakes, setIsLoadingMakes] = useState(true)
  const [isLoadingModels, setIsLoadingModels] = useState(false)
  const [years, setYears] = useState<Year[]>([])
  const [selectedYear, setSelectedYear] = useState<string>('')
  const [isLoadingYears, setIsLoadingYears] = useState(false)
  const [vehicleDetails, setVehicleDetails] = useState<Vehicle[]>([])
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)

  useEffect(() => {
    const fetchMakes = async () => {
      try {
        const response = await fetch('/api/vehicles/makes')
        if (!response.ok) throw new Error('Failed to fetch makes')
        const data = await response.json()
        setMakes(data)
      } catch (error) {
        console.error('Error fetching makes:', error)
      } finally {
        setIsLoadingMakes(false)
      }
    }

    fetchMakes()
  }, [])

  useEffect(() => {
    const fetchModels = async () => {
      if (!selectedMake) {
        setModels([])
        setSelectedModel('')
        return
      }

      setIsLoadingModels(true)
      try {
        const response = await fetch(`/api/vehicles/models?make=${encodeURIComponent(selectedMake)}`)
        if (!response.ok) throw new Error('Failed to fetch models')
        const data = await response.json()
        setModels(data)
      } catch (error) {
        console.error('Error fetching models:', error)
      } finally {
        setIsLoadingModels(false)
      }
    }

    fetchModels()
  }, [selectedMake])

  useEffect(() => {
    const fetchYears = async () => {
      if (!selectedMake || !selectedModel) {
        setYears([])
        setSelectedYear('')
        return
      }

      setIsLoadingYears(true)
      try {
        const response = await fetch(
          `/api/vehicles/years?make=${encodeURIComponent(selectedMake)}&model=${encodeURIComponent(selectedModel)}`
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

    fetchYears()
  }, [selectedMake, selectedModel])

  const handleSearch = async () => {
    if (!selectedMake || !selectedModel || !selectedYear) return

    setIsLoadingDetails(true)
    try {
      const response = await fetch(
        `/api/vehicles/details?make=${encodeURIComponent(selectedMake)}&model=${encodeURIComponent(selectedModel)}&year=${encodeURIComponent(selectedYear)}`
      )
      if (!response.ok) throw new Error('Failed to fetch vehicle details')
      const data = await response.json()
      console.log('Vehicle Details Response:', data)
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
    <div className="space-y-8 font-mono">
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
              onValueChange={(value) => {
                setSelectedMake(value)
                setSelectedModel('')
              }}
              disabled={isLoadingMakes}
            >
              <SelectTrigger className="w-full bg-gray-900 border-gray-600 hover:bg-gray-800 
                transition-colors text-blue-300">
                <SelectValue placeholder="Select a make" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px] overflow-y-auto bg-gray-900 border-gray-700">
                {makes.map((make) => (
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
        <Card className="mt-8 bg-gray-700 border-gray-700 font-mono">
          <CardHeader className="bg-gradient-to-r from-blue-800 to-blue-900 border-b border-gray-700">
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl flex items-center gap-3 text-white">
                <CarFront className="h-6 w-6" />
                {selectedYear} {selectedMake} {selectedModel}
              </CardTitle>
              
              {/* Add Compare Button */}
              {showAddComparison && onVehicleSelect && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onVehicleSelect(vehicleDetails[0])}
                  className="text-blue-300 border-blue-300 hover:bg-blue-300/10"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add to Compare
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left Column - All Fuel Economy Data */}
              <div className="space-y-6">
                {/* Primary Fuel */}
                <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-blue-300 mb-4 flex items-center gap-2">
                    <Fuel className="h-5 w-5" />
                    Primary Fuel Economy- {vehicleDetails[0].fuelType1}
                  </h3>
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

                    {/* Environmental Impact for Primary Fuel */}
                    {(vehicleDetails[0].co2 !== null && vehicleDetails[0].co2 !== undefined || vehicleDetails[0].ghgScore) && (
                      <div className="mt-4 pt-4 border-t border-gray-700 font-mono">
                        <h4 className="text-sm font-semibold text-emerald-300 mb-4">Environmental Impact</h4>
                        <div className="grid grid-cols-2 gap-4">
                          {vehicleDetails[0].co2 !== null && vehicleDetails[0].co2 !== undefined && (
                            <div className="bg-gray-600/50 p-4 rounded-lg">
                              <p className="text-xl font-mono text-red-400 flex flex-col">
                                <span className="text-gray-200 text-sm mb-2">CO₂ Emissions</span>
                                {vehicleDetails[0].co2} g/mi
                              </p>
                            </div>
                          )}
                          {vehicleDetails[0].ghgScore && (
                            <div className="bg-gray-600/50 p-4 rounded-lg">
                              <p className="text-xl font-mono text-green-400 flex flex-col">
                                <span className="text-gray-200 text-sm mb-2">GHG Emissions Score</span>
                                {vehicleDetails[0].ghgScore}/10
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Alternative Fuel */}
                {vehicleDetails[0].fuelType2 && (
                  <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700">
                    <h3 className="text-lg font-semibold text-yellow-300 mb-4 flex items-center gap-2">
                      <Fuel className="h-5 w-5" />
                      Alternative Fuel Economy- {vehicleDetails[0].fuelType2}
                    </h3>
                    <div className="grid gap-4">
                      {vehicleDetails[0].combA08 && (
                        <div className="bg-gray-600/50 p-4 rounded-lg">
                          <p className="text-2xl font-mono text-green-400 flex items-center justify-between">
                            <span className="text-gray-200 text-sm">Combined</span>
                            {vehicleDetails[0].combA08} {usesMPGe(vehicleDetails[0].fuelType2 || '') ? 'MPGe' : 'MPG'}
                          </p>
                        </div>
                      )}
                      {vehicleDetails[0].cityA08 && (
                        <div className="bg-gray-600/50 p-4 rounded-lg">
                          <p className="text-2xl font-mono text-blue-400 flex items-center justify-between">
                            <span className="text-gray-200 text-sm">City</span>
                            {vehicleDetails[0].cityA08} {usesMPGe(vehicleDetails[0].fuelType2 || '') ? 'MPGe' : 'MPG'}
                          </p>
                        </div>
                      )}
                      {vehicleDetails[0].highwayA08 && (
                        <div className="bg-gray-600/50 p-4 rounded-lg">
                          <p className="text-2xl font-mono text-red-400 flex items-center justify-between">
                            <span className="text-gray-200 text-sm">Highway</span>
                            {vehicleDetails[0].highwayA08} {usesMPGe(vehicleDetails[0].fuelType2 || '') ? 'MPGe' : 'MPG'}
                          </p>
                        </div>
                      )}

                      {/* Environmental Impact for Alternative Fuel */}
                      {(vehicleDetails[0].co2A !== null && vehicleDetails[0].co2A !== undefined || vehicleDetails[0].ghgScoreA) && (
                        <div className="mt-4 pt-4 border-t border-gray-700 font-mono">
                          <h4 className="text-sm font-semibold text-emerald-300 mb-4">Environmental Impact</h4>
                          <div className="grid grid-cols-2 gap-4">
                            {vehicleDetails[0].co2A !== null && vehicleDetails[0].co2A !== undefined && (
                              <div className="bg-gray-600/50 p-4 rounded-lg">
                                <p className="text-xl font-mono text-orange-400 flex flex-col">
                                  <span className="text-gray-200 text-sm mb-2">CO₂ Emissions</span>
                                  {vehicleDetails[0].co2A} g/mi
                                </p>
                              </div>
                            )}
                            {vehicleDetails[0].ghgScoreA && (
                              <div className="bg-gray-600/50 p-4 rounded-lg">
                                <p className="text-xl font-mono text-green-400 flex flex-col">
                                  <span className="text-gray-200 text-sm mb-2">GHG Emissions Score</span>
                                  {vehicleDetails[0].ghgScoreA}/10
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* PHEV Mode */}
                {(vehicleDetails[0].phevComb || vehicleDetails[0].phevCity || vehicleDetails[0].phevHwy) && (
                  <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700">
                    <h3 className="text-lg font-semibold text-green-300 mb-4 flex items-center gap-2">
                      <Fuel className="h-5 w-5" />
                      Hybrid Fuel Economy
                    </h3>
                    <div className="grid gap-4">
                      {vehicleDetails[0].phevComb && (
                        <div className="bg-gray-600/50 p-4 rounded-lg">
                          <p className="text-2xl font-mono text-green-400 flex items-center justify-between">
                            <span className="text-gray-200 text-sm">Combined</span>
                            {vehicleDetails[0].phevComb} MPGe
                          </p>
                        </div>
                      )}
                      {vehicleDetails[0].phevCity && (
                        <div className="bg-gray-600/50 p-4 rounded-lg">
                          <p className="text-2xl font-mono text-blue-400 flex items-center justify-between">
                            <span className="text-gray-200 text-sm">City</span>
                            {vehicleDetails[0].phevCity} MPGe
                          </p>
                        </div>
                      )}
                      {vehicleDetails[0].phevHwy && (
                        <div className="bg-gray-600/50 p-4 rounded-lg">
                          <p className="text-2xl font-mono text-red-400 flex items-center justify-between">
                            <span className="text-gray-200 text-sm">Highway</span>
                            {vehicleDetails[0].phevHwy} MPGe
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Vehicle Specs and Features */}
              <div className="space-y-6">
                {/* Vehicle Specifications */}
                <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700 font-mono">
                  <h3 className="text-lg font-semibold text-purple-300 mb-4">Vehicle Specifications</h3>
                  <div className="grid gap-4">
                    <div className="bg-gray-600/50 p-4 rounded-lg flex justify-between items-center">
                      <span className="text-gray-200">Class</span>
                      <span className="text-xl font-mono text-purple-400">{vehicleDetails[0].VClass}</span>
                    </div>
                    <div className="bg-gray-600/50 p-4 rounded-lg flex justify-between items-center">
                      <span className="text-gray-200">Transmission</span>
                      <span className="text-xl font-mono text-orange-400">{vehicleDetails[0].trany}</span>
                    </div>
                    <div className="bg-gray-600/50 p-4 rounded-lg flex justify-between items-center">
                      <span className="text-gray-200">Drive</span>
                      <span className="text-xl font-mono text-cyan-400">{vehicleDetails[0].drive}</span>
                    </div>
                    <div className="bg-gray-600/50 p-4 rounded-lg flex justify-between items-center">
                      <span className="text-gray-200">Engine</span>
                      <span className="text-xl font-mono text-blue-400">{vehicleDetails[0].displ}L</span>
                    </div>
                    <div className="bg-gray-600/50 p-4 rounded-lg flex justify-between items-center">
                      <span className="text-gray-200">Cylinders</span>
                      <span className="text-xl font-mono text-indigo-400">{vehicleDetails[0].cylinders}</span>
                    </div>
                  </div>
                </div>

                {/* Features */}
                {(vehicleDetails[0].startStop === 'Y' || 
                  vehicleDetails[0].sCharger === 'Y' || 
                  vehicleDetails[0].tCharger === 'Y') && (
                  <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700 font-mono">
                    <h3 className="text-lg font-semibold text-green-300 mb-4">Features</h3>
                    <div className="grid gap-4">
                      {vehicleDetails[0].startStop === 'Y' && (
                        <div className="bg-gray-600/50 p-4 rounded-lg flex items-center gap-2">
                          <Battery className="h-4 w-4 text-green-400" />
                          <span className="text-gray-300">Start-Stop Technology</span>
                        </div>
                      )}
                      {vehicleDetails[0].sCharger === 'Y' && (
                        <div className="bg-gray-600/50 p-4 rounded-lg flex items-center gap-2">
                          <Zap className="h-4 w-4 text-blue-400" />
                          <span className="text-gray-300">Supercharged</span>
                        </div>
                      )}
                      {vehicleDetails[0].tCharger === 'Y' && (
                        <div className="bg-gray-600/50 p-4 rounded-lg flex items-center gap-2">
                          <Zap className="h-4 w-4 text-blue-400" />
                          <span className="text-gray-300">Turbocharged</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 