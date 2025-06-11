'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import { Alert, AlertDescription } from '../../components/ui/alert'
import { MapPin, Car, DollarSign, Route, Info, Navigation, Loader2 } from 'lucide-react'
import DynamicRoadTripMap from './DynamicRoadTripMap'
import RoadTripVehicleEfficiency from './RoadTripVehicleEfficiency'
import RoadTripCosts from './RoadTripCosts'
import AddressAutocomplete from './AddressAutocomplete'
import RoadTripDirections from './RoadTripDirections'
import { Coordinates, RouteData, geocodeAddress, calculateRoute } from '../utils/routingService'
import { RoadTripTollsInput } from './RoadTripTollsInput'
import POIControlsBar from './POIControlsBar'
import POIDetailPanel from './POIDetailPanel'
import { POI } from '../utils/overpassService'
import { initPOIControlSync, cleanupPOIControlSync } from '../utils/poiControlSync'
import { fetchPOIDetails } from '../utils/tomtomService'
import TabsContainer from './TabsContainer'
import HotelsList from './HotelsList'
import AttractionsList from './AttractionsList'

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
  
  // State for active POI layers - Fix hydration mismatch
  const [activePOILayers, setActivePOILayers] = useState<string[]>(['hotels']);
  
  // State for selected POI for detailed view
  const [selectedPOI, setSelectedPOI] = useState<POI | null>(null);
  
  // Add loading state for POI details
  const [poiLoading, setPOILoading] = useState(false);
  
  // Add a ref for the small screen POI panel
  const smallScreenPOIRef = useRef<HTMLDivElement>(null);
  
  // State for active tab
  const [activeTab, setActiveTab] = useState(0)
  
  // State for hotels from POIs
  const [hotels, setHotels] = useState<POI[]>([])
  
  // State for attractions from Viator
  const [attractions, setAttractions] = useState<POI[]>([])
  
  // Use useEffect for localStorage operations to avoid hydration issues
  useEffect(() => {
    // This only runs on the client after hydration is complete
    try {
      const savedLayers = localStorage.getItem('activePOILayers');
      if (savedLayers) {
        const parsedLayers = JSON.parse(savedLayers);
        if (Array.isArray(parsedLayers) && parsedLayers.length > 0) {
          setActivePOILayers(parsedLayers);
          console.log('Loaded POI layers from localStorage:', parsedLayers);
        }
      }
    } catch (error) {
      console.error('Error loading saved POI layers:', error);
    }
  }, []);
  
  // Add logging for debugging
  useEffect(() => {
    console.log('RoadTripCalculator activePOILayers:', activePOILayers);
  }, [activePOILayers]);
  
  // Initialize POI control synchronization after initial render and when layers change
  useEffect(() => {
    // We use setTimeout to ensure the DOM has been updated
    const initTimer = setTimeout(() => {
      initPOIControlSync();
    }, 500);
    
    // Cleanup function
    return () => {
      clearTimeout(initTimer);
      cleanupPOIControlSync();
    };
  }, [activePOILayers]);
  
  // Track POI changes and extract hotels
  useEffect(() => {
    // This will be populated by ServiceMarkers when it renders POIs
    const poiDataListener = (event: CustomEvent) => {
      if (event.detail && Array.isArray(event.detail.pois)) {
        // Filter to get hotels
        const hotelPOIs = event.detail.pois.filter((poi: POI) => poi.type === 'hotels');
        setHotels(hotelPOIs);
        console.log(`Found ${hotelPOIs.length} hotels`);
        
        // Filter to get attractions
        const attractionPOIs = event.detail.pois.filter((poi: POI) => poi.type === 'attractions');
        setAttractions(attractionPOIs);
        console.log(`Found ${attractionPOIs.length} attractions`);
      }
    };
    
    // Listen for the custom event
    window.addEventListener('poiDataUpdated', poiDataListener as EventListener);
    
    // Cleanup
    return () => {
      window.removeEventListener('poiDataUpdated', poiDataListener as EventListener);
    };
  }, []);
  
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
    
    // After validation passes, switch to an appropriate tab based on available content
    if (activePOILayers.includes('hotels')) {
      setActiveTab(0); // Hotels tab
    } else if (activePOILayers.includes('attractions')) {
      setActiveTab(0); // Attractions tab (when no hotels)
    } else if (route && route.segments && route.segments[0]?.steps && route.segments[0].steps.length > 0) {
      setActiveTab(activePOILayers.includes('hotels') || activePOILayers.includes('attractions') ? 
        (activePOILayers.includes('hotels') && activePOILayers.includes('attractions') ? 2 : 1) : 0); // Directions tab
    } else {
      // Calculate the summary tab index based on what's available
      let tabIndex = 0;
      if (activePOILayers.includes('hotels')) tabIndex++;
      if (activePOILayers.includes('attractions')) tabIndex++;
      if (activePOILayers.includes('directions')) tabIndex++;
      setActiveTab(tabIndex);
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
  
  // Handle POI layer changes
  const handlePOILayerChange = (layers: string[]) => {
    console.log('Updating POI layers to:', layers);
    setActivePOILayers(layers);
    
    // Persist to localStorage
    try {
      localStorage.setItem('activePOILayers', JSON.stringify(layers));
    } catch (error) {
      console.error('Error saving POI layers:', error);
    }
  };
  
  // Handler for POI selection
  const handlePOISelect = (poi: POI) => {
    // Immediately show the POI with basic information
    setSelectedPOI(poi);
    console.log('Selected POI for detailed view:', poi.name);
    
    // Only scroll on mobile/tablet views
    setTimeout(() => {
      if (window.innerWidth < 1280 && smallScreenPOIRef.current) { // 1280px is the xl breakpoint
        // Prevent scrolling the entire page on desktop
        smallScreenPOIRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 100);
    
    // If the POI has a TomTom ID, fetch detailed information
    if (poi.tomtomId) {
      setPOILoading(true);
      
      fetchPOIDetails(poi.tomtomId)
        .then(detailsData => {
          // If we have details data, enhance the POI
          if (detailsData && detailsData.results && detailsData.results.length > 0) {
            const poiDetails = detailsData.results[0];
            
            // Extract and format detailed information
            let detailedHours = '';
            if (poiDetails.poi?.openingHours?.timeRanges) {
              try {
                const timeRanges = poiDetails.poi.openingHours.timeRanges;
                const formattedRanges = timeRanges.slice(0, 3).map((range: any) => {
                  return `${range.startTime.date.substring(5)} ${range.startTime.hour}:${String(range.startTime.minute).padStart(2, '0')}-${range.endTime.hour}:${String(range.endTime.minute).padStart(2, '0')}`;
                });
                
                detailedHours = formattedRanges.join(', ') + (timeRanges.length > 3 ? '...' : '');
              } catch (e) {
                console.warn('Error formatting detailed opening hours:', e);
              }
            }
            
            // Create enhanced POI with detailed information
            const enhancedPOI: POI = {
              ...poi,
              tags: {
                ...poi.tags,
                // Override with more detailed information if available
                phone: poiDetails.poi?.phone || poi.tags.phone,
                website: poiDetails.poi?.url || poi.tags.website,
                opening_hours: detailedHours || poi.tags.opening_hours,
                address: poiDetails.address?.freeformAddress || poi.tags.address,
                // Additional information that might be available
                description: poiDetails.poi?.descriptions?.[0]?.text || ''
              }
            };
            
            // Update the selected POI with enhanced information
            setSelectedPOI(enhancedPOI);
            console.log('Enhanced POI with TomTom details');
          }
        })
        .catch(error => {
          console.error('Error fetching detailed POI information:', error);
          // The basic POI is already displayed, so we don't need to do anything
        })
        .finally(() => {
          setPOILoading(false);
        });
    }
  };
  
  // Handler to close POI detail panel
  const handleClosePOIPanel = () => {
    setSelectedPOI(null);
  };
  
  // Handler to set POI as new destination
  const handleSetPOIAsDestination = (poi: POI) => {
    if (poi.tags.address) {
      setEndLocation(poi.name + ', ' + poi.tags.address);
      setSelectedPOI(null);
      
      // Scroll to top to see the destination field
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  // Handle hotel selection from the hotel list
  const handleHotelSelect = (hotel: POI) => {
    handlePOISelect(hotel);
  }
  
  // Handle attraction selection from the attractions list
  const handleAttractionSelect = (attraction: POI) => {
    handlePOISelect(attraction);
  }
  
  // Check if we have directions to show
  const hasDirections = Boolean(route && route.segments && route.segments[0]?.steps && route.segments[0].steps.length > 0);
  
  // Check if we have hotels layer active
  const hasHotels = activePOILayers.includes('hotels') && hotels.length > 0;
  
  // Check if we have attractions layer active
  const hasAttractions = activePOILayers.includes('attractions') && attractions.length > 0;
  
  return (
    <div className="flex flex-col xl:flex-row h-screen">
      {/* Form inputs - before calculation */}
      {!route && (
        <div className="w-full xl:w-1/3 bg-gradient-to-br from-gray-50 to-blue-50 p-6 overflow-y-auto">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-900 mb-6">Road Trip Calculator</h2>
          
          {/* Custom animation styles */}
          <style jsx global>{`
            @keyframes fadeInUp {
              from {
                opacity: 0;
                transform: translateY(10px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            
            @keyframes pulse-subtle {
              0% {
                box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.1);
              }
              70% {
                box-shadow: 0 0 0 6px rgba(59, 130, 246, 0);
              }
              100% {
                box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
              }
            }
            
            .card-animate-in {
              animation: fadeInUp 0.4s ease-out forwards;
            }
            
            .input-focus-animation:focus {
              animation: pulse-subtle 1.5s infinite;
            }
          `}</style>
          
        {/* Route Information */}
          <Card className="bg-white border-none shadow-md rounded-xl mb-6 overflow-hidden hover:shadow-lg transition-all duration-300 card-animate-in" style={{ animationDelay: '0ms' }}>
          <CardContent className="pt-6">
            <div className="flex items-start gap-2 mb-4">
              <div className="bg-blue-100 p-2 rounded-lg">
                <MapPin className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">Route Information</h3>
            </div>
            
            <div className="space-y-4">
              {/* Destination field first */}
              <div>
                <AddressAutocomplete
                  id="end-location"
                  label="Destination"
                  placeholder="Enter city or address"
                  value={endLocation}
                  onChange={setEndLocation}
                  onSelectLocation={handleEndLocationSelect}
                  className="input-focus-animation"
                />
                {validationErrors.endLocation && (
                  <div className="text-red-500 text-sm mt-1 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {validationErrors.endLocation}
                  </div>
                )}
              </div>
              
              {/* Starting point second */}
              <div>
                <AddressAutocomplete
                  id="start-location"
                  label="Starting Point"
                  placeholder="Enter city or address"
                  value={startLocation}
                  onChange={setStartLocation}
                  onSelectLocation={handleStartLocationSelect}
                  className="input-focus-animation"
                />
                {validationErrors.startLocation && (
                  <div className="text-red-500 text-sm mt-1 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {validationErrors.startLocation}
                  </div>
                )}
              </div>
                
                {/* POI Controls */}
                <div className="pt-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-800 mb-2">
                    Show on map:
                  </label>
                  <POIControlsBar 
                    activeLayers={activePOILayers}
                    onChange={handlePOILayerChange}
                    data-testid="route-poi-controls"
                  />
                </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Vehicle & Fuel */}
          <Card className="bg-white border-none shadow-md rounded-xl mb-6 overflow-hidden hover:shadow-lg transition-all duration-300 card-animate-in" style={{ animationDelay: '100ms' }}>
          <CardContent className="pt-6">
            <div className="flex items-start gap-2 mb-4">
              <div className="bg-indigo-100 p-2 rounded-lg">
                <Car className="h-5 w-5 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">Vehicle & Fuel</h3>
            </div>
            
            <div>
              <RoadTripVehicleEfficiency onDataChange={handleVehicleEfficiencyChange} />
              {validationErrors.vehicleEfficiency && (
                <div className="text-red-500 text-sm mt-2 flex items-center">
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
          <Card className="bg-white border-none shadow-md rounded-xl mb-6 overflow-hidden hover:shadow-lg transition-all duration-300 card-animate-in" style={{ animationDelay: '200ms' }}>
          <CardContent className="pt-6">
            <div className="flex items-start gap-2 mb-4">
              <div className="bg-green-100 p-2 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">Additional Costs</h3>
            </div>
            
            <RoadTripTollsInput value={tollCost} onChange={handleTollChange} />
          </CardContent>
        </Card>
        
        {/* Calculate button */}
        <Button 
          className="w-full py-6 text-lg bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white transition-all shadow-md hover:shadow-lg hover:scale-[1.01] card-animate-in"
          style={{ animationDelay: '300ms' }}
          onClick={handleCalculate}
          disabled={status.loading}
        >
          {status.loading ? (
            <div className="flex items-center justify-center">
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              <span>Calculating...</span>
            </div>
          ) : 'Calculate Trip Cost'}
        </Button>
        
        {/* Error message - Make it more noticeable */}
        {status.error && (
            <div className="sticky bottom-4 z-50 mt-4">
            <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-700 shadow-lg border animate-pulse">
              <AlertDescription className="font-medium flex items-center text-base py-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {status.error}
              </AlertDescription>
            </Alert>
          </div>
        )}
        </div>
      )}
      
      {/* Tabbed container after calculation */}
      {route && (
        <div className="w-full xl:w-1/3 bg-white dark:bg-gray-50 h-full overflow-hidden flex flex-col" ref={smallScreenPOIRef}>
          {/* Show POI detail panel when a POI is selected */}
          {selectedPOI && (
            <div className="px-4 pt-4">
              <div className="flex items-center gap-2 mb-2 text-gray-800">
                <MapPin className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-medium">Selected Point Details</h3>
              </div>
              <POIDetailPanel 
                poi={selectedPOI} 
                onClose={handleClosePOIPanel}
                onSetAsDestination={handleSetPOIAsDestination}
                isLoading={poiLoading}
                className="mb-4"
              />
            </div>
          )}
          
          {/* Tabbed navigation container */}
          <div className="flex-grow overflow-hidden">
            <TabsContainer
              hotelsList={<HotelsList hotels={hotels} onHotelSelect={handleHotelSelect} />}
              attractionsList={<AttractionsList attractions={attractions} onAttractionSelect={handleAttractionSelect} />}
              directions={
                route && route.segments && route.segments[0]?.steps ? (
                  <RoadTripDirections 
                    steps={route.segments[0].steps}
                    unitSystem={vehicleEfficiency?.unitSystem || 'imperial'} 
                  />
                ) : (
                  <div className="text-center p-6 text-gray-500">
                    <p>No detailed directions available for this route.</p>
                  </div>
                )
              }
              tripSummary={
                costs ? (
                  <RoadTripCosts 
                    costs={costs}
                    vehicleType={vehicleEfficiency?.type || 'gasoline'}
                    unitSystem={vehicleEfficiency?.unitSystem || 'imperial'}
                  />
                ) : (
                  <div className="text-center p-6 text-gray-500">
                    <p>Cost information not available.</p>
                  </div>
                )
              }
              activeTab={activeTab}
              onTabChange={setActiveTab}
              hasHotels={hasHotels}
              hasAttractions={hasAttractions}
              hasDirections={hasDirections}
            />
          </div>
          
          {/* Only show critical fallback warning */}
          {status.usingFallback && (
            <div className="p-4">
              <Alert className="bg-amber-50 border-amber-200 text-amber-800">
                <AlertDescription className="text-amber-800 flex items-center">
                  <Info className="h-4 w-4 mr-2 text-amber-600" />
                  Using estimated route. Distance and time are approximate.
                </AlertDescription>
              </Alert>
            </div>
          )}
          
          {/* Back to Edit button */}
          <div className={`p-4 border-t border-gray-200 ${selectedPOI ? 'pt-0.5' : ''}`}>
            <Button 
              className="w-full py-5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.01] flex items-center justify-center gap-2"
              onClick={() => {
                setRoute(null);
                setCosts(null);
                setStatus({
                  loading: false,
                  error: null,
                  message: null,
                  usingFallback: false
                });
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
              </svg>
              Edit Trip Details
            </Button>
          </div>
        </div>
      )}
      
      {/* Map container */}
      <div className={`w-full ${route ? 'xl:w-2/3' : 'xl:w-2/3'} h-[400px] xl:h-screen`}>
          <DynamicRoadTripMap 
            startCoords={startCoords || undefined} 
            endCoords={endCoords || undefined} 
            routeGeometry={route?.routeGeometry}
            isFallbackRoute={status.usingFallback}
            startLocation={startLocation}
            endLocation={endLocation}
          activePOILayers={activePOILayers}
          onLayerChange={handlePOILayerChange}
          onSelectPOI={handlePOISelect}
        />
      </div>
    </div>
  )
}