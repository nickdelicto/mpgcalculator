'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { ReadonlyURLSearchParams } from 'next/navigation'
import VehicleLookup from './VehicleLookup'
import { Vehicle } from '../types/vehicle'
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Share2, X } from 'lucide-react'
import VehicleComparisonRoadTripCTA from './VehicleComparisonRoadTripCTA'

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

interface VehicleComparisonProps {
  searchParams?: ReadonlyURLSearchParams
}

export default function VehicleComparison({ searchParams }: VehicleComparisonProps) {
  const [selectedVehicles, setSelectedVehicles] = useState<Vehicle[]>([])
  const [shareUrl, setShareUrl] = useState<string>('')
  const router = useRouter()

  // Load vehicles from URL parameters on component mount
  useEffect(() => {
    const loadVehiclesFromUrl = async () => {
      if (!searchParams) return;
      
      const vehicles = searchParams.getAll('v')
      if (vehicles.length > 0) {
        // Load each vehicle's details
        const loadedVehicles = await Promise.all(
          vehicles.map(async (vehicleId) => {
            try {
              const [make, model, year] = vehicleId.split('__')
              const response = await fetch(
                `/api/vehicles/details?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&year=${year}`
              )
              if (!response.ok) throw new Error('Failed to fetch vehicle')
              const data = await response.json()
              return data[0]
            } catch (error) {
              console.error('Error loading vehicle:', error)
              return null
            }
          })
        )
        setSelectedVehicles(loadedVehicles.filter(v => v !== null))
      }
    }

    loadVehiclesFromUrl()
  }, [searchParams])

  // Update URL when vehicles change
  useEffect(() => {
    if (selectedVehicles.length > 0) {
      const params = new URLSearchParams()
      selectedVehicles.forEach(vehicle => {
        const vehicleId = `${vehicle.make}__${vehicle.model}__${vehicle.year}`
        params.append('v', vehicleId)
      })
      setShareUrl(`${window.location.origin}/fuel-economy-compare?${params.toString()}`)
      router.push(`/fuel-economy-compare?${params.toString()}`, { scroll: false })
    }
  }, [selectedVehicles, router])

  // Handle adding a vehicle to comparison
  const handleAddVehicle = (vehicle: Vehicle) => {
    if (selectedVehicles.length < 3) {
      setSelectedVehicles([...selectedVehicles, vehicle])
    }
  }

  // Handle removing a vehicle from comparison
  const handleRemoveVehicle = (index: number) => {
    setSelectedVehicles(selectedVehicles.filter((_, i) => i !== index))
  }

  // Handle sharing comparison URL
  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      alert('Comparison URL copied to clipboard!')
    } catch (err) {
      console.error('Failed to copy URL:', err)
    }
  }

  return (
    <div className="space-y-8">
      {/* Vehicle Selection */}
      {selectedVehicles.length < 3 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Add Vehicle to Compare</CardTitle>
          </CardHeader>
          <CardContent>
            <VehicleLookup 
              onVehicleSelect={handleAddVehicle}
              showAddComparison={true}
            />
          </CardContent>
        </Card>
      )}

      {/* Comparison Display */}
      {selectedVehicles.length > 0 && (
        <div className="space-y-6">
          {/* Share Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleShare}
              variant="outline"
              className="text-green-500 hover:text-green-800"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share Comparison
            </Button>
          </div>

          {/* Comparison Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {selectedVehicles.map((vehicle, index) => (
              <Card key={`${vehicle.make}-${vehicle.model}-${vehicle.year}-${index}`} 
                    className="bg-gray-800 border-gray-700">
                <CardHeader className="bg-gradient-to-r from-blue-800 to-blue-900 relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 text-gray-300 hover:text-white hover:bg-blue-700/50"
                    onClick={() => handleRemoveVehicle(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <CardTitle className="text-white text-lg">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Primary Fuel Economy */}
                  <div className="space-y-4">
                    <h3 className="text-blue-300 font-semibold">
                      {vehicle.fuelType1} Fuel Economy
                    </h3>
                    <div className="grid gap-2">
                      <div className="bg-gray-700/50 p-3 rounded flex justify-between">
                        <span className="text-gray-300">Combined</span>
                        <span className="text-green-400">
                          {vehicle.comb08} {usesMPGe(vehicle.fuelType1) ? 'MPGe' : 'MPG'}
                        </span>
                      </div>
                      <div className="bg-gray-700/50 p-3 rounded flex justify-between">
                        <span className="text-gray-300">City</span>
                        <span className="text-blue-400">
                          {vehicle.city08} {usesMPGe(vehicle.fuelType1) ? 'MPGe' : 'MPG'}
                        </span>
                      </div>
                      <div className="bg-gray-700/50 p-3 rounded flex justify-between">
                        <span className="text-gray-300">Highway</span>
                        <span className="text-red-400">
                          {vehicle.highway08} {usesMPGe(vehicle.fuelType1) ? 'MPGe' : 'MPG'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Alternative Fuel (if available) */}
                  {vehicle.fuelType2 && (
                    <div className="space-y-4">
                      <h3 className="text-yellow-300 font-semibold">
                        {vehicle.fuelType2} Fuel Economy
                      </h3>
                      <div className="grid gap-2">
                        {vehicle.combA08 && (
                          <div className="bg-gray-700/50 p-3 rounded flex justify-between">
                            <span className="text-gray-300">Combined</span>
                            <span className="text-green-400">
                              {vehicle.combA08} {usesMPGe(vehicle.fuelType2 || '') ? 'MPGe' : 'MPG'}
                            </span>
                          </div>
                        )}
                        {vehicle.cityA08 && (
                          <div className="bg-gray-700/50 p-3 rounded flex justify-between">
                            <span className="text-gray-300">City</span>
                            <span className="text-blue-400">
                              {vehicle.cityA08} {usesMPGe(vehicle.fuelType2 || '') ? 'MPGe' : 'MPG'}
                            </span>
                          </div>
                        )}
                        {vehicle.highwayA08 && (
                          <div className="bg-gray-700/50 p-3 rounded flex justify-between">
                            <span className="text-gray-300">Highway</span>
                            <span className="text-red-400">
                              {vehicle.highwayA08} {usesMPGe(vehicle.fuelType2 || '') ? 'MPGe' : 'MPG'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* PHEV Mode (if available) */}
                  {(vehicle.phevCity || vehicle.phevHwy || vehicle.phevComb) && (
                    <div className="space-y-4">
                      <h3 className="text-green-300 font-semibold">
                        Hybrid Mode Fuel Economy
                      </h3>
                      <div className="grid gap-2">
                        {vehicle.phevComb && (
                          <div className="bg-gray-700/50 p-3 rounded flex justify-between">
                            <span className="text-gray-300">Combined</span>
                            <span className="text-green-400">{vehicle.phevComb} MPGe</span>
                          </div>
                        )}
                        {vehicle.phevCity && (
                          <div className="bg-gray-700/50 p-3 rounded flex justify-between">
                            <span className="text-gray-300">City</span>
                            <span className="text-blue-400">{vehicle.phevCity} MPGe</span>
                          </div>
                        )}
                        {vehicle.phevHwy && (
                          <div className="bg-gray-700/50 p-3 rounded flex justify-between">
                            <span className="text-gray-300">Highway</span>
                            <span className="text-red-400">{vehicle.phevHwy} MPGe</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Environmental Impact */}
                  {(vehicle.co2 !== null || vehicle.ghgScore !== null) && (
                    <div className="space-y-4">
                      <h3 className="text-green-300 font-semibold">Environmental Impact</h3>
                      <div className="grid gap-2">
                        {vehicle.co2 !== null && (
                          <div className="bg-gray-700/50 p-3 rounded flex justify-between">
                            <span className="text-gray-300">CO₂ Emissions</span>
                            <span className="text-orange-400">{vehicle.co2} g/mi</span>
                          </div>
                        )}
                        {vehicle.ghgScore !== null && (
                          <div className="bg-gray-700/50 p-3 rounded flex justify-between">
                            <span className="text-gray-300">GHG Score</span>
                            <span className="text-green-400">{vehicle.ghgScore}/10</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Specifications */}
                  <div className="space-y-4">
                    <h3 className="text-purple-300 font-semibold">Specifications</h3>
                    <div className="grid gap-2">
                      <div className="bg-gray-700/50 p-3 rounded flex justify-between">
                        <span className="text-gray-300">Class</span>
                        <span className="text-purple-400">{vehicle.VClass}</span>
                      </div>
                      <div className="bg-gray-700/50 p-3 rounded flex justify-between">
                        <span className="text-gray-300">Engine</span>
                        <span className="text-blue-400">{vehicle.displ}L</span>
                      </div>
                      <div className="bg-gray-700/50 p-3 rounded flex justify-between">
                        <span className="text-gray-300">Cylinders</span>
                        <span className="text-indigo-400">{vehicle.cylinders}</span>
                      </div>
                      <div className="bg-gray-700/50 p-3 rounded flex justify-between">
                        <span className="text-gray-300">Drive</span>
                        <span className="text-cyan-400">{vehicle.drive}</span>
                      </div>
                      <div className="bg-gray-700/50 p-3 rounded flex justify-between">
                        <span className="text-gray-300">Transmission</span>
                        <span className="text-orange-400">{vehicle.trany}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Road Trip Calculator CTA */}
          <VehicleComparisonRoadTripCTA />
        </div>
      )}

      {/* Empty State */}
      {selectedVehicles.length === 0 && (
        <div className="text-center py-12 bg-gray-800 rounded-lg border border-gray-700">
          <p className="text-gray-300">
            Select vehicles to compare MPG.
          </p>
        </div>
      )}
    </div>
  )
} 