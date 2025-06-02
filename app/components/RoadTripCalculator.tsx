'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import { Alert, AlertDescription } from '../../components/ui/alert'
import { MapPin, Car, DollarSign, Route, Info, Navigation } from 'lucide-react'
import DynamicRoadTripMap from './DynamicRoadTripMap'
import RoadTripVehicleEfficiency from './RoadTripVehicleEfficiency'
import RoadTripCosts from './RoadTripCosts'
import AddressAutocomplete from './AddressAutocomplete'
import RoadTripDirections from './RoadTripDirections'
import { Coordinates, RouteData, geocodeAddress, calculateRoute } from '../utils/routingService'
import { RoadTripTollsInput } from './RoadTripTollsInput'

export default function RoadTripCalculator() {
  // State for form inputs
  const [startLocation, setStartLocation] = useState('')
  const [endLocation, setEndLocation] = useState('')
  const [tollCost, setTollCost] = useState(0)
  
  // Field-level validation errors
  const [validationErrors, setValidationErrors] = useState({
    startLocation: '',
    endLocation: '',
    vehicleEfficiency: ''
  })
  
  // State for coordinates and route
  const [startCoords, setStartCoords] = useState<Coordinates | null>(null)
  const [endCoords, setEndCoords] = useState<Coordinates | null>(null)
  const [route, setRoute] = useState<RouteData | null>(null)
  
  // State for vehicle efficiency
  const [vehicleEfficiency, setVehicleEfficiency] = useState<any>(null)
  
  // State for costs
  const [costs, setCosts] = useState<{
    fuelCost: number;
    tollCost: number;
    totalCost: number;
    distanceMiles: number;
    distanceKm: number;
    durationHours: number;
  } | null>(null)
  
  // State for tracking API and calculation status
  const [status, setStatus] = useState<{
    loading: boolean;
    error: string | null;
    message: string | null;
    usingFallback: boolean;
  }>({
    loading: false,
    error: null,
    message: null,
    usingFallback: false
  })
  
  // State for debug mode
  const [showDebug, setShowDebug] = useState(false)
  
  // State for directions toggle
  const [showDirections, setShowDirections] = useState(false)
  
  // Function to calculate costs based on route and vehicle data
  const calculateCosts = useCallback((routeData: RouteData, vehicleData: any, tolls: number) => {
    if (!routeData || !vehicleData) return null
    
    try {
      // Convert distance to miles and kilometers
      const distanceKm = routeData.distance / 1000
      const distanceMiles = distanceKm * 0.621371
      
      // Calculate duration in hours
      const durationHours = routeData.duration / 3600
      
      // Calculate fuel cost
      let fuelCost = 0
      
      if (vehicleData.type === 'electric') {
        // For electric vehicles, we need kWh per mile or km
        // standardEfficiency is kWh/100mi in our case
        const kwhPer100Miles = vehicleData.efficiency
        const totalKwh = (distanceMiles / 100) * kwhPer100Miles
        fuelCost = totalKwh * vehicleData.fuelCost
      } else {
        // For gas/diesel, we use MPG or L/100km (converted to MPG)
        // standardEfficiency is MPG in our case
        const gallonsNeeded = distanceMiles / vehicleData.efficiency
        fuelCost = gallonsNeeded * vehicleData.fuelCost
      }
      
      // Calculate total cost
      const totalCost = fuelCost + tolls
      
      return {
        fuelCost,
        tollCost: tolls,
        totalCost,
        distanceMiles,
        distanceKm,
        durationHours
      }
    } catch (error) {
      console.error('Error calculating costs:', error)
      setStatus(prev => ({
        ...prev,
        error: 'Error calculating trip costs. Please check your inputs and try again.',
        loading: false
      }))
      return null
    }
  }, [])
  
  // Reset field errors when inputs change
  useEffect(() => {
    if (validationErrors.startLocation && startLocation.trim()) {
      setValidationErrors(prev => ({ ...prev, startLocation: '' }))
    }
  }, [startLocation, validationErrors.startLocation])
  
  useEffect(() => {
    if (validationErrors.endLocation && endLocation.trim()) {
      setValidationErrors(prev => ({ ...prev, endLocation: '' }))
    }
  }, [endLocation, validationErrors.endLocation])
  
  useEffect(() => {
    if (validationErrors.vehicleEfficiency && vehicleEfficiency) {
      setValidationErrors(prev => ({ ...prev, vehicleEfficiency: '' }))
    }
  }, [vehicleEfficiency, validationErrors.vehicleEfficiency])
  
  // Reset any error when inputs change
  useEffect(() => {
    if (status.error) {
      setStatus(prev => ({ ...prev, error: null }))
    }
  }, [startLocation, endLocation, vehicleEfficiency, status.error])
  
  // Handle toll cost changes
  const handleTollChange = (value: number) => {
    setTollCost(value)
    
    // Recalculate costs if we already have a route
    if (route && vehicleEfficiency) {
      const newCosts = calculateCosts(route, vehicleEfficiency, value)
      if (newCosts) setCosts(newCosts)
    }
  }
  
  // Handle vehicle efficiency changes
  const handleVehicleEfficiencyChange = (data: any) => {
    setVehicleEfficiency(data)
    
    // Recalculate costs if we already have a route
    if (route) {
      const newCosts = calculateCosts(route, data, tollCost)
      if (newCosts) setCosts(newCosts)
    }
  }
  
  // Handle location selection
  const handleStartLocationSelect = (location: string) => {
    setStartLocation(location);
  };
  
  const handleEndLocationSelect = (location: string) => {
    setEndLocation(location);
  };
  
  // Handle form submission
  const handleCalculate = async () => {
    console.log('Calculate button clicked')
    
    // Reset all validation errors
    setValidationErrors({
      startLocation: '',
      endLocation: '',
      vehicleEfficiency: ''
    })
    
    // Validate inputs and set field-specific errors
    let hasError = false
    
    if (!startLocation.trim()) {
      setValidationErrors(prev => ({ ...prev, startLocation: 'Please enter a starting point' }))
      hasError = true
    }
    
    if (!endLocation.trim()) {
      setValidationErrors(prev => ({ ...prev, endLocation: 'Please enter a destination' }))
      hasError = true
    }
    
    if (!vehicleEfficiency) {
      setValidationErrors(prev => ({ ...prev, vehicleEfficiency: 'Please enter vehicle efficiency information' }))
      hasError = true
    }
    
    if (hasError) {
      console.log('Validation failed, field errors set')
      return
    }
    
    // Start loading
    console.log('Validation passed, starting calculation')
    setStatus({
      loading: true,
      error: null,
      message: 'Calculating route...',
      usingFallback: false
    })
    
    try {
      // Geocode the addresses
      console.log('Geocoding starting point:', startLocation)
      const start = await geocodeAddress(startLocation)
      console.log('Result:', start)
      setStartCoords(start)
      
      console.log('Geocoding destination:', endLocation)
      const end = await geocodeAddress(endLocation)
      console.log('Result:', end)
      setEndCoords(end)
      
      // Calculate the route
      console.log('Calculating route between points')
      const routeData = await calculateRoute(start, end)
      
      // Log route details
      const routePointCount = routeData.routeGeometry?.coordinates?.length || 0;
      console.log('Route calculated with', routePointCount, 'points')
      setRoute(routeData)
      
      // Check if we're using fallback data - a route with only 2 points is just a straight line
      // which means it's either a fallback or the API didn't return proper geometry
      const isFallback = routePointCount <= 2;
      setStatus(prev => ({
        ...prev,
        usingFallback: isFallback,
        message: isFallback ? 
          'Using estimated route (API fallback mode). Distance and time are approximate calculations without considering actual roads or traffic conditions.' : 
          'Route calculated successfully with real API data.'
      }))
      
      // Calculate costs
      console.log('Calculating costs with vehicle efficiency:', vehicleEfficiency.efficiency, vehicleEfficiency.type)
      const costsData = calculateCosts(routeData, vehicleEfficiency, tollCost)
      if (costsData) setCosts(costsData)
      
      // Complete loading
      setStatus(prev => ({
        ...prev,
        loading: false
      }))
    } catch (error) {
      console.error('Error calculating route:', error)
      setStatus({
        loading: false,
        error: 'Error calculating route. Please check your inputs and try again.',
        message: null,
        usingFallback: true
      })
    }
  }
  
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Left column - inputs */}
      <div className="space-y-6 xl:col-span-1">
        {/* Route Information */}
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="pt-6">
            <div className="flex items-start gap-2 mb-4">
              <MapPin className="h-6 w-6 text-blue-400 mt-1" />
              <h3 className="text-xl font-semibold text-white">Route Information</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <AddressAutocomplete
                  id="start-location"
                  label="Starting Point"
                  placeholder="Enter city or address"
                  value={startLocation}
                  onChange={setStartLocation}
                  onSelectLocation={handleStartLocationSelect}
                />
                {validationErrors.startLocation && (
                  <div className="text-red-400 text-sm mt-1 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {validationErrors.startLocation}
                  </div>
                )}
              </div>
              
              <div>
                <AddressAutocomplete
                  id="end-location"
                  label="Destination"
                  placeholder="Enter city or address"
                  value={endLocation}
                  onChange={setEndLocation}
                  onSelectLocation={handleEndLocationSelect}
                />
                {validationErrors.endLocation && (
                  <div className="text-red-400 text-sm mt-1 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {validationErrors.endLocation}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Vehicle & Fuel */}
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="pt-6">
            <div className="flex items-start gap-2 mb-4">
              <Car className="h-6 w-6 text-blue-400 mt-1" />
              <h3 className="text-xl font-semibold text-white">Vehicle & Fuel</h3>
            </div>
            
            <div>
              <RoadTripVehicleEfficiency onDataChange={handleVehicleEfficiencyChange} />
              {validationErrors.vehicleEfficiency && (
                <div className="text-red-400 text-sm mt-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {validationErrors.vehicleEfficiency}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Additional Costs */}
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="pt-6">
            <div className="flex items-start gap-2 mb-4">
              <DollarSign className="h-6 w-6 text-blue-400 mt-1" />
              <h3 className="text-xl font-semibold text-white">Additional Costs</h3>
            </div>
            
            <RoadTripTollsInput value={tollCost} onChange={handleTollChange} />
          </CardContent>
        </Card>
        
        {/* Calculate button */}
        <Button 
          className="w-full py-6 text-lg"
          onClick={handleCalculate}
          disabled={status.loading}
        >
          {status.loading ? 'Calculating...' : 'Calculate Trip Cost'}
        </Button>
        
        {/* Error message - Make it more noticeable */}
        {status.error && (
          <div className="sticky bottom-4 z-50">
            <Alert variant="destructive" className="bg-red-900 border-red-800 text-white animate-pulse shadow-lg border-2">
              <AlertDescription className="text-white font-medium flex items-center text-lg py-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {status.error}
              </AlertDescription>
            </Alert>
          </div>
        )}
        
        {/* Status message */}
        {status.message && (
          <Alert className={status.usingFallback ? "bg-amber-900 border-amber-800" : "bg-blue-900 border-blue-800"}>
            <AlertDescription className="text-white flex items-center">
              {status.usingFallback ? (
                <Info className="h-4 w-4 mr-2" />
              ) : null}
              {status.message}
            </AlertDescription>
          </Alert>
        )}
        
        {/* Debug information - only shown if debug mode is enabled */}
        {showDebug && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-xs text-gray-300 font-mono overflow-auto">
            <h4 className="font-semibold mb-2 text-blue-400">Debug Information</h4>
            <div>
              <div><span className="text-gray-500">Start:</span> {JSON.stringify(startCoords)}</div>
              <div><span className="text-gray-500">End:</span> {JSON.stringify(endCoords)}</div>
              <div><span className="text-gray-500">Using Fallback:</span> {status.usingFallback ? 'Yes' : 'No'}</div>
              <div><span className="text-gray-500">Route Points:</span> {route?.routeGeometry.coordinates.length || 0}</div>
            </div>
          </div>
        )}
      </div>
      
      {/* Right column - Map and Results */}
      <div className="space-y-6 xl:col-span-2">
        {/* Map */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-1 h-[400px] xl:h-[600px]">
          <DynamicRoadTripMap 
            startCoords={startCoords || undefined} 
            endCoords={endCoords || undefined} 
            routeGeometry={route?.routeGeometry}
            isFallbackRoute={status.usingFallback}
            startLocation={startLocation}
            endLocation={endLocation}
          />
        </div>
        
        {/* Turn-by-Turn Directions - only show when route with steps is available */}
        {route && route.segments && route.segments[0]?.steps && route.segments[0].steps.length > 0 && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
            {/* Toggle button */}
            <button 
              onClick={() => setShowDirections(!showDirections)} 
              className="w-full flex items-center justify-between p-4 text-white hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Navigation className="h-5 w-5 text-blue-400" />
                <span className="font-semibold">Turn-by-Turn Directions</span>
              </div>
              <div className="flex items-center text-gray-400 text-sm">
                {showDirections ? 'Hide' : 'Show'} directions
                <svg 
                  className={`ml-2 h-5 w-5 transition-transform ${showDirections ? 'rotate-180' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>
            
            {/* Directions content */}
            {showDirections && (
              <div className="p-4">
                <RoadTripDirections 
                  steps={route.segments[0].steps}
                  unitSystem={vehicleEfficiency?.unitSystem || 'imperial'} 
                />
              </div>
            )}
          </div>
        )}
        
        {/* Trip Summary */}
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="pt-6">
            <div className="flex items-start gap-2 mb-4">
              <Route className="h-6 w-6 text-blue-400 mt-1" />
              <h3 className="text-xl font-semibold text-white">Trip Summary</h3>
            </div>
            
            {costs ? (
              <RoadTripCosts 
                costs={costs} 
                vehicleType={vehicleEfficiency?.type || 'gasoline'}
                unitSystem={vehicleEfficiency?.unitSystem || 'imperial'}
              />
            ) : (
              <div className="text-gray-400 text-center py-4">
                Enter your trip details and click calculate to see your estimated costs.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}