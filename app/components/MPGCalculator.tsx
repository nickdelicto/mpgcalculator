'use client'

import React from 'react'
import { useState } from 'react'
// UI component imports from shadcn/ui library
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card"
// Icon imports from lucide-react
import { PlusCircle, Trash2, CarFront, Fuel, Gauge, Car, Cog, Compass, BarChart2, Circle, Zap, Leaf, Battery } from 'lucide-react'
import { VersionToggle } from './VersionToggle'

// Interface for individual trip data entry
interface Trip {
  distance: string    // Distance traveled (miles/km)
  fuel: string       // Fuel consumed (gallons/liters)
  costPerUnit: string // Cost per unit of fuel
}

// Interface for vehicle data from the database
// Matches the database schema and API response
interface Vehicle {
  year: number
  make: string
  model: string
  VClass: string           // Vehicle class (e.g., SUV, Sedan)
  trany: string           // Transmission type
  drive: string           // Drive type (e.g., FWD, AWD)
  displ: number          // Engine displacement in liters
  cylinders: number      // Number of cylinders
  fuelType1: string      // Primary fuel type
  fuelType2: string | null // Alternative fuel type (if any)
  city08: number         // City MPG (primary fuel)
  highway08: number      // Highway MPG (primary fuel)
  comb08: number         // Combined MPG (primary fuel)
  cityA08: number | null  // City MPG (alternative fuel)
  highwayA08: number | null // Highway MPG (alternative fuel)
  combA08: number | null   // Combined MPG (alternative fuel)
  startStop: string       // Start-stop technology (Y/N)
  sCharger: string       // Supercharger (Y/N)
  tCharger: string       // Turbocharger (Y/N)
  phevBlended: boolean   // Plug-in hybrid indicator
  phevCity: number | null // PHEV city MPGe
  phevHwy: number | null  // PHEV highway MPGe
  phevComb: number | null // PHEV combined MPGe
  co2: number | null     // CO2 emissions (primary fuel)
  co2A: number | null    // CO2 emissions (alternative fuel)
  ghgScore: number | null // Greenhouse gas score (primary fuel)
  ghgScoreA: number | null // Greenhouse gas score (alternative fuel)
}

export default function MPGCalculator() {
  // State for calculator mode and input management
  const [isAdvanced, setIsAdvanced] = useState(false)  // Toggle between simple/advanced mode
  const [trips, setTrips] = useState<Trip[]>([{ distance: '', fuel: '', costPerUnit: '' }])
  const [distanceUnit, setDistanceUnit] = useState('miles')
  const [fuelUnit, setFuelUnit] = useState('gallons')
  
  // State for calculation results
  const [result, setResult] = useState<{ 
    mpg: number | null,           // Calculated MPG
    totalCost: number | null,     // Total fuel cost (advanced mode only)
    costPerMile: number | null    // Cost per mile/km (advanced mode only)
  }>({ mpg: null, totalCost: null, costPerMile: null })

  // State for vehicle comparison feature
  const [showComparison, setShowComparison] = useState(false)  // Controls visibility of comparison section
  const [similarVehicles, setSimilarVehicles] = useState<Vehicle[]>([])  // Stores matching vehicles
  const [currentPage, setCurrentPage] = useState(1)  // Current page in pagination
  const vehiclesPerPage = 5  // Number of vehicles shown per page
  const [isLoadingSimilar, setIsLoadingSimilar] = useState(false)  // Loading state for API calls

  // Trip management functions
  const addTrip = () => {
    setTrips([...trips, { distance: '', fuel: '', costPerUnit: '' }])
  }

  const removeTrip = (index: number) => {
    setTrips(trips.filter((_, i) => i !== index))
  }

  const updateTrip = (index: number, field: keyof Trip, value: string) => {
    const newTrips = [...trips]
    newTrips[index][field] = value
    setTrips(newTrips)
  }

  // Fetch similar vehicles from the API
  const findSimilarVehicles = async (mpg: number) => {
    setIsLoadingSimilar(true)
    try {
      const response = await fetch(`/api/vehicles/similar?mpg=${mpg}`)
      if (!response.ok) throw new Error('Failed to fetch similar vehicles')
      const data = await response.json()
      
      console.log('Frontend Received Data:', JSON.stringify(data[0], null, 2))
      
      setSimilarVehicles(data)
      setShowComparison(true)
    } catch (error) {
      console.error('Error fetching similar vehicles:', error)
    } finally {
      setIsLoadingSimilar(false)
    }
  }

  // Main MPG calculation function
  const calculateMPG = () => {
    let totalDistance = 0
    let totalFuel = 0
    let totalCost = 0

    // Calculate totals from all trips
    trips.forEach(trip => {
      const distance = parseFloat(trip.distance)
      const fuel = parseFloat(trip.fuel)
      const costPerUnit = parseFloat(trip.costPerUnit)

      if (!isNaN(distance) && !isNaN(fuel) && fuel !== 0) {
        totalDistance += distance
        totalFuel += fuel
        if (isAdvanced && !isNaN(costPerUnit)) {
          totalCost += fuel * costPerUnit
        }
      }
    })

    // Validate inputs
    if (totalDistance === 0 || totalFuel === 0) {
      setResult({ mpg: null, totalCost: null, costPerMile: null })
      return
    }

    let mpg = totalDistance / totalFuel

    // Unit conversions if necessary
    if (distanceUnit === 'kilometers') {
      mpg *= 0.621371 // Convert km to miles
    }
    if (fuelUnit === 'liters') {
      mpg *= 3.78541 // Convert liters to gallons
    }

    // Format results
    const averageMpg = parseFloat(mpg.toFixed(2))
    const finalTotalCost = isAdvanced ? parseFloat(totalCost.toFixed(2)) : null
    const costPerMile = isAdvanced ? parseFloat((totalCost / totalDistance).toFixed(2)) : null

    // Update results and fetch similar vehicles
    setResult({ 
      mpg: averageMpg, 
      totalCost: finalTotalCost, 
      costPerMile: costPerMile 
    })

    findSimilarVehicles(mpg)
  }

  // Pagination calculations
  const totalPages = Math.ceil(similarVehicles.length / vehiclesPerPage)
  const currentVehicles = similarVehicles.slice(
    (currentPage - 1) * vehiclesPerPage,
    currentPage * vehiclesPerPage
  )

  // Component render
  return (
    <div className="space-y-6">
      {/* Calculator Card */}
      <Card className="w-full max-w-2xl bg-gray-800 text-white shadow-xl rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 p-6">
          <CardTitle className="text-2xl font-bold text-center">MPG Calculator</CardTitle>
          <CardDescription className="text-gray-200 text-center">Free Fuel Efficiency Calculator with Cost Analysis</CardDescription>
          <div className="mt-4 flex justify-end">
            <VersionToggle isAdvanced={isAdvanced} onToggle={setIsAdvanced} />
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {isAdvanced ? (
            <>
              {trips.map((trip, index) => (
                <div key={index} className="space-y-4 p-4 bg-gray-700 rounded-lg">
                  <div className="flex justify-between items-center">
                    <Label htmlFor={`distance-${index}`} className="text-lg">Trip {index + 1} Distance</Label>
                    <div className="flex space-x-2">
                      <Input
                        id={`distance-${index}`}
                        type="number"
                        placeholder="0.0"
                        value={trip.distance}
                        onChange={(e) => updateTrip(index, 'distance', e.target.value)}
                        className="w-24 bg-gray-600 border-gray-500 text-right"
                      />
                      <Select value={distanceUnit} onValueChange={setDistanceUnit}>
                        <SelectTrigger className="w-[90px] bg-gray-600 border-gray-500">
                          <SelectValue placeholder="Unit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="miles">Miles</SelectItem>
                          <SelectItem value="kilometers">Km</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <Label htmlFor={`fuel-${index}`} className="text-lg">Fuel Used</Label>
                    <div className="flex space-x-2">
                      <Input
                        id={`fuel-${index}`}
                        type="number"
                        placeholder="0.0"
                        value={trip.fuel}
                        onChange={(e) => updateTrip(index, 'fuel', e.target.value)}
                        className="w-24 bg-gray-600 border-gray-500 text-right"
                      />
                      <Select value={fuelUnit} onValueChange={setFuelUnit}>
                        <SelectTrigger className="w-[90px] bg-gray-600 border-gray-500">
                          <SelectValue placeholder="Unit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gallons">Gallons</SelectItem>
                          <SelectItem value="liters">Liters</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <Label htmlFor={`cost-${index}`} className="text-lg">Cost per {fuelUnit === 'gallons' ? 'Gallon' : 'Liter'}</Label>
                    <Input
                      id={`cost-${index}`}
                      type="number"
                      placeholder="0.00"
                      value={trip.costPerUnit}
                      onChange={(e) => updateTrip(index, 'costPerUnit', e.target.value)}
                      className="w-24 bg-gray-600 border-gray-500 text-right"
                    />
                  </div>
                  {trips.length > 1 && (
                    <Button variant="destructive" size="icon" onClick={() => removeTrip(index)} className="mt-2">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button onClick={addTrip} variant="outline" className="w-full text-white bg-gray-700 hover:bg-gray-600">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Trip
              </Button>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label htmlFor="distance" className="text-lg">Distance</Label>
                <div className="flex space-x-2">
                  <Input
                    id="distance"
                    type="number"
                    placeholder="0.0"
                    value={trips[0].distance}
                    onChange={(e) => updateTrip(0, 'distance', e.target.value)}
                    className="w-24 bg-gray-700 border-gray-600 text-right"
                  />
                  <Select value={distanceUnit} onValueChange={setDistanceUnit}>
                    <SelectTrigger className="w-[90px] bg-gray-700 border-gray-600">
                      <SelectValue placeholder="Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="miles">Miles</SelectItem>
                      <SelectItem value="kilometers">Km</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <Label htmlFor="fuel" className="text-lg">Fuel Used</Label>
                <div className="flex space-x-2">
                  <Input
                    id="fuel"
                    type="number"
                    placeholder="0.0"
                    value={trips[0].fuel}
                    onChange={(e) => updateTrip(0, 'fuel', e.target.value)}
                    className="w-24 bg-gray-700 border-gray-600 text-right"
                  />
                  <Select value={fuelUnit} onValueChange={setFuelUnit}>
                    <SelectTrigger className="w-[90px] bg-gray-700 border-gray-600">
                      <SelectValue placeholder="Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gallons">Gallons</SelectItem>
                      <SelectItem value="liters">Liters</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          <Button onClick={calculateMPG} className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-6">
            Calculate
          </Button>
          <div className={`grid ${isAdvanced ? 'grid-cols-3' : 'grid-cols-1'} gap-4`}>
            <div className="flex flex-col items-center justify-center h-32 bg-gray-900 rounded-xl">
              {result.mpg !== null ? (
                <>
                  <p className="text-4xl font-bold text-green-400">{result.mpg}</p>
                  <p className="text-xl text-gray-400">MPG</p>
                </>
              ) : (
                <p className="text-2xl text-gray-500">-- MPG</p>
              )}
            </div>
            {isAdvanced && (
              <>
                <div className="flex flex-col items-center justify-center h-32 bg-gray-900 rounded-xl">
                  {result.totalCost !== null ? (
                    <>
                      <p className="text-4xl font-bold text-yellow-400">${result.totalCost}</p>
                      <p className="text-xl text-gray-400">Total Cost</p>
                    </>
                  ) : (
                    <p className="text-2xl text-gray-500">-- Total Cost</p>
                  )}
                </div>
                <div className="flex flex-col items-center justify-center h-32 bg-gray-900 rounded-xl">
                  {result.costPerMile !== null ? (
                    <>
                      <p className="text-4xl font-bold text-blue-400">${result.costPerMile}</p>
                      <p className="text-xl text-gray-400">Cost/{distanceUnit === 'miles' ? 'Mile' : 'Km'}</p>
                    </>
                  ) : (
                    <p className="text-2xl text-gray-500">-- Cost/{distanceUnit === 'miles' ? 'Mile' : 'Km'}</p>
                  )}
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Loading indicator for vehicle comparison */}
      {isLoadingSimilar && (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        </div>
      )}

      {/* Similar Vehicles Comparison Section */}
      {showComparison && similarVehicles.length > 0 && (
        <Card className="w-full max-w-2xl bg-gray-800 text-white">
          <CardHeader>
            <CardTitle>Vehicles with Similar Fuel Economy</CardTitle>
            <CardDescription className="text-gray-300">
              Showing vehicles with combined MPG between {Math.floor(result.mpg! - 2)} and {Math.ceil(result.mpg! + 2)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Vehicle Cards */}
            {currentVehicles.map((vehicle, index) => {
              console.log(`Rendering vehicle ${index}:`, JSON.stringify(vehicle, null, 2))
              
              return (
                <div key={index} className="p-4 bg-gray-700 rounded-lg flex items-center space-x-4">
                  {/* Vehicle Icon */}
                  <div className="flex-shrink-0">
                    <CarFront className="h-12 w-12 text-blue-400" />
                  </div>
                  {/* Vehicle Details */}
                  <div className="flex-grow">
                    <h3 className="text-lg font-semibold">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </h3>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      {/* Left Column - Fuel Efficiency Information */}
                      <div>
                        {/* Primary Fuel (fuelType1) MPG */}
                        <div>
                          <p className="text-blue-300 font-semibold flex items-center gap-2">
                            <Fuel className="h-4 w-4 text-yellow-400" />
                            Primary Fuel ({vehicle.fuelType1 || 'Not Specified'})
                          </p>
                          {vehicle.comb08 && (
                            <p className="text-gray-300 flex items-center gap-2">
                              <Gauge className="h-4 w-4 text-blue-400" />
                              Combined: {vehicle.comb08} {vehicle.fuelType1 === 'Regular Gasoline' || vehicle.fuelType1 === 'Premium Gasoline' ? 'MPG' : 'MPGe'}
                            </p>
                          )}
                          {vehicle.city08 && (
                            <p className="text-gray-300 flex items-center gap-2">
                              <Gauge className="h-4 w-4 text-green-400" />
                              City: {vehicle.city08} {vehicle.fuelType1 === 'Regular Gasoline' || vehicle.fuelType1 === 'Premium Gasoline' ? 'MPG' : 'MPGe'}
                            </p>
                          )}
                          {vehicle.highway08 && (
                            <p className="text-gray-300 flex items-center gap-2">
                              <Gauge className="h-4 w-4 text-red-400" />
                              Highway: {vehicle.highway08} {vehicle.fuelType1 === 'Regular Gasoline' || vehicle.fuelType1 === 'Premium Gasoline' ? 'MPG' : 'MPGe'}
                            </p>
                          )}
                        </div>
                        
                        {/* Alternative Fuel (fuelType2) MPG if available */}
                        {vehicle.fuelType2 && (vehicle.combA08 || vehicle.cityA08 || vehicle.highwayA08) && (
                          <div className="mt-2 border-t border-gray-600 pt-2">
                            <p className="text-blue-300 font-semibold flex items-center gap-2">
                              <Fuel className="h-4 w-4 text-yellow-400" />
                              Alternative Fuel ({vehicle.fuelType2})
                            </p>
                            {vehicle.combA08 && (
                              <p className="text-gray-300 flex items-center gap-2">
                                <Gauge className="h-4 w-4 text-blue-400" />
                                Combined: {vehicle.combA08} {vehicle.fuelType2 === 'Regular Gasoline' || vehicle.fuelType2 === 'Premium Gasoline' ? 'MPG' : 'MPGe'}
                              </p>
                            )}
                            {vehicle.cityA08 && (
                              <p className="text-gray-300 flex items-center gap-2">
                                <Gauge className="h-4 w-4 text-green-400" />
                                City: {vehicle.cityA08} {vehicle.fuelType2 === 'Regular Gasoline' || vehicle.fuelType2 === 'Premium Gasoline' ? 'MPG' : 'MPGe'}
                              </p>
                            )}
                            {vehicle.highwayA08 && (
                              <p className="text-gray-300 flex items-center gap-2">
                                <Gauge className="h-4 w-4 text-red-400" />
                                Highway: {vehicle.highwayA08} {vehicle.fuelType2 === 'Regular Gasoline' || vehicle.fuelType2 === 'Premium Gasoline' ? 'MPG' : 'MPGe'}
                              </p>
                            )}
                          </div>
                        )}
                        
                        {/* Plug-in Hybrid MPGe if available */}
                        {(vehicle.phevComb || vehicle.phevCity || vehicle.phevHwy) && (
                          <div className="mt-2 border-t border-gray-600 pt-2">
                            <p className="text-green-300 font-semibold">Hybrid Fuel Mode</p>
                            {vehicle.phevComb && <p className="text-gray-300">Combined: {vehicle.phevComb} MPGe</p>}
                            {vehicle.phevCity && <p className="text-gray-300">City: {vehicle.phevCity} MPGe</p>}
                            {vehicle.phevHwy && <p className="text-gray-300">Highway: {vehicle.phevHwy} MPGe</p>}
                          </div>
                        )}
                      </div>

                      {/* Right Column - Vehicle Specifications */}
                      <div>
                        {vehicle.VClass && (
                          <p className="text-gray-300 flex items-center gap-2">
                            <Car className="h-4 w-4 text-purple-400" />
                            Class: {vehicle.VClass}
                          </p>
                        )}
                        {vehicle.trany && (
                          <p className="text-gray-300 flex items-center gap-2">
                            <Cog className="h-4 w-4 text-orange-400" />
                            Transmission: {vehicle.trany}
                          </p>
                        )}
                        {vehicle.drive && (
                          <p className="text-gray-300 flex items-center gap-2">
                            <Compass className="h-4 w-4 text-cyan-400" />
                            Drive: {vehicle.drive}
                          </p>
                        )}
                        {vehicle.displ && (
                          <p className="text-gray-300 flex items-center gap-2">
                            <BarChart2 className="h-4 w-4 text-red-400" />
                            Engine: {vehicle.displ}L
                          </p>
                        )}
                        {vehicle.cylinders && (
                          <p className="text-gray-300 flex items-center gap-2">
                            <Circle className="h-4 w-4 text-indigo-400" />
                            Cylinders: {vehicle.cylinders}
                          </p>
                        )}
                        
                        {/* Advanced Features */}
                        <div className="mt-2">
                          {vehicle.startStop === 'Y' && (
                            <p className="text-green-400 flex items-center gap-2">
                              <Battery className="h-4 w-4" />
                              Start-Stop Technology
                            </p>
                          )}
                          {vehicle.phevBlended && (
                            <p className="text-green-400 flex items-center gap-2">
                              <Zap className="h-4 w-4" />
                              Plug-in Hybrid
                            </p>
                          )}
                          {(vehicle.sCharger === 'Y' || vehicle.tCharger === 'Y') && (
                            <p className="text-blue-400 flex items-center gap-2">
                              <Leaf className="h-4 w-4" />
                              {vehicle.sCharger === 'Y' ? 'Supercharged' : 'Turbocharged'}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center space-x-2 mt-4">
                <Button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  variant="outline"
                >
                  Previous
                </Button>
                <span className="flex items-center px-4 text-gray-300">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  variant="outline"
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

