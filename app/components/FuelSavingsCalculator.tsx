'use client'

import React from 'react'
import { JSX } from 'react'
import { useState, useEffect } from 'react'
import { Vehicle, Make } from '../types/vehicle'
import { ManualVehicleFuel, FuelTypeDefinition, FuelEfficiency, AVAILABLE_FUEL_TYPES, FUEL_TYPE_VALIDATION } from '../types/fuel'
import FuelSavingsVehicleLookup from './FuelSavingsVehicleLookup'
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Label } from "../../components/ui/label"
import { Input } from "../../components/ui/input"
import { Switch } from "../../components/ui/switch"
import { Slider } from "../../components/ui/slider"
import { Fuel, Info, CarFront, ChevronDown, ChevronUp, Gauge, Zap } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../components/ui/tooltip"
import { Button } from "../../components/ui/button"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts'
import EfficiencyInput from './EfficiencyInput'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "../../components/ui/dialog"

// Types for our calculator
interface ManualVehicle extends ManualVehicleFuel {
  // Additional fields specific to the calculator can be added here
}

interface VehicleSelection {
  fromDb: Vehicle | null
  manual: ManualVehicle | null
  fuelCost: number
  fuelCost2?: number // For secondary fuel type
  isManualInput: boolean
  usageSplit: number // Percentage of primary fuel usage (0-100)
}

interface CalculatorState {
  // Shared driving pattern settings
  cityHighwaySplit: number      // Percentage of city driving (0-100)
  useCustomSplit: boolean       // Whether to use custom city/highway split

  vehicle1: VehicleSelection
  vehicle2: VehicleSelection
  annualMileage: number
  mileageInputType: 'annual' | 'monthly' | 'weekly' | 'daily'
}

interface FuelCosts {
  weekly: number
  monthly: number
  annual: number
  threeYear: number
  fiveYear: number
  tenYear: number
}

// Default fuel prices with their sources
const FUEL_DEFAULTS = {
  REGULAR_GASOLINE: 3.15,
  MIDGRADE_GASOLINE: 3.50,
  PREMIUM_GASOLINE: 3.85,
  ELECTRICITY: 0.17,
  NATURAL_GAS: 2.91, // per GGE (Gasoline Gallon Equivalent)
  HYDROGEN: 25.00, // per kg
  DIESEL: 3.64, // per gallon
  E85: 2.52, // per gallon (20% discount from regular gasoline)
} as const

// Fuel price sources for tooltips
const FUEL_SOURCES = {
  NATURAL_GAS: "Source: U.S. Department of Energy Alternative Fuels Data Center",
  HYDROGEN: "Source: U.S. Department of Energy Hydrogen Shot Initiative",
  DIESEL: "Source: U.S. Department of Energy Alternative Fuels Data Center",
  E85: "Source: U.S. Department of Energy Alternative Fuels Data Center",
} as const

const DEFAULT_ANNUAL_MILEAGE = 15000
const DEFAULT_FUEL_SPLIT = 50 // For dual-fuel vehicles

// Fuel type information and conversion helpers
interface FuelTypeInfo {
  label: string
  unit: string
  conversion: number
  explanation: string
}

const getFuelTypeInfo = (fuelType: string): FuelTypeInfo => {
  const normalized = fuelType.toLowerCase()
  if (normalized.includes('electricity')) {
    return {
      label: 'Electricity Rate',
      unit: '$/kWh',
      conversion: 33.7,
      explanation: 'Cost per kilowatt-hour of electricity'
    }
  }
  if (normalized.includes('natural gas')) {
    return {
      label: 'Natural Gas Price',
      unit: '$/GGE',
      conversion: 1,
      explanation: 'Cost per Gasoline Gallon Equivalent (GGE) of natural gas'
    }
  }
  if (normalized.includes('hydrogen')) {
    return {
      label: 'Hydrogen Price',
      unit: '$/kg',
      conversion: 1,
      explanation: 'Cost per kilogram of hydrogen fuel'
    }
  }
  if (normalized.includes('diesel')) {
    return {
      label: 'Diesel Price',
      unit: '$/gallon',
      conversion: 1,
      explanation: 'Cost per gallon of diesel fuel'
    }
  }
  if (normalized.includes('e85')) {
    return {
      label: 'E85 Price',
      unit: '$/gallon',
      conversion: 1,
      explanation: 'Cost per gallon of E85 ethanol fuel blend'
    }
  }
  return {
    label: 'Gasoline Price',
    unit: '$/gallon',
    conversion: 1,
    explanation: 'Cost per gallon of regular gasoline'
  }
}

// Calculate fuel cost for a specific fuel type
const calculateFuelCost = (params: {
  miles: number
  mpg: number
  fuelPrice: number
  fuelType: string
}): number => {
  const { conversion } = getFuelTypeInfo(params.fuelType)
  return (params.miles / params.mpg) * params.fuelPrice * conversion
}

// Calculate total cost for dual fuel vehicles
const calculateDualFuelCost = (params: {
  totalMiles: number
  fuelSplit: number  // percentage for primary fuel
  primary: {
    mpg: number
    price: number
    type: string
  }
  secondary: {
    mpg: number
    price: number
    type: string
  }
}): number => {
  // Primary fuel cost
  const primaryMiles = params.totalMiles * (params.fuelSplit / 100)
  const primaryCost = calculateFuelCost({
    miles: primaryMiles,
    mpg: params.primary.mpg,
    fuelPrice: params.primary.price,
    fuelType: params.primary.type
  })

  // Secondary fuel cost
  const secondaryMiles = params.totalMiles * ((100 - params.fuelSplit) / 100)
  const secondaryCost = calculateFuelCost({
    miles: secondaryMiles,
    mpg: params.secondary.mpg,
    fuelPrice: params.secondary.price,
    fuelType: params.secondary.type
  })

  return primaryCost + secondaryCost
}

// Helper function to determine fuel type category
const getFuelTypeCategory = (fuelType: string): keyof typeof FUEL_DEFAULTS => {
  const normalized = fuelType.toLowerCase()
  if (normalized.includes('premium')) return 'PREMIUM_GASOLINE'
  if (normalized.includes('midgrade')) return 'MIDGRADE_GASOLINE'
  if (normalized.includes('electricity')) return 'ELECTRICITY'
  if (normalized.includes('natural gas')) return 'NATURAL_GAS'
  if (normalized.includes('hydrogen')) return 'HYDROGEN'
  if (normalized.includes('diesel')) return 'DIESEL'
  if (normalized.includes('e85')) return 'E85'
  return 'REGULAR_GASOLINE'
}

// Helper function to get default price for fuel type
const getDefaultPrice = (fuelType: string): number => {
  return FUEL_DEFAULTS[getFuelTypeCategory(fuelType)]
}

// Helper function to get source info for fuel type
const getFuelSource = (fuelType: string): string | undefined => {
  return FUEL_SOURCES[getFuelTypeCategory(fuelType) as keyof typeof FUEL_SOURCES]
}

// Add these type definitions at the top with other interfaces
interface VehicleLookupCustomProps {
  onVehicleSelect: (vehicle: Vehicle) => void
  showAddComparison?: boolean
  customResultDisplay?: (vehicle: Vehicle) => JSX.Element
}

// Calculate efficiency based on city/highway split
const calculateEfficiency = (params: {
  cityMPG: number
  highwayMPG: number
  cityPercentage: number
  miles: number
}): { cityMiles: number; highwayMiles: number; weightedMPG: number } => {
  const cityMiles = params.miles * (params.cityPercentage / 100)
  const highwayMiles = params.miles * (1 - params.cityPercentage / 100)
  
  // Calculate weighted MPG based on actual miles driven in each mode
  const weightedMPG = params.miles / 
    (cityMiles / params.cityMPG + highwayMiles / params.highwayMPG)

  return {
    cityMiles,
    highwayMiles,
    weightedMPG
  }
}

// Add type for missing fuel values
interface MissingFuelValues {
  vehicleNumber: 1 | 2;
  fuelType: 'primary' | 'secondary';
  fuelName: string;
}

export default function FuelSavingsCalculator() {
  // Add makes state at the top level
  const [makes, setMakes] = useState<Make[]>([])
  const [isLoadingMakes, setIsLoadingMakes] = useState(true)

  // Fetch makes once when component mounts
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

  // Initialize state
  const [calculatorState, setCalculatorState] = useState<CalculatorState>({
    // Shared driving pattern settings
    cityHighwaySplit: 50,
    useCustomSplit: false,

    vehicle1: {
      fromDb: null,
      manual: null,
      fuelCost: FUEL_DEFAULTS.REGULAR_GASOLINE,
      isManualInput: false,
      usageSplit: DEFAULT_FUEL_SPLIT
    },
    vehicle2: {
      fromDb: null,
      manual: null,
      fuelCost: FUEL_DEFAULTS.REGULAR_GASOLINE,
      isManualInput: false,
      usageSplit: DEFAULT_FUEL_SPLIT
    },
    annualMileage: DEFAULT_ANNUAL_MILEAGE,
    mileageInputType: 'annual'
  })

  // State for calculated costs
  const [costs, setCosts] = useState<{
    vehicle1: FuelCosts | null
    vehicle2: FuelCosts | null
    savings: FuelCosts | null
  }>({
    vehicle1: null,
    vehicle2: null,
    savings: null
  })

  // Add state for warning dialog
  const [showWarningDialog, setShowWarningDialog] = useState(false)
  const [pendingVehicles, setPendingVehicles] = useState<Array<1 | 2>>([])
  const [missingFuelValues, setMissingFuelValues] = useState<MissingFuelValues[]>([]);

  // Helper function to convert mileage between different periods
  const convertMileage = (value: number, from: 'annual' | 'monthly' | 'weekly' | 'daily', to: 'annual' | 'monthly' | 'weekly' | 'daily'): number => {
    const conversions = {
      annual: 1,
      monthly: 12,
      weekly: 52,
      daily: 365
    }
    // Convert to annual first, then to target period
    const annualValue = value * (from === 'annual' ? 1 : conversions[from])
    return Math.round(annualValue / conversions[to])
  }

  // Helper function to get period suffix
  const getPeriodSuffix = (period: 'annual' | 'monthly' | 'weekly' | 'daily'): string => {
    switch (period) {
      case 'annual': return 'year'
      case 'monthly': return 'month'
      case 'weekly': return 'week'
      case 'daily': return 'day'
      default: return period
    }
  }

  // Handler for mileage input changes
  const handleMileageChange = (value: string, type: 'annual' | 'monthly' | 'weekly' | 'daily') => {
    // Allow empty input
    if (value === '') {
      setCalculatorState(prev => ({
        ...prev,
        annualMileage: 0,
        mileageInputType: type,
      }))
      return
    }
    
    // Parse the input value
    const numValue = parseInt(value)
    
    // Only proceed if it's a valid non-negative number
    if (!isNaN(numValue) && numValue >= 0) {
      // Convert to annual mileage based on the input type
      const annualValue = convertMileage(numValue, type, 'annual')
      setCalculatorState(prev => ({
        ...prev,
        annualMileage: annualValue,
        mileageInputType: type,
      }))
    }
  }

  // Helper function to render fuel split slider
  const renderFuelSplitSlider = (vehicleNumber: 1 | 2) => {
    const vehicle = calculatorState[`vehicle${vehicleNumber}` as keyof Pick<CalculatorState, 'vehicle1' | 'vehicle2'>]
    if (!vehicle.fromDb?.fuelType2) return null

    // Get MPG values for each fuel type
    const primaryMPG = vehicle.fromDb.comb08
    const secondaryMPG = vehicle.fromDb.combA08

    return (
      <div className="space-y-4 bg-gray-800 p-4 rounded-lg border border-gray-700">
        <div className="flex items-center justify-between">
          <Label className="text-gray-300 font-semibold">Fuel Usage Distribution</Label>
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="p-0 h-auto hover:bg-transparent focus:ring-0"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  <Info className="h-4 w-4 text-gray-400" />
                </Button>
              </TooltipTrigger>
              <TooltipContent sideOffset={5}>
                <p className="text-sm">Adjust the split between fuel types</p>
                <p className="text-xs text-blue-400 mt-1">Default: {DEFAULT_FUEL_SPLIT}% for each fuel type</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="space-y-4">
          {/* Primary Fuel Info */}
          <div className="bg-gray-100 p-3 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-green-600 font-medium">{vehicle.fromDb.fuelType1}</span>
              <span className="text-sm text-green-600">{vehicle.usageSplit ?? 0}%</span>
            </div>
            <div className="text-sm text-gray-600">
              Combined: {primaryMPG} {vehicle.fromDb.fuelType1.includes('Electricity') ? 'MPGe' : 'MPG'}
            </div>
          </div>

          {/* Slider */}
          <div className="py-2 px-1">
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={vehicle.usageSplit ?? 0}
              onChange={(e) => handleSplitUpdate(vehicleNumber, [parseInt(e.target.value)])}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer
                bg-gradient-to-r from-violet-600 to-emerald-600
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-4
                [&::-webkit-slider-thumb]:h-4
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-white
                [&::-webkit-slider-thumb]:shadow-lg
                [&::-webkit-slider-thumb]:cursor-pointer
                [&::-webkit-slider-thumb]:transition-all
                [&::-webkit-slider-thumb]:border-2
                [&::-webkit-slider-thumb]:border-slate-200/20
                [&::-webkit-slider-thumb]:hover:scale-110
                touch-manipulation"
            />
          </div>

          {/* Secondary Fuel Info */}
          <div className="bg-gray-100 p-3 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-blue-600 font-medium">{vehicle.fromDb.fuelType2}</span>
              <span className="text-sm text-blue-600">{100 - (vehicle.usageSplit ?? 0)}%</span>
            </div>
            {secondaryMPG && (
              <div className="text-sm text-gray-600">
                Combined: {secondaryMPG} {vehicle.fromDb.fuelType2?.includes('Electricity') ? 'MPGe' : 'MPG'}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Helper function to calculate savings
  const calculateSavings = () => {
    const v1Costs = calculateVehicleCosts(calculatorState.vehicle1, calculatorState.annualMileage, calculatorState.cityHighwaySplit, calculatorState.useCustomSplit)
    const v2Costs = calculateVehicleCosts(calculatorState.vehicle2, calculatorState.annualMileage, calculatorState.cityHighwaySplit, calculatorState.useCustomSplit)
    
    const savings = v1Costs && v2Costs ? {
      weekly: v2Costs.weekly - v1Costs.weekly,
      monthly: v2Costs.monthly - v1Costs.monthly,
      annual: v2Costs.annual - v1Costs.annual,
      threeYear: v2Costs.threeYear - v1Costs.threeYear,
      fiveYear: v2Costs.fiveYear - v1Costs.fiveYear,
      tenYear: v2Costs.tenYear - v1Costs.tenYear
    } : null

    setCosts({
      vehicle1: v1Costs,
      vehicle2: v2Costs,
      savings
    })
  }

  // Specialized vehicle lookup component
  function FuelComparisonVehicleLookup({ 
    onVehicleSelect,
    vehicleNumber 
  }: { 
    onVehicleSelect: (vehicle: Vehicle) => void
    vehicleNumber: number 
  }) {
    const [showSearch, setShowSearch] = useState(false);
    const [currentVehicle, setCurrentVehicle] = useState<Vehicle | null>(calculatorState[`vehicle${vehicleNumber}` as keyof Pick<CalculatorState, 'vehicle1' | 'vehicle2'>].fromDb);

    return (
      <div className="space-y-4">
        {/* Show selected vehicle details if exists and not searching */}
        {currentVehicle && !showSearch ? (
          <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden mb-4 shadow-lg">
            <div className="bg-gradient-to-r from-blue-800 to-blue-900 p-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-3">
                  {/* <CarFront className="h-6 w-6 text-white" /> */}
                  <h4 className="text-lg font-semibold text-white">
                    {currentVehicle.year} {currentVehicle.make} {currentVehicle.model}
                  </h4>
                </div>
                <button
                  onClick={() => {
                    setShowSearch(true);
                    setCurrentVehicle(null);
                  }}
                  className="w-full sm:w-auto min-h-[2.5rem] px-6 bg-orange-600 hover:bg-orange-500/90 text-white rounded-md text-sm transition-colors shrink-0"
                >
                  Change Vehicle
                </button>
              </div>
            </div>
            
            <div className="p-3 space-y-3">
              {/* Primary Fuel */}
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-blue-300 flex items-center gap-2">
                  <Fuel className="h-4 w-4" />
                  {currentVehicle.fuelType1}
                </h3>
              <div className="bg-gray-700/50 p-3 rounded flex items-center justify-between">
                <span className="text-lg text-gray-300">Combined</span>
                <span className="text-xl text-green-400">
                    {currentVehicle.comb08} {currentVehicle.fuelType1.includes('Electricity') ? 'MPGe' : 'MPG'}
                </span>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="bg-gray-700/50 p-3 rounded flex items-center justify-between">
                  <span className="text-gray-300">City</span>
                  <span className="text-lg text-blue-400">
                      {currentVehicle.city08} {currentVehicle.fuelType1.includes('Electricity') ? 'MPGe' : 'MPG'}
                  </span>
                </div>
                <div className="bg-gray-700/50 p-3 rounded flex items-center justify-between">
                  <span className="text-gray-300">Highway</span>
                  <span className="text-lg text-red-400">
                      {currentVehicle.highway08} {currentVehicle.fuelType1.includes('Electricity') ? 'MPGe' : 'MPG'}
                  </span>
                </div>
              </div>
              </div>

              {/* Secondary Fuel (if available) */}
              {currentVehicle.fuelType2 && (currentVehicle.combA08 || currentVehicle.cityA08 || currentVehicle.highwayA08) && (
                <div className="space-y-3 border-t border-gray-700 pt-3">
                  <h3 className="text-xl font-medium text-yellow-400 flex items-center gap-2">
                    <Fuel className="h-4 w-4" />
                    {currentVehicle.fuelType2}
                  </h3>
                  {currentVehicle.combA08 && (
                    <div className="bg-gray-700/50 p-3 rounded flex items-center justify-between">
                      <span className="text-lg text-gray-300">Combined</span>
                      <span className="text-xl text-green-400">
                        {currentVehicle.combA08} {currentVehicle.fuelType2.includes('Electricity') ? 'MPGe' : 'MPG'}
                      </span>
                    </div>
                  )}
                  <div className="grid sm:grid-cols-2 gap-3">
                    {currentVehicle.cityA08 && (
                      <div className="bg-gray-700/50 p-3 rounded flex items-center justify-between">
                        <span className="text-gray-300">City</span>
                        <span className="text-lg text-blue-400">
                          {currentVehicle.cityA08} {currentVehicle.fuelType2.includes('Electricity') ? 'MPGe' : 'MPG'}
                        </span>
                      </div>
                    )}
                    {currentVehicle.highwayA08 && (
                      <div className="bg-gray-700/50 p-3 rounded flex items-center justify-between">
                        <span className="text-gray-300">Highway</span>
                        <span className="text-lg text-red-400">
                          {currentVehicle.highwayA08} {currentVehicle.fuelType2.includes('Electricity') ? 'MPGe' : 'MPG'}
                        </span>
                      </div>
                    )}
            </div>
          </div>
        )}

              {/* Hybrid Mode (if available) */}
              {(currentVehicle.phevComb || currentVehicle.phevCity || currentVehicle.phevHwy) && (
                <div className="space-y-3 border-t border-gray-700 pt-3">
                  <h3 className="text-lg font-medium text-green-400 flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Hybrid Mode
                  </h3>
                  {currentVehicle.phevComb && (
                    <div className="bg-gray-700/50 p-3 rounded flex items-center justify-between">
                      <span className="text-lg text-gray-300">Combined</span>
                      <span className="text-xl text-green-400">
                        {currentVehicle.phevComb} MPGe
                      </span>
                    </div>
                  )}
                  <div className="grid sm:grid-cols-2 gap-3">
                    {currentVehicle.phevCity && (
                      <div className="bg-gray-700/50 p-3 rounded flex items-center justify-between">
                        <span className="text-gray-300">City</span>
                        <span className="text-lg text-blue-400">
                          {currentVehicle.phevCity} MPGe
                        </span>
                      </div>
                    )}
                    {currentVehicle.phevHwy && (
                      <div className="bg-gray-700/50 p-3 rounded flex items-center justify-between">
                        <span className="text-gray-300">Highway</span>
                        <span className="text-lg text-red-400">
                          {currentVehicle.phevHwy} MPGe
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowSearch(true)}
            className="w-full p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {/* <CarFront className="h-5 w-5" /> */}
            Select Vehicle {vehicleNumber}
          </button>
        )}

        {/* Search interface - only shown when needed */}
        <div className={`overflow-hidden transition-[max-height] duration-300 ease-in-out ${showSearch ? 'max-h-[1000px]' : 'max-h-0'}`}>
        <FuelSavingsVehicleLookup 
            onVehicleSelect={(vehicle) => {
              onVehicleSelect(vehicle);
              setCurrentVehicle(vehicle);
              setShowSearch(false);
            }}
          makes={makes}
          customResultDisplay={(vehicle: Vehicle) => (
            <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
              {/* Vehicle Header */}
              <div className="bg-gradient-to-r from-blue-800 to-blue-900 p-3">
                <div className="flex items-center gap-3">
                  <CarFront className="h-6 w-6 text-white" />
                  <h4 className="text-lg font-semibold text-white">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </h4>
                </div>
              </div>
              
              {/* MPG Data */}
              <div className="p-3 space-y-3">
                <div className="bg-gray-700/50 p-3 rounded flex items-center justify-between">
                  <span className="text-gray-300">Combined</span>
                  <span className="text-xl text-green-400">
                    {vehicle.phevComb || vehicle.comb08} {(vehicle.phevComb || vehicle.fuelType1.includes('Electricity')) ? 'MPGe' : 'MPG'}
                  </span>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="bg-gray-700/50 p-3 rounded flex items-center justify-between">
                    <span className="text-gray-300">City</span>
                    <span className="text-lg text-blue-400">
                      {vehicle.phevCity || vehicle.city08} {(vehicle.phevCity || vehicle.fuelType1.includes('Electricity')) ? 'MPGe' : 'MPG'}
                    </span>
                  </div>
                  <div className="bg-gray-700/50 p-3 rounded flex items-center justify-between">
                    <span className="text-gray-300">Highway</span>
                    <span className="text-lg text-red-400">
                      {vehicle.phevHwy || vehicle.highway08} {(vehicle.phevHwy || vehicle.fuelType1.includes('Electricity')) ? 'MPGe' : 'MPG'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Select Button */}
              <div className="p-3 bg-gray-800/50 flex justify-center">
                <Button 
                    onClick={() => {
                      onVehicleSelect(vehicle);
                      setCurrentVehicle(vehicle);
                      setShowSearch(false);
                    }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Select This Vehicle
                </Button>
              </div>
            </div>
          )}
        />
        </div>
      </div>
    )
  }

  // Handler for vehicle selection from database
  const handleVehicleSelect = (vehicle: Vehicle, vehicleNumber: 1 | 2) => {
    const fuelType1Price = getDefaultPrice(vehicle.fuelType1)
    const fuelType2Price = vehicle.fuelType2 ? getDefaultPrice(vehicle.fuelType2) : undefined

    setCalculatorState(prev => ({
      ...prev,
      [`vehicle${vehicleNumber}`]: {
        ...prev[`vehicle${vehicleNumber}` as keyof Pick<CalculatorState, 'vehicle1' | 'vehicle2'>],
        fromDb: vehicle,
        fuelCost: fuelType1Price,
        fuelCost2: fuelType2Price,
        usageSplit: DEFAULT_FUEL_SPLIT,
        cityHighwaySplit: 50,
        useCustomSplit: false
      }
    }))
  }

  // Handler for manual MPG input toggle
  const handleManualToggle = (checked: boolean, vehicleNumber: 1 | 2) => {
    setCalculatorState(prev => ({
      ...prev,
      [`vehicle${vehicleNumber}`]: {
        ...prev[`vehicle${vehicleNumber}` as keyof Pick<CalculatorState, 'vehicle1' | 'vehicle2'>],
        fromDb: null,
        manual: checked ? {
          name: '',
          primaryFuelType: 'regular_gasoline',
          primaryEfficiency: {
            combined: 0,
            city: 0,
            highway: 0,
            usesCityHighway: false
          },
          secondaryFuelType: '',
          secondaryEfficiency: {
            combined: 0,
            city: 0,
            highway: 0,
            usesCityHighway: false
          },
          fuelSplit: 50
        } : null,
        fuelCost: FUEL_DEFAULTS.REGULAR_GASOLINE,
        isManualInput: checked,
        usageSplit: DEFAULT_FUEL_SPLIT
      }
    }))
  }

  // Handler for manual vehicle updates
  const handleManualVehicleUpdate = (vehicleNumber: 1 | 2, field: keyof ManualVehicle, value: any) => {
    setCalculatorState(prev => {
      const vehicle = prev[`vehicle${vehicleNumber}` as keyof Pick<CalculatorState, 'vehicle1' | 'vehicle2'>]
      if (!vehicle.manual) {
        // Initialize manual vehicle if it doesn't exist
        handleManualToggle(true, vehicleNumber)
        return prev
      }

      // Set default fuel costs when fuel types are selected
      let fuelCostUpdates = {}
      if (field === 'primaryFuelType') {
        const fuelType = AVAILABLE_FUEL_TYPES.find(f => f.id === value)
        fuelCostUpdates = {
          fuelCost: fuelType ? fuelType.defaultCost : FUEL_DEFAULTS.REGULAR_GASOLINE
        }
      } else if (field === 'secondaryFuelType') {
        const fuelType = AVAILABLE_FUEL_TYPES.find(f => f.id === value)
        fuelCostUpdates = {
          fuelCost2: fuelType ? fuelType.defaultCost : undefined
        }
      }

      return {
        ...prev,
        [`vehicle${vehicleNumber}`]: {
          ...vehicle,
          manual: {
            ...vehicle.manual,
            [field]: value
          },
          ...fuelCostUpdates
        }
      }
    })
  }

  // Handler for updating fuel costs
  const handleFuelCostUpdate = (vehicleNumber: 1 | 2, value: string, isSecondaryFuel: boolean = false) => {
    const numValue = parseFloat(value) || 0
    setCalculatorState(prev => ({
      ...prev,
      [`vehicle${vehicleNumber}`]: {
        ...prev[`vehicle${vehicleNumber}` as keyof Pick<CalculatorState, 'vehicle1' | 'vehicle2'>],
        [isSecondaryFuel ? 'fuelCost2' : 'fuelCost']: numValue
      }
    }))
  }

  // Handler for updating fuel usage split
  const handleSplitUpdate = (vehicleNumber: 1 | 2, value: number[]) => {
    const splitValue = value[0]
    setCalculatorState(prev => ({
      ...prev,
      [`vehicle${vehicleNumber}`]: {
        ...prev[`vehicle${vehicleNumber}` as keyof Pick<CalculatorState, 'vehicle1' | 'vehicle2'>],
        usageSplit: splitValue
      }
    }))
  }

  // Add handler for city/highway split toggle
  const handleCustomSplitToggle = (checked: boolean) => {
    if (checked) {
      // Check if any vehicles are missing city/highway values
      const missingValues: MissingFuelValues[] = []
      
      // Helper function to check fuel efficiency values
      const checkFuelEfficiency = (
        vehicleNumber: 1 | 2,
        efficiency: FuelEfficiency | undefined,
        fuelType: 'primary' | 'secondary',
        fuelName: string
      ) => {
        if (efficiency && (!efficiency.city || !efficiency.highway)) {
          missingValues.push({
            vehicleNumber,
            fuelType,
            fuelName
          })
        }
      }
      
      // Check Vehicle 1
      if (calculatorState.vehicle1.manual) {
        // Check primary fuel
        checkFuelEfficiency(
          1,
          calculatorState.vehicle1.manual.primaryEfficiency,
          'primary',
          AVAILABLE_FUEL_TYPES.find(f => f.id === calculatorState.vehicle1.manual!.primaryFuelType)?.label || 'Primary Fuel'
        )
        
        // Check secondary fuel if it exists
        if (calculatorState.vehicle1.manual.secondaryFuelType && calculatorState.vehicle1.manual.secondaryEfficiency) {
          checkFuelEfficiency(
            1,
            calculatorState.vehicle1.manual.secondaryEfficiency,
            'secondary',
            AVAILABLE_FUEL_TYPES.find(f => f.id === calculatorState.vehicle1.manual!.secondaryFuelType)?.label || 'Secondary Fuel'
          )
        }
      }
      
      // Check Vehicle 2
      if (calculatorState.vehicle2.manual) {
        // Check primary fuel
        checkFuelEfficiency(
          2,
          calculatorState.vehicle2.manual.primaryEfficiency,
          'primary',
          AVAILABLE_FUEL_TYPES.find(f => f.id === calculatorState.vehicle2.manual!.primaryFuelType)?.label || 'Primary Fuel'
        )
        
        // Check secondary fuel if it exists
        if (calculatorState.vehicle2.manual.secondaryFuelType && calculatorState.vehicle2.manual.secondaryEfficiency) {
          checkFuelEfficiency(
            2,
            calculatorState.vehicle2.manual.secondaryEfficiency,
            'secondary',
            AVAILABLE_FUEL_TYPES.find(f => f.id === calculatorState.vehicle2.manual!.secondaryFuelType)?.label || 'Secondary Fuel'
          )
        }
      }

      if (missingValues.length > 0) {
        // Group missing values by vehicle
        const vehicleGroups = missingValues.reduce((acc, curr) => {
          if (!acc[curr.vehicleNumber]) {
            acc[curr.vehicleNumber] = [];
          }
          acc[curr.vehicleNumber].push(curr);
          return acc;
        }, {} as Record<number, MissingFuelValues[]>);

        setPendingVehicles(Object.keys(vehicleGroups).map(Number) as Array<1 | 2>);
        setMissingFuelValues(missingValues);
        setShowWarningDialog(true);
        return;
      }
    }

    setCalculatorState(prev => ({
      ...prev,
      useCustomSplit: checked
    }))
  }

  // Add handler for city/highway split update
  const handleCityHighwaySplitUpdate = (value: number[]) => {
    setCalculatorState(prev => ({
      ...prev,
      cityHighwaySplit: value[0]
    }))
  }

  // Add helper function to scroll to vehicle
  const scrollToVehicle = (vehicleNumber: number) => {
    const element = document.getElementById(`vehicle-${vehicleNumber}-card`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      // Expand the city/highway inputs if not already expanded
      if (vehicleNumber === 1 && calculatorState.vehicle1.manual) {
        handleManualVehicleUpdate(1, 'primaryEfficiency', {
          ...calculatorState.vehicle1.manual.primaryEfficiency,
          usesCityHighway: true
        })
      } else if (vehicleNumber === 2 && calculatorState.vehicle2.manual) {
        handleManualVehicleUpdate(2, 'primaryEfficiency', {
          ...calculatorState.vehicle2.manual.primaryEfficiency,
          usesCityHighway: true
        })
      }
    }
  }

  // Calculate fuel costs for a vehicle
  const calculateVehicleCosts = (
    vehicle: VehicleSelection,
    mileage: number,
    cityPercentage: number,
    useCustomSplit: boolean
  ): FuelCosts | null => {
    let annualCost = 0;

    if (vehicle.fromDb) {
      if (vehicle.fromDb.fuelType2) {
        // DUAL-FUEL DB VEHICLE CALCULATION
        const primaryMiles = mileage * (vehicle.usageSplit / 100)
        const secondaryMiles = mileage * (1 - vehicle.usageSplit / 100)

        // Calculate primary fuel efficiency
        const primaryEfficiency = useCustomSplit
          ? calculateEfficiency({
              cityMPG: vehicle.fromDb.city08,
              highwayMPG: vehicle.fromDb.highway08,
              cityPercentage: cityPercentage,
              miles: primaryMiles
            })
          : { weightedMPG: vehicle.fromDb.comb08, cityMiles: 0, highwayMiles: primaryMiles }

        // Calculate secondary fuel efficiency
        const secondaryEfficiency = useCustomSplit && vehicle.fromDb.cityA08 && vehicle.fromDb.highwayA08
          ? calculateEfficiency({
              cityMPG: vehicle.fromDb.cityA08,
              highwayMPG: vehicle.fromDb.highwayA08,
              cityPercentage: cityPercentage,
              miles: secondaryMiles
            })
          : { weightedMPG: vehicle.fromDb.combA08 || 0, cityMiles: 0, highwayMiles: secondaryMiles }

        // Calculate costs for each fuel type
        const primaryCost = calculateFuelCost({
          miles: primaryMiles,
          mpg: primaryEfficiency.weightedMPG,
          fuelPrice: vehicle.fuelCost,
          fuelType: vehicle.fromDb.fuelType1
        })

        const secondaryCost = calculateFuelCost({
          miles: secondaryMiles,
          mpg: secondaryEfficiency.weightedMPG,
          fuelPrice: vehicle.fuelCost2 || 0,
          fuelType: vehicle.fromDb.fuelType2
        })

        annualCost = primaryCost + secondaryCost

      } else {
        // SINGLE-FUEL DB VEHICLE CALCULATION
        const efficiency = useCustomSplit
          ? calculateEfficiency({
              cityMPG: vehicle.fromDb.city08,
              highwayMPG: vehicle.fromDb.highway08,
              cityPercentage: cityPercentage,
              miles: mileage
            })
          : { weightedMPG: vehicle.fromDb.comb08, cityMiles: 0, highwayMiles: mileage }

        annualCost = calculateFuelCost({
          miles: mileage,
          mpg: efficiency.weightedMPG,
          fuelPrice: vehicle.fuelCost,
          fuelType: vehicle.fromDb.fuelType1
        })
      }
    } else if (vehicle.manual) {
      // Validate required data for manual vehicles
      if (!vehicle.manual.primaryEfficiency.combined) return null;

      if (vehicle.manual.secondaryFuelType && vehicle.manual.secondaryEfficiency) {
        // DUAL-FUEL MANUAL VEHICLE
        const primaryMiles = mileage * ((vehicle.manual.fuelSplit || DEFAULT_FUEL_SPLIT) / 100);
        const secondaryMiles = mileage * (1 - (vehicle.manual.fuelSplit || DEFAULT_FUEL_SPLIT) / 100);

        // Calculate primary fuel efficiency with city/highway split
        let primaryEfficiency;
        if (vehicle.manual.primaryEfficiency.usesCityHighway && useCustomSplit) {
          // If using city/highway values and toggle is ON, calculate weighted MPG
          if (vehicle.manual.primaryEfficiency.city && vehicle.manual.primaryEfficiency.highway) {
            primaryEfficiency = calculateEfficiency({
              cityMPG: vehicle.manual.primaryEfficiency.city,
              highwayMPG: vehicle.manual.primaryEfficiency.highway,
              cityPercentage: cityPercentage,
              miles: primaryMiles
            });
          } else {
            // If city/highway values are missing, use combined
            primaryEfficiency = {
              weightedMPG: vehicle.manual.primaryEfficiency.combined,
              cityMiles: 0,
              highwayMiles: primaryMiles 
            };
          }
        } else {
          // If not using city/highway or toggle is OFF, use combined directly
          primaryEfficiency = {
            weightedMPG: vehicle.manual.primaryEfficiency.combined,
            cityMiles: 0,
            highwayMiles: primaryMiles
          };
        }

        // Calculate secondary fuel efficiency with city/highway split
        let secondaryEfficiency;
        if (vehicle.manual.secondaryEfficiency.usesCityHighway && useCustomSplit) {
          // If using city/highway values and toggle is ON, calculate weighted MPG
          if (vehicle.manual.secondaryEfficiency.city && vehicle.manual.secondaryEfficiency.highway) {
            secondaryEfficiency = calculateEfficiency({
              cityMPG: vehicle.manual.secondaryEfficiency.city,
              highwayMPG: vehicle.manual.secondaryEfficiency.highway,
              cityPercentage: cityPercentage,
              miles: secondaryMiles
            });
          } else {
            // If city/highway values are missing, use combined
            secondaryEfficiency = {
              weightedMPG: vehicle.manual.secondaryEfficiency.combined,
              cityMiles: 0,
              highwayMiles: secondaryMiles 
            };
          }
        } else {
          // If not using city/highway or toggle is OFF, use combined directly
          secondaryEfficiency = {
            weightedMPG: vehicle.manual.secondaryEfficiency.combined,
            cityMiles: 0,
            highwayMiles: secondaryMiles
          };
        }

        // Calculate costs for each fuel type
        const primaryCost = calculateFuelCost({
          miles: primaryMiles,
          mpg: primaryEfficiency.weightedMPG,
          fuelPrice: vehicle.fuelCost,
          fuelType: vehicle.manual.primaryFuelType
        });

        const secondaryCost = vehicle.fuelCost2
          ? calculateFuelCost({
              miles: secondaryMiles,
              mpg: secondaryEfficiency.weightedMPG,
              fuelPrice: vehicle.fuelCost2,
              fuelType: vehicle.manual.secondaryFuelType
            })
          : 0;

        annualCost = primaryCost + secondaryCost;
      } else {
        // SINGLE-FUEL MANUAL VEHICLE
        let efficiency;
        if (vehicle.manual.primaryEfficiency.usesCityHighway && useCustomSplit) {
          // If using city/highway values and toggle is ON, calculate weighted MPG
          if (vehicle.manual.primaryEfficiency.city && vehicle.manual.primaryEfficiency.highway) {
            efficiency = calculateEfficiency({
              cityMPG: vehicle.manual.primaryEfficiency.city,
              highwayMPG: vehicle.manual.primaryEfficiency.highway,
              cityPercentage: cityPercentage,
              miles: mileage
            });
          } else {
            // If city/highway values are missing, use combined
            efficiency = {
              weightedMPG: vehicle.manual.primaryEfficiency.combined,
              cityMiles: 0,
              highwayMiles: mileage 
            };
          }
        } else {
          // If not using city/highway or toggle is OFF, use combined directly
          efficiency = {
            weightedMPG: vehicle.manual.primaryEfficiency.combined,
            cityMiles: 0,
            highwayMiles: mileage
          };
        }

        annualCost = calculateFuelCost({
          miles: mileage,
          mpg: efficiency.weightedMPG,
          fuelPrice: vehicle.fuelCost,
          fuelType: vehicle.manual.primaryFuelType
        });
      }
    }

    if (annualCost === 0) return null;

    return {
      weekly: annualCost / 52,
      monthly: annualCost / 12,
      annual: annualCost,
      threeYear: annualCost * 3,
      fiveYear: annualCost * 5,
      tenYear: annualCost * 10
    };
  }

  // Calculate all costs when inputs change
  useEffect(() => {
    const v1Costs = calculateVehicleCosts(calculatorState.vehicle1, calculatorState.annualMileage, calculatorState.cityHighwaySplit, calculatorState.useCustomSplit)
    const v2Costs = calculateVehicleCosts(calculatorState.vehicle2, calculatorState.annualMileage, calculatorState.cityHighwaySplit, calculatorState.useCustomSplit)

    const savings = v1Costs && v2Costs ? {
      weekly: v2Costs.weekly - v1Costs.weekly,
      monthly: v2Costs.monthly - v1Costs.monthly,
      annual: v2Costs.annual - v1Costs.annual,
      threeYear: v2Costs.threeYear - v1Costs.threeYear,
      fiveYear: v2Costs.fiveYear - v1Costs.fiveYear,
      tenYear: v2Costs.tenYear - v1Costs.tenYear
    } : null

    setCosts({
      vehicle1: v1Costs,
      vehicle2: v2Costs,
      savings
    })
  }, [calculatorState])

  // Helper function to get fuel type label from the AVAILABLE_FUEL_TYPES
  const getFuelTypeLabel = (fuelTypeId: string): string => {
    const fuelType = AVAILABLE_FUEL_TYPES.find(fuel => fuel.id === fuelTypeId)
    return fuelType?.label || fuelTypeId
  }

  // Update the renderFuelCostInput function
  const renderFuelCostInput = (
    vehicleNumber: 1 | 2,
    fuelTypeId: string,
    isSecondaryFuel: boolean = false
  ) => {
    const vehicle = calculatorState[`vehicle${vehicleNumber}` as keyof Pick<CalculatorState, 'vehicle1' | 'vehicle2'>]
    const fuelCost = isSecondaryFuel ? vehicle.fuelCost2 : vehicle.fuelCost

    // Handle database vehicles
    if (vehicle.fromDb) {
      const fuelType = isSecondaryFuel ? vehicle.fromDb.fuelType2 : vehicle.fromDb.fuelType1
      if (!fuelType) return null
      const fuelInfo = getFuelTypeInfo(fuelType)

    return (
      <div className="space-y-2 bg-green-900/80 p-3 rounded-lg border border-gray-700/50
                      transition-all duration-300 hover:border-blue-500/20">
        <div className="flex items-center justify-between">
          <Label htmlFor={`v${vehicleNumber}-fuel-cost${isSecondaryFuel ? '-2' : ''}`} 
                 className="text-white/90 flex items-center gap-2">
            <Fuel className="h-4 w-4 text-white-400" />
            <span>{fuelInfo.label}</span>
            <span className="text-gray-300 text-sm">({fuelInfo.unit})</span>
          </Label>
        </div>
        <div className="relative mt-2">
          <Input
            id={`v${vehicleNumber}-fuel-cost${isSecondaryFuel ? '-2' : ''}`}
            type="number"
            step="0.01"
            min="0"
            value={fuelCost}
            onChange={(e) => handleFuelCostUpdate(vehicleNumber, e.target.value, isSecondaryFuel)}
            className="bg-gray-900/50 border-gray-600/50 text-white/90 pl-6
                      focus:border-blue-500/50 focus:ring-blue-500/20
                      transition-all duration-300"
          />
          <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
        </div>
      </div>
    )
    }

    // Handle manual vehicles
    if (vehicle.manual) {
      const manualFuelTypeId = isSecondaryFuel ? vehicle.manual.secondaryFuelType : vehicle.manual.primaryFuelType
      if (!manualFuelTypeId) return null
      const fuelType = AVAILABLE_FUEL_TYPES.find(fuel => fuel.id === manualFuelTypeId)

      if (!fuelType) return null
      
      return (
        <div className="space-y-2 bg-green-900/80 p-3 rounded-lg border border-gray-700/50
                        transition-all duration-300 hover:border-blue-500/20">
          <div className="flex items-center justify-between">
            <Label htmlFor={`v${vehicleNumber}-fuel-cost${isSecondaryFuel ? '-2' : ''}`} 
                   className="text-white/90 font-semibold flex items-center gap-2">
              <Fuel className="h-4 w-4 text-white-400" />
              <span>{fuelType.label} Price</span>
              <span className="text-gray-300 text-sm">({fuelType.costUnit})</span>
            </Label>
          </div>
          <div className="relative mt-2">
            <Input
              id={`v${vehicleNumber}-fuel-cost${isSecondaryFuel ? '-2' : ''}`}
              type="number"
              step="0.01"
              min="0"
              value={fuelCost}
              onChange={(e) => handleFuelCostUpdate(vehicleNumber, e.target.value, isSecondaryFuel)}
              className="bg-gray-900/50 border-gray-600/50 text-white/90 pl-6
                        focus:border-blue-500/50 focus:ring-blue-500/20
                        transition-all duration-300"
            />
            <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
          </div>
        </div>
      )
    }

    return null
  }

  // Add this helper function before the return statement
  const prepareChartData = (costs: { vehicle1: FuelCosts, vehicle2: FuelCosts }) => {
    return [
      {
        period: 'Annual',
        vehicle1: costs.vehicle1.annual,
        vehicle2: costs.vehicle2.annual
      },
      {
        period: '3 Years',
        vehicle1: costs.vehicle1.threeYear,
        vehicle2: costs.vehicle2.threeYear
      },
      {
        period: '5 Years',
        vehicle1: costs.vehicle1.fiveYear,
        vehicle2: costs.vehicle2.fiveYear
      },
      {
        period: '10 Years',
        vehicle1: costs.vehicle1.tenYear,
        vehicle2: costs.vehicle2.tenYear
      }
    ]
  }

  // Helper function to render city/highway split section
  const renderCityHighwaySplit = () => {
    return (
      <div className="space-y-4 bg-gray-900/90 p-4 rounded-lg border border-gray-700">
        <div className="flex items-center justify-between">
          <Label className="text-gray-300 font-semibold">Adjust City vs Highway Driving?</Label>
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="p-0 h-auto hover:bg-transparent focus:ring-0"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  <Info className="h-4 w-4 text-gray-400" />
                </Button>
              </TooltipTrigger>
              <TooltipContent sideOffset={5}>
                <p className="text-sm">Adjust the split between fuel types</p>
                <p className="text-xs text-blue-400 mt-1">Default: {DEFAULT_FUEL_SPLIT}% for each fuel type</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="custom-split" className="text-white">Toggle to Adjust</Label>
          <Switch
            id="custom-split"
            checked={calculatorState.useCustomSplit}
            onCheckedChange={handleCustomSplitToggle}
          />
        </div>

        {calculatorState.useCustomSplit && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Highway ({100 - calculatorState.cityHighwaySplit}%)</span>
              <span className="text-sm text-gray-400">City ({calculatorState.cityHighwaySplit}%)</span>
            </div>
            <Slider
              value={[calculatorState.cityHighwaySplit]}
              onValueChange={handleCityHighwaySplitUpdate}
              max={100}
              step={5}
              className="cursor-pointer touch-none"
            />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-8 relative min-h-screen">
      {/* Sophisticated background with patterns */}
      <div className="absolute inset-0 bg-[#111827] bg-gradient-to-br from-gray-900/50 to-gray-800/50">
      </div>
      
      {/* Decorative orbs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-[#1E3A8A] rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob" />
      <div className="absolute top-0 -right-4 w-72 h-72 bg-[#047857] rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-[#D97706] rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-4000" />
      
      {/* Content wrapper with glass effect */}
      <div className="relative z-10 space-y-8">
        {/* Warning Dialog */}
        <Dialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
          <DialogContent className="sm:max-w-md md:max-w-lg bg-gradient-to-b from-gray-900 to-gray-800 border-2 border-red-500/20 shadow-xl shadow-red-500/10 p-6">
            <DialogHeader className="border-b border-gray-700 pb-4">
              <DialogTitle className="text-2xl font-bold text-red-400 flex items-center gap-2 justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                Action Required
              </DialogTitle>
              <DialogDescription className="pt-4 text-lg text-gray-300">
                To adjust City vs. Highway driving percentages, first update the following fuel efficiency values:
              </DialogDescription>
            </DialogHeader>
            <div className="py-6 space-y-6">
              {Object.entries(
                missingFuelValues.reduce((acc, curr) => {
                  const key = `vehicle-${curr.vehicleNumber}`;
                  if (!acc[key]) {
                    acc[key] = [];
                  }
                  acc[key].push(curr);
                  return acc;
                }, {} as Record<string, MissingFuelValues[]>)
              ).map(([vehicleKey, fuelValues]) => (
                <div key={vehicleKey} className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Vehicle {vehicleKey.split('-')[1]}</h3>
                  <div className="grid gap-3">
                    {fuelValues.map((value, index) => (
                      <Button
                        key={`${vehicleKey}-${value.fuelType}-${index}`}
                        onClick={() => {
                          scrollToVehicle(value.vehicleNumber);
                          setShowWarningDialog(false);
                        }}
                        className="w-full min-h-[3.5rem] px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 
                                  hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg 
                                  shadow-lg hover:shadow-blue-500/20 transition-all duration-200
                                  flex items-center justify-start gap-3 text-left"
                      >
                        <div className="flex-shrink-0">
                          <CarFront className="h-5 w-5" />
                        </div>
                        <span className="flex-grow">
                          {value.fuelName} City & Highway MPGs
                        </span>
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <DialogFooter className="border-t border-gray-700 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowWarningDialog(false)}
                className="w-full sm:w-auto border-gray-600 text-gray-600 hover:bg-red-700 hover:text-white"
              >
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Vehicle Selection Section */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Vehicle 1 Selection */}
          <Card id="vehicle-1-card" className="backdrop-blur-md bg-white border border-white/10
                        shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]">
            <CardHeader className="border-b border-white/5">
              <CardTitle className="text-emerald-700 font-bold font-heading flex items-center gap-2">
                <CarFront className="h-5 w-5 text-emerald-700" />
                Vehicle 1
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              {/* Glass card inner glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent rounded-b-lg" />
              
              {/* Rest of the Vehicle 1 content */}
              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="manual-input-1" className="text-gray-900">Toggle for Manual Vehicle Input</Label>
                  <Switch
                    id="manual-input-1"
                    className="data-[state=checked]:bg-black/90 data-[state=unchecked]:bg-blue-600"
                    checked={calculatorState.vehicle1.isManualInput}
                    onCheckedChange={(checked) => handleManualToggle(checked, 1)}
                  />
                </div>
                
                {calculatorState.vehicle1.isManualInput && calculatorState.vehicle1.manual ? (
                  <div className="space-y-4 bg-gray-100/40 p-4 rounded-lg border">
                    <div className="space-y-3">
                      <div className="group">
                        <Label htmlFor="vehicle1-name" className="text-black font-semibold inline-flex items-center space-x-2">
                          <span>Vehicle Name</span>
                        </Label>
                        <Input
                          id="vehicle1-name"
                          value={calculatorState.vehicle1.manual!.name}
                          onChange={(e) => handleManualVehicleUpdate(1, 'name', e.target.value)}
                          className="mt-1.5 text-black/90 
                                    focus:border-black
                                    transition-all duration-300"
                          placeholder="e.g. My Toyota Camry"
                        />
                      </div>
                      <div className="bg-gray-200/50 rounded-lg overflow-hidden">
                        <div className="px-4 py-3 flex items-center gap-2">
                          <Fuel className="h-4 w-4 text-emerald-500" />
                          <Label htmlFor="vehicle1-fueltype" className="text-black font-medium">
                            Primary Fuel Type
                          </Label>
                        </div>
                        <div className="px-4 pb-4">
                          <select
                            id="vehicle1-fueltype"
                            value={calculatorState.vehicle1.manual!.primaryFuelType}
                            onChange={(e) => handleManualVehicleUpdate(1, 'primaryFuelType', e.target.value)}
                            className="w-full bg-white text-black border border-gray-200 rounded-md p-2"
                          >
                            {AVAILABLE_FUEL_TYPES.map(fuel => (
                              <option key={fuel.id} value={fuel.id}>
                                {fuel.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <EfficiencyInput
                        fuelType={AVAILABLE_FUEL_TYPES.find(f => f.id === calculatorState.vehicle1.manual!.primaryFuelType)!}
                        efficiency={calculatorState.vehicle1.manual!.primaryEfficiency}
                        onChange={(newEfficiency) => handleManualVehicleUpdate(1, 'primaryEfficiency', newEfficiency)}
                        className="mt-4"
                        allowSecondaryFuel={true}
                        primaryFuelType={calculatorState.vehicle1.manual!.primaryFuelType}
                        secondaryFuelType={calculatorState.vehicle1.manual!.secondaryFuelType}
                        secondaryEfficiency={calculatorState.vehicle1.manual!.secondaryEfficiency}
                        onSecondaryFuelSelect={(fuelType) => handleManualVehicleUpdate(1, 'secondaryFuelType', fuelType)}
                        onSecondaryEfficiencyChange={(efficiency) => handleManualVehicleUpdate(1, 'secondaryEfficiency', efficiency)}
                        fuelSplit={calculatorState.vehicle1.manual!.fuelSplit}
                        onFuelSplitChange={(split) => handleManualVehicleUpdate(1, 'fuelSplit', split)}
                      />
                    </div>
                  </div>
                ) : (
                  <FuelComparisonVehicleLookup
                    onVehicleSelect={(vehicle) => handleVehicleSelect(vehicle, 1)}
                    vehicleNumber={1}
                  />
                )}

                {/* Fuel Cost Inputs */}
                {(calculatorState.vehicle1.fromDb || 
                  (calculatorState.vehicle1.manual && calculatorState.vehicle1.manual.primaryFuelType)) && (
                  <div className="mt-6 space-y-4 bg-emerald-100/90 p-4 rounded-lg border border-gray-700/50">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                      <Fuel className="h-5 w-5 text-emerald-500" />
                      Fuel Costs
                    </h3>
                    <div className="space-y-4">
                      {/* Primary Fuel Cost */}
                      <div className="">
                        {renderFuelCostInput(1, 
                          calculatorState.vehicle1.fromDb?.fuelType1 || 
                          calculatorState.vehicle1.manual?.primaryFuelType || 
                          ''
                        )}
                      </div>
                      
                      {/* Secondary Fuel Cost */}
                      {(calculatorState.vehicle1.fromDb?.fuelType2 || calculatorState.vehicle1.manual?.secondaryFuelType) && (
                        <>
                          <div className="border-t border-emerald-500/20 my-6" />
                          <div className="rounded-lg border border-emerald-500/10 
                                          shadow-inner shadow-emerald-500/5">
                            {renderFuelCostInput(1, 
                              calculatorState.vehicle1.fromDb?.fuelType2 || 
                              calculatorState.vehicle1.manual?.secondaryFuelType || 
                              '', 
                              true
                            )}
                          </div>
                          <div className="bg-gradient-to-br from-white to-slate-50 
                                          rounded-lg border border-emerald-500/10 
                                          shadow-inner shadow-emerald-500/5 mt-4">
                            {renderFuelSplitSlider(1)}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Vehicle 2 Selection - Mirror the same styling */}
          <Card id="vehicle-2-card" className="backdrop-blur-md bg-white border border-white/10
                        shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]">
            <CardHeader className="border-b border-white/5">
              <CardTitle className="text-emerald-700 font-bold font-heading flex items-center gap-2">
                <CarFront className="h-5 w-5 text-emerald-700" />
                Vehicle 2
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              {/* Glass card inner glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent rounded-b-lg" />
              
              {/* Rest of the Vehicle 2 content */}
              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="manual-input-2" className="text-gray-900">Toggle for Manual Input</Label>
                  <Switch
                    id="manual-input-2"
                    className="data-[state=checked]:bg-black/90 data-[state=unchecked]:bg-blue-600"
                    checked={calculatorState.vehicle2.isManualInput}
                    onCheckedChange={(checked) => handleManualToggle(checked, 2)}
                  />
                </div>
                
                {calculatorState.vehicle2.isManualInput && calculatorState.vehicle2.manual ? (
                  <div className="space-y-4 bg-gray-100/40 p-4 rounded-lg border">
                    <div className="space-y-3">
                      <div className="group">
                          <Label htmlFor="vehicle2-name" className="text-black font-semibold inline-flex items-center space-x-2">
                          {/* <CarFront className="h-4 w-4 text-blue-400" /> */}
                          <span>Vehicle Name</span>
                        </Label>
                      <Input
                        id="vehicle2-name"
                          value={calculatorState.vehicle2.manual!.name}
                        onChange={(e) => handleManualVehicleUpdate(2, 'name', e.target.value)}
                          className="mt-1.5 text-black/90 
                                    focus:border-black
                                    transition-all duration-300"
                        placeholder="e.g. My Honda Accord"
                      />
                    </div>
                      <div className="bg-gray-200/50 rounded-lg overflow-hidden">
                        <div className="px-4 py-3 flex items-center gap-2">
                          <Fuel className="h-4 w-4 text-emerald-500" />
                          <Label htmlFor="vehicle2-fueltype" className="text-black font-medium">
                            Primary Fuel Type
                          </Label>
                        </div>
                        <div className="px-4 pb-4">
                          <select
                            id="vehicle2-fueltype"
                            value={calculatorState.vehicle2.manual!.primaryFuelType}
                            onChange={(e) => handleManualVehicleUpdate(2, 'primaryFuelType', e.target.value)}
                            className="w-full bg-white text-black border border-gray-200 rounded-md p-2"
                          >
                            {AVAILABLE_FUEL_TYPES.map(fuel => (
                              <option key={fuel.id} value={fuel.id}>
                                {fuel.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <EfficiencyInput
                        fuelType={AVAILABLE_FUEL_TYPES.find(f => f.id === calculatorState.vehicle2.manual!.primaryFuelType)!}
                        efficiency={calculatorState.vehicle2.manual!.primaryEfficiency}
                        onChange={(newEfficiency) => handleManualVehicleUpdate(2, 'primaryEfficiency', newEfficiency)}
                        className="mt-4"
                        allowSecondaryFuel={true}
                        primaryFuelType={calculatorState.vehicle2.manual!.primaryFuelType}
                        secondaryFuelType={calculatorState.vehicle2.manual!.secondaryFuelType}
                        secondaryEfficiency={calculatorState.vehicle2.manual!.secondaryEfficiency}
                        onSecondaryFuelSelect={(fuelType) => handleManualVehicleUpdate(2, 'secondaryFuelType', fuelType)}
                        onSecondaryEfficiencyChange={(efficiency) => handleManualVehicleUpdate(2, 'secondaryEfficiency', efficiency)}
                        fuelSplit={calculatorState.vehicle2.manual!.fuelSplit}
                        onFuelSplitChange={(split) => handleManualVehicleUpdate(2, 'fuelSplit', split)}
                      />
                    </div>
                  </div>
                ) : (
                  <FuelComparisonVehicleLookup
                    onVehicleSelect={(vehicle) => handleVehicleSelect(vehicle, 2)}
                    vehicleNumber={2}
                  />
                )}

                {/* Fuel Cost Inputs */}
                {(calculatorState.vehicle2.fromDb || 
                  (calculatorState.vehicle2.manual && calculatorState.vehicle2.manual.primaryFuelType)) && (
                  <div className="mt-6 space-y-4 bg-emerald-100/90 p-4 rounded-lg border border-gray-700/50">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                      <Fuel className="h-5 w-5 text-emerald-500" />
                      Fuel Costs
                    </h3>
                    <div className="space-y-4">
                      {/* Primary Fuel Cost */}
                      {renderFuelCostInput(2, 
                        calculatorState.vehicle2.fromDb?.fuelType1 || 
                        calculatorState.vehicle2.manual?.primaryFuelType || 
                        ''
                      )}
                      
                      {/* Secondary Fuel Cost */}
                      {(calculatorState.vehicle2.fromDb?.fuelType2 || calculatorState.vehicle2.manual?.secondaryFuelType) && (
                        <>
                          <div className="border-t border-gray-700/50 my-4" />
                          {renderFuelCostInput(2, 
                            calculatorState.vehicle2.fromDb?.fuelType2 || 
                            calculatorState.vehicle2.manual?.secondaryFuelType || 
                            '', 
                            true
                          )}
                          {renderFuelSplitSlider(2)}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Driving Pattern Section */}
        <Card className="backdrop-blur-md bg-white/90 border border-indigo-500/20">
          <CardHeader className="border-b border-indigo-400/10">
            <CardTitle className="text-gray-900 font-heading flex items-center gap-2 text-xl">
              {/* <Gauge className="h-5 w-5 text-[#047857]" /> */}
              How Many Miles Do You Drive?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Mileage Input */}
              <div className="space-y-4">
                {/* Mileage Input Type Selection */}
                <div className="grid grid-cols-4 gap-2 bg-indigo-900/90 p-4 rounded-xl border border-amber-400/20 shadow-lg">
                  {(['annual', 'monthly', 'weekly', 'daily'] as const).map((period) => (
                    <Button
                      key={period}
                      variant={calculatorState.mileageInputType === period ? "default" : "outline"}
                      onClick={() => setCalculatorState(prev => ({
                        ...prev,
                        mileageInputType: period,
                        cityHighwaySplit: 50,
                        useCustomSplit: false,
                        annualMileage: prev.annualMileage
                      }))}
                      className={`capitalize font-medium transition-all duration-200 ${
                        calculatorState.mileageInputType === period 
                          ? "bg-white text-amber-600 shadow-md hover:bg-gray-100" 
                          : "bg-transparent border-white/30 text-white hover:bg-white/20"
                      }`}
                    >
                      {period}
                    </Button>
                  ))}
                </div>

                {/* Mileage Input */}
                <div className="space-y-4 bg-indigo-500/20 p-4 rounded-xl border border-indigo-500/20">
                  <div>
                    <Label htmlFor="mileage-input" className="text-indigo-900 capitalize font-medium mb-2 block">
                      {calculatorState.mileageInputType} Mileage
                    </Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="mileage-input"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={convertMileage(
                          calculatorState.annualMileage,
                          'annual',
                          calculatorState.mileageInputType
                        ) || ''}
                        onChange={(e) => {
                          const value = e.target.value.replace(/^0+/, '')
                          if (value === '' || /^\d+$/.test(value)) {
                            handleMileageChange(value, calculatorState.mileageInputType)
                          }
                        }}
                        className="bg-indigo-800/80 border-indigo-400/30 text-white placeholder-indigo-300/50
                                 focus:border-amber-400/50 focus:ring-amber-400/20 transition-all duration-200"
                        placeholder={`Enter ${calculatorState.mileageInputType} mileage`}
                      />
                      <span className="text-indigo-900/70 whitespace-nowrap font-medium">
                        miles/{getPeriodSuffix(calculatorState.mileageInputType)}
                      </span>
                    </div>
                  </div>

                  {/* Other Period Displays */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    {(['annual', 'monthly', 'weekly', 'daily'] as const)
                      .filter(period => period !== calculatorState.mileageInputType)
                      .map(period => (
                        <div key={period} className="bg-indigo-900/90 p-4 rounded-lg
                                                   border border-indigo-400/10 shadow-inner">
                          <div className="flex justify-between items-center">
                            <span className="text-indigo-200 capitalize font-medium">{period}:</span>
                            <span className="text-amber-400 font-semibold">
                              {convertMileage(calculatorState.annualMileage, 'annual', period).toLocaleString()} 
                              <span className="text-indigo-300 text-sm ml-1 font-normal">
                                miles/{getPeriodSuffix(period)}
                              </span>
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {/* City/Highway Split */}
              {renderCityHighwaySplit()}
            </div>
          </CardContent>
        </Card>

        {/* Calculate Button */}
        {((calculatorState.vehicle1.fromDb || calculatorState.vehicle1.manual) &&
          (calculatorState.vehicle2.fromDb || calculatorState.vehicle2.manual)) && (
            <div className="flex justify-center">
              <Button
                onClick={calculateSavings}
                className="bg-gradient-to-r from-[#047857] to-[#047857]/80
                          hover:from-[#047857]/90 hover:to-[#047857]/70
                          text-white px-8 py-4 text-lg
                          shadow-lg hover:shadow-[#047857]/20
                          transition-all duration-300
                          backdrop-blur-sm"
              >
                Calculate Savings
              </Button>
            </div>
        )}

        {/* Results Section */}
        {costs?.vehicle1 && costs?.vehicle2 && costs?.savings && (
          <Card className="backdrop-blur-md bg-white/[0.02] border border-white/10
                          shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]">
            <CardHeader className="border-b border-white/5 bg-gradient-to-r 
                                  from-[#1E3A8A]/10 to-transparent">
              <CardTitle className="text-white/90 font-heading">
                Fuel Cost Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                {/* Vehicle 1 Costs */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">
                    {calculatorState.vehicle1.fromDb ? 
                      `${calculatorState.vehicle1.fromDb.year} ${calculatorState.vehicle1.fromDb.make} ${calculatorState.vehicle1.fromDb.model}` :
                      calculatorState.vehicle1.manual?.name}
                  </h3>
                  <div className="bg-gray-700/50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Weekly Fuel Cost:</span>
                      <span className="text-green-400">${costs.vehicle1.weekly.toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Monthly Fuel Cost:</span>
                      <span className="text-green-400">${costs.vehicle1.monthly.toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Annual Fuel Cost:</span>
                      <span className="text-green-400">${costs.vehicle1.annual.toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">3-Year Fuel Cost:</span>
                      <span className="text-green-400">${costs.vehicle1.threeYear.toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">5-Year Fuel Cost:</span>
                      <span className="text-green-400">${costs.vehicle1.fiveYear.toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">10-Year Fuel Cost:</span>
                      <span className="text-green-400">${costs.vehicle1.tenYear.toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
                    </div>
                  </div>
                </div>

                {/* Vehicle 2 Costs */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">
                    {calculatorState.vehicle2.fromDb ? 
                      `${calculatorState.vehicle2.fromDb.year} ${calculatorState.vehicle2.fromDb.make} ${calculatorState.vehicle2.fromDb.model}` :
                      calculatorState.vehicle2.manual?.name}
                  </h3>
                  <div className="bg-gray-700/50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Weekly Fuel Cost:</span>
                      <span className="text-green-400">${costs.vehicle2.weekly.toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Monthly Fuel Cost:</span>
                      <span className="text-green-400">${costs.vehicle2.monthly.toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Annual Fuel Cost:</span>
                      <span className="text-green-400">${costs.vehicle2.annual.toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">3-Year Fuel Cost:</span>
                      <span className="text-green-400">${costs.vehicle2.threeYear.toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">5-Year Fuel Cost:</span>
                      <span className="text-green-400">${costs.vehicle2.fiveYear.toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">10-Year Fuel Cost:</span>
                      <span className="text-green-400">${costs.vehicle2.tenYear.toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Savings Summary */}
              <div className="mt-8 p-6 bg-blue-900/30 rounded-lg border border-blue-800">
                <h3 className="text-xl font-semibold text-white mb-4">Potential Fuel Savings</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Weekly Savings:</span>
                      <span className={costs.savings.weekly >= 0 ? "text-green-400" : "text-red-400"}>
                        ${Math.abs(costs.savings.weekly).toLocaleString(undefined, {maximumFractionDigits: 2})}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Monthly Savings:</span>
                      <span className={costs.savings.monthly >= 0 ? "text-green-400" : "text-red-400"}>
                        ${Math.abs(costs.savings.monthly).toLocaleString(undefined, {maximumFractionDigits: 2})}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Annual Savings:</span>
                      <span className={costs.savings.annual >= 0 ? "text-green-400" : "text-red-400"}>
                        ${Math.abs(costs.savings.annual).toLocaleString(undefined, {maximumFractionDigits: 2})}
                      </span>
                    </div>
                  </div>
                  
                  {/* Right Column */}
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-300">3-Year Savings:</span>
                      <span className={costs.savings.threeYear >= 0 ? "text-green-400" : "text-red-400"}>
                        ${Math.abs(costs.savings.threeYear).toLocaleString(undefined, {maximumFractionDigits: 2})}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">5-Year Savings:</span>
                      <span className={costs.savings.fiveYear >= 0 ? "text-green-400" : "text-red-400"}>
                        ${Math.abs(costs.savings.fiveYear).toLocaleString(undefined, {maximumFractionDigits: 2})}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">10-Year Savings:</span>
                      <span className={costs.savings.tenYear >= 0 ? "text-green-400" : "text-red-400"}>
                        ${Math.abs(costs.savings.tenYear).toLocaleString(undefined, {maximumFractionDigits: 2})}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 text-sm text-blue-100">
                  {costs.savings.annual === 0 ? (
                    <p>
                      Both vehicles have identical fuel costs.
                    </p>
                  ) : costs.savings.annual > 0 ? (
                      <p>
                        {calculatorState.vehicle1.fromDb ? 
                          `${calculatorState.vehicle1.fromDb.year} ${calculatorState.vehicle1.fromDb.make} ${calculatorState.vehicle1.fromDb.model}` :
                          calculatorState.vehicle1.manual?.name || 'Vehicle 1'} saves you money on fuel costs compared to {
                          calculatorState.vehicle2.fromDb ? 
                          `${calculatorState.vehicle2.fromDb.year} ${calculatorState.vehicle2.fromDb.make} ${calculatorState.vehicle2.fromDb.model}` :
                          calculatorState.vehicle2.manual?.name || 'Vehicle 2'}.
                      </p>
                    ) : (
                      <p>
                        {calculatorState.vehicle2.fromDb ? 
                          `${calculatorState.vehicle2.fromDb.year} ${calculatorState.vehicle2.fromDb.make} ${calculatorState.vehicle2.fromDb.model}` :
                          calculatorState.vehicle2.manual?.name || 'Vehicle 2'} saves you money on fuel costs compared to {
                          calculatorState.vehicle1.fromDb ? 
                          `${calculatorState.vehicle1.fromDb.year} ${calculatorState.vehicle1.fromDb.make} ${calculatorState.vehicle1.fromDb.model}` :
                          calculatorState.vehicle1.manual?.name || 'Vehicle 1'}.
                      </p>
                    )}
                  </div>
                </div>

              {/* Cost Comparison Graph */}
              <div className="mt-8 bg-gray-900/50 p-6 rounded-lg border border-gray-700">
                <h3 className="text-xl font-semibold text-white mb-6">Cost Comparison Over Time</h3>
                
                {/* Bar Graph */}
                <div className="space-y-4 mb-12">
                  <h4 className="text-lg font-medium text-blue-400 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="12" width="6" height="8"/><rect x="8" y="8" width="6" height="12"/><rect x="14" y="4" width="6" height="16"/></svg>
                    Bar Graph Visualization
                  </h4>
                  <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={prepareChartData({ vehicle1: costs.vehicle1, vehicle2: costs.vehicle2 })}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis 
                          dataKey="period" 
                          stroke="#9CA3AF"
                          tick={{ fill: '#9CA3AF' }}
                        />
                        <YAxis 
                          stroke="#9CA3AF"
                          tick={{ fill: '#9CA3AF' }}
                          tickFormatter={(value) => `$${value.toLocaleString()}`}
                        />
                        <RechartsTooltip
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length > 1) {
                              const value1 = (payload[0] as any).value;
                              const value2 = (payload[1] as any).value;
                              const vehicle1Name = calculatorState.vehicle1.fromDb ? 
                                `${calculatorState.vehicle1.fromDb.year} ${calculatorState.vehicle1.fromDb.make} ${calculatorState.vehicle1.fromDb.model}` :
                                calculatorState.vehicle1.manual?.name || 'Vehicle 1';
                              const vehicle2Name = calculatorState.vehicle2.fromDb ? 
                                `${calculatorState.vehicle2.fromDb.year} ${calculatorState.vehicle2.fromDb.make} ${calculatorState.vehicle2.fromDb.model}` :
                                calculatorState.vehicle2.manual?.name || 'Vehicle 2';
                              return (
                                <div className="bg-gray-800 border border-gray-700 p-3 rounded-lg shadow-lg">
                                  <p className="text-gray-300 mb-2">{label}</p>
                                  <p className="text-blue-400">
                                    {vehicle1Name}: ${value1.toLocaleString(undefined, {maximumFractionDigits: 2})}
                                  </p>
                                  <p className="text-green-400">
                                    {vehicle2Name}: ${value2.toLocaleString(undefined, {maximumFractionDigits: 2})}
                                  </p>
                                </div>
                              )
                            }
                            return null
                          }}
                        />
                        <Legend 
                          wrapperStyle={{ 
                            paddingTop: '20px',
                            color: '#9CA3AF'
                          }}
                        />
                        <Bar
                          dataKey="vehicle1"
                          name={calculatorState.vehicle1.fromDb ? 
                            `${calculatorState.vehicle1.fromDb.year} ${calculatorState.vehicle1.fromDb.make} ${calculatorState.vehicle1.fromDb.model}` :
                            calculatorState.vehicle1.manual?.name || 'Vehicle 1'}
                          fill="#3B82F6"
                        />
                        <Bar
                          dataKey="vehicle2"
                          name={calculatorState.vehicle2.fromDb ? 
                            `${calculatorState.vehicle2.fromDb.year} ${calculatorState.vehicle2.fromDb.make} ${calculatorState.vehicle2.fromDb.model}` :
                            calculatorState.vehicle2.manual?.name || 'Vehicle 2'}
                          fill="#10B981"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Line Graph */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-blue-400 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
                    Line Graph Visualization
                  </h4>
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={prepareChartData({ vehicle1: costs.vehicle1, vehicle2: costs.vehicle2 })}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="period" 
                        stroke="#9CA3AF"
                        tick={{ fill: '#9CA3AF' }}
                      />
                      <YAxis 
                        stroke="#9CA3AF"
                        tick={{ fill: '#9CA3AF' }}
                        tickFormatter={(value) => `$${value.toLocaleString()}`}
                      />
                      <RechartsTooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length > 1) {
                            const value1 = (payload[0] as any).value;
                            const value2 = (payload[1] as any).value;
                              const vehicle1Name = calculatorState.vehicle1.fromDb ? 
                                `${calculatorState.vehicle1.fromDb.year} ${calculatorState.vehicle1.fromDb.make} ${calculatorState.vehicle1.fromDb.model}` :
                                calculatorState.vehicle1.manual?.name || 'Vehicle 1';
                              const vehicle2Name = calculatorState.vehicle2.fromDb ? 
                                `${calculatorState.vehicle2.fromDb.year} ${calculatorState.vehicle2.fromDb.make} ${calculatorState.vehicle2.fromDb.model}` :
                                calculatorState.vehicle2.manual?.name || 'Vehicle 2';
                            return (
                              <div className="bg-gray-800 border border-gray-700 p-3 rounded-lg shadow-lg">
                                <p className="text-gray-300 mb-2">{label}</p>
                                <p className="text-blue-400">
                                    {vehicle1Name}: ${value1.toLocaleString(undefined, {maximumFractionDigits: 2})}
                                </p>
                                <p className="text-green-400">
                                    {vehicle2Name}: ${value2.toLocaleString(undefined, {maximumFractionDigits: 2})}
                                </p>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                      <Legend 
                        wrapperStyle={{ 
                          paddingTop: '20px',
                          color: '#9CA3AF'
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="vehicle1"
                        name={calculatorState.vehicle1.fromDb ? 
                          `${calculatorState.vehicle1.fromDb.year} ${calculatorState.vehicle1.fromDb.make} ${calculatorState.vehicle1.fromDb.model}` :
                          calculatorState.vehicle1.manual?.name || 'Vehicle 1'}
                        stroke="#3B82F6"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="vehicle2"
                        name={calculatorState.vehicle2.fromDb ? 
                          `${calculatorState.vehicle2.fromDb.year} ${calculatorState.vehicle2.fromDb.make} ${calculatorState.vehicle2.fromDb.model}` :
                          calculatorState.vehicle2.manual?.name || 'Vehicle 2'}
                        stroke="#10B981"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>


              </div>
            </CardContent>
          </Card>
        )}

        {/* Disclaimer */}
        <div className="mt-8 p-4 bg-gray-900/30 rounded-lg border border-gray-700/50">
          <p className="text-xs italic text-gray-400 leading-relaxed">
            This Fuel Savings Calculator tool is provided for informational and educational purposes only. The MPG data used is sourced from the U.S. Environmental Protection Agency (EPA), an official government resource, and while efforts are made to ensure accuracy, discrepancies or updates may occur. Calculations are based on standard assumptions and estimates, which may not reflect individual circumstances or real-world conditions. Users are responsible for verifying results with their own data and should consult additional resources or/and professionals for critical decisions. This tool is provided "as is" without warranties of any kind, and the developers disclaim any liability for decisions or actions taken based on its output. The tool may be updated or modified without notice, affecting its functionality or results. By using this tool, you acknowledge and agree to these terms.
          </p>
        </div>
      </div>
    </div>
  )
} 