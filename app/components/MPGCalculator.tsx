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

// Interface for vehicle data from the db
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
  const vehiclesPerPage = 10  // Number of vehicles shown per page
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
    <Card className="w-full max-w-2xl bg-gray-800 text-white shadow-xl rounded-xl overflow-hidden font-mono">
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
        <Card className="w-full max-w-2xl bg-gray-800 text-white font-mono">
          <CardHeader>
            <CardTitle>Vehicles with Similar Fuel Economy</CardTitle>
            <CardDescription className="text-gray-300">
              Showing vehicles with combined MPG between {Math.floor(result.mpg! - 2)} and {Math.ceil(result.mpg! + 2)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentVehicles.map((vehicle, index) => (
              <div key={index} className="bg-gray-900/50 rounded-lg border border-gray-700 overflow-hidden">
                {/* Vehicle Header */}
                <div className="bg-gradient-to-r from-blue-800 to-blue-900 p-4 flex items-center gap-3">
                  <CarFront className="h-6 w-6 text-white" />
                  <h3 className="text-lg font-semibold text-white">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </h3>
                </div>

                <div className="p-4 space-y-4">
                  {/* Primary Fuel Economy */}
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <h4 className="text-blue-300 font-semibold flex items-center gap-2 mb-3">
                      <Fuel className="h-4 w-4 text-yellow-400" />
                      Primary Fuel ({vehicle.fuelType1 || 'Not Specified'})
                    </h4>
                    <div className="grid gap-2">
                      <div className="bg-gray-700/50 p-3 rounded flex items-center justify-between">
                        <span className="text-gray-300">Combined</span>
                        <span className="text-xl text-green-400">
                          {vehicle.comb08} {vehicle.fuelType1 === 'Regular Gasoline' || vehicle.fuelType1 === 'Premium Gasoline' ? 'MPG' : 'MPGe'}
                        </span>
                      </div>
                      <div className="bg-gray-700/50 p-3 rounded flex items-center justify-between">
                        <span className="text-gray-300">City</span>
                        <span className="text-xl text-blue-400">
                          {vehicle.city08} {vehicle.fuelType1 === 'Regular Gasoline' || vehicle.fuelType1 === 'Premium Gasoline' ? 'MPG' : 'MPGe'}
                        </span>
                      </div>
                      <div className="bg-gray-700/50 p-3 rounded flex items-center justify-between">
                        <span className="text-gray-300">Highway</span>
                        <span className="text-xl text-red-400">
                          {vehicle.highway08} {vehicle.fuelType1 === 'Regular Gasoline' || vehicle.fuelType1 === 'Premium Gasoline' ? 'MPG' : 'MPGe'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Alternative Fuel */}
                  {vehicle.fuelType2 && (vehicle.combA08 || vehicle.cityA08 || vehicle.highwayA08) && (
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <h4 className="text-yellow-300 font-semibold flex items-center gap-2 mb-3">
                        <Fuel className="h-4 w-4 text-yellow-400" />
                        Alternative Fuel ({vehicle.fuelType2})
                      </h4>
                      <div className="grid gap-2">
                        {vehicle.combA08 && (
                          <div className="bg-gray-700/50 p-3 rounded flex items-center justify-between">
                            <span className="text-gray-300">Combined</span>
                            <span className="text-xl text-green-400">
                              {vehicle.combA08} {vehicle.fuelType2 === 'Regular Gasoline' || vehicle.fuelType2 === 'Premium Gasoline' ? 'MPG' : 'MPGe'}
                            </span>
                          </div>
                        )}
                        {vehicle.cityA08 && (
                          <div className="bg-gray-700/50 p-3 rounded flex items-center justify-between">
                            <span className="text-gray-300">City</span>
                            <span className="text-xl text-blue-400">
                              {vehicle.cityA08} {vehicle.fuelType2 === 'Regular Gasoline' || vehicle.fuelType2 === 'Premium Gasoline' ? 'MPG' : 'MPGe'}
                            </span>
                          </div>
                        )}
                        {vehicle.highwayA08 && (
                          <div className="bg-gray-700/50 p-3 rounded flex items-center justify-between">
                            <span className="text-gray-300">Highway</span>
                            <span className="text-xl text-red-400">
                              {vehicle.highwayA08} {vehicle.fuelType2 === 'Regular Gasoline' || vehicle.fuelType2 === 'Premium Gasoline' ? 'MPG' : 'MPGe'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* PHEV Mode */}
                  {(vehicle.phevComb || vehicle.phevCity || vehicle.phevHwy) && (
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <h4 className="text-green-300 font-semibold flex items-center gap-2 mb-3">
                        <Fuel className="h-4 w-4 text-green-400" />
                        Hybrid Fuel Economy
                      </h4>
                      <div className="grid gap-2">
                        {vehicle.phevComb && (
                          <div className="bg-gray-700/50 p-3 rounded flex items-center justify-between">
                            <span className="text-gray-300">Combined</span>
                            <span className="text-xl text-green-400">
                              {vehicle.phevComb} MPGe
                            </span>
                          </div>
                        )}
                        {vehicle.phevCity && (
                          <div className="bg-gray-700/50 p-3 rounded flex items-center justify-between">
                            <span className="text-gray-300">City</span>
                            <span className="text-xl text-blue-400">
                              {vehicle.phevCity} MPGe
                            </span>
                          </div>
                        )}
                        {vehicle.phevHwy && (
                          <div className="bg-gray-700/50 p-3 rounded flex items-center justify-between">
                            <span className="text-gray-300">Highway</span>
                            <span className="text-xl text-red-400">
                              {vehicle.phevHwy} MPGe
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Vehicle Specifications */}
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <h4 className="text-purple-300 font-semibold mb-3">Vehicle Specifications</h4>
                    <div className="grid gap-2">
                      {vehicle.VClass && (
                        <div className="bg-gray-700/50 p-3 rounded flex items-center justify-between">
                          <span className="text-gray-300">Class</span>
                          <span className="text-purple-400">{vehicle.VClass}</span>
                        </div>
                      )}
                      {vehicle.trany && (
                        <div className="bg-gray-700/50 p-3 rounded flex items-center justify-between">
                          <span className="text-gray-300">Transmission</span>
                          <span className="text-orange-400">{vehicle.trany}</span>
                        </div>
                      )}
                      {vehicle.drive && (
                        <div className="bg-gray-700/50 p-3 rounded flex items-center justify-between">
                          <span className="text-gray-300">Drive</span>
                          <span className="text-cyan-400">{vehicle.drive}</span>
                        </div>
                      )}
                      {vehicle.displ && (
                        <div className="bg-gray-700/50 p-3 rounded flex items-center justify-between">
                          <span className="text-gray-300">Engine</span>
                          <span className="text-blue-400">{vehicle.displ}L</span>
                        </div>
                      )}
                      {vehicle.cylinders && (
                        <div className="bg-gray-700/50 p-3 rounded flex items-center justify-between">
                          <span className="text-gray-300">Cylinders</span>
                          <span className="text-indigo-400">{vehicle.cylinders}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Features */}
                  {(vehicle.startStop === 'Y' || vehicle.sCharger === 'Y' || vehicle.tCharger === 'Y' || vehicle.phevBlended) && (
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <h4 className="text-green-300 font-semibold flex items-center gap-2 mb-3">
                        <Zap className="h-4 w-4 text-green-400" />
                        Features
                      </h4>
                      <div className="grid gap-2">
                        {vehicle.startStop === 'Y' && (
                          <div className="bg-gray-700/50 p-3 rounded flex items-center gap-2">
                            <Battery className="h-4 w-4 text-green-400" />
                            <span className="text-gray-300">Start-Stop Technology</span>
                          </div>
                        )}
                        {vehicle.phevBlended && (
                          <div className="bg-gray-700/50 p-3 rounded flex items-center gap-2">
                            <Zap className="h-4 w-4 text-green-400" />
                            <span className="text-gray-300">Plug-in Hybrid</span>
                          </div>
                        )}
                        {(vehicle.sCharger === 'Y' || vehicle.tCharger === 'Y') && (
                          <div className="bg-gray-700/50 p-3 rounded flex items-center gap-2">
                            <Leaf className="h-4 w-4 text-blue-400" />
                            <span className="text-gray-300">
                              {vehicle.sCharger === 'Y' ? 'Supercharged' : 'Turbocharged'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center space-x-2 mt-4">
                <Button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  variant="outline"
                  size="sm"
                  className="text-blue-300 hover:text-blue-500"
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
                  size="sm"
                  className="text-blue-300 hover:text-blue-500"
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

