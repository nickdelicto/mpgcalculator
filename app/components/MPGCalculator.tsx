'use client'

import React from 'react'
import { useState } from 'react'
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card"
import { PlusCircle, Trash2 } from 'lucide-react'
import { VersionToggle } from './VersionToggle'

interface Trip {
  distance: string
  fuel: string
  costPerUnit: string
}

export default function MPGCalculator() {
  const [isAdvanced, setIsAdvanced] = useState(false)
  const [trips, setTrips] = useState<Trip[]>([{ distance: '', fuel: '', costPerUnit: '' }])
  const [distanceUnit, setDistanceUnit] = useState('miles')
  const [fuelUnit, setFuelUnit] = useState('gallons')
  const [result, setResult] = useState<{ mpg: number | null, totalCost: number | null, costPerMile: number | null }>({ mpg: null, totalCost: null, costPerMile: null })

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

  const calculateMPG = () => {
    let totalDistance = 0
    let totalFuel = 0
    let totalCost = 0

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

    if (totalDistance === 0 || totalFuel === 0) {
      setResult({ mpg: null, totalCost: null, costPerMile: null })
      return
    }

    let mpg = totalDistance / totalFuel

    if (distanceUnit === 'kilometers') {
      mpg *= 0.621371 // Convert km to miles for MPG calculation
    }

    if (fuelUnit === 'liters') {
      mpg *= 3.78541 // Convert liters to gallons for MPG calculation
    }

    const averageMpg = parseFloat(mpg.toFixed(2))
    const finalTotalCost = isAdvanced ? parseFloat(totalCost.toFixed(2)) : null
    const costPerMile = isAdvanced ? parseFloat((totalCost / totalDistance).toFixed(2)) : null

    setResult({ 
      mpg: averageMpg, 
      totalCost: finalTotalCost, 
      costPerMile: costPerMile 
    })
  }

  return (
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
  )
}

