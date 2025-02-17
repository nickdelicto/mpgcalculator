'use client'

import React from 'react'
import { JSX } from 'react'
import { useState, useEffect } from 'react'
import { Vehicle, Make } from '../types/vehicle'
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
  ResponsiveContainer
} from 'recharts'

// Types for our calculator
interface ManualVehicle {
  mpg: number
  isElectric: boolean
  name: string
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
  GASOLINE: 3.15,
  ELECTRICITY: 0.17,
  NATURAL_GAS: 2.91, // per GGE (Gasoline Gallon Equivalent)
  HYDROGEN: 25.00, // per kg
  DIESEL: 3.64, // per gallon
  E85: 2.74, // per gallon
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
  if (normalized.includes('electricity')) return 'ELECTRICITY'
  if (normalized.includes('natural gas')) return 'NATURAL_GAS'
  if (normalized.includes('hydrogen')) return 'HYDROGEN'
  if (normalized.includes('diesel')) return 'DIESEL'
  if (normalized.includes('e85')) return 'E85'
  return 'GASOLINE'
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
      fuelCost: FUEL_DEFAULTS.GASOLINE,
      isManualInput: false,
      usageSplit: DEFAULT_FUEL_SPLIT
    },
    vehicle2: {
      fromDb: null,
      manual: null,
      fuelCost: FUEL_DEFAULTS.GASOLINE,
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
      <div className="space-y-4 bg-gray-900/50 p-4 rounded-lg border border-gray-700">
        <div className="flex items-center justify-between">
          <Label className="text-gray-300 font-semibold">Fuel Usage Distribution</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent>
                <div className="space-y-2 max-w-xs">
                  <p className="text-sm">Adjust how much you use each fuel type. This affects the overall fuel cost calculation.</p>
                  <p className="text-xs text-blue-400">Default split is {DEFAULT_FUEL_SPLIT}% primary fuel.</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="space-y-4">
          {/* Primary Fuel Info */}
          <div className="bg-gray-800/50 p-3 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-blue-400 font-medium">{vehicle.fromDb.fuelType1}</span>
              <span className="text-sm text-gray-400">{vehicle.usageSplit || DEFAULT_FUEL_SPLIT}%</span>
            </div>
            <div className="text-sm text-gray-400">
              Combined: {primaryMPG} {vehicle.fromDb.fuelType1.includes('Electricity') ? 'MPGe' : 'MPG'}
            </div>
          </div>

          {/* Slider */}
          <div className="py-2">
            <Slider
              value={[vehicle.usageSplit || DEFAULT_FUEL_SPLIT]}
              onValueChange={(value) => handleSplitUpdate(vehicleNumber, value)}
              max={100}
              step={5}
              className="cursor-pointer touch-none"
            />
          </div>

          {/* Secondary Fuel Info */}
          <div className="bg-gray-800/50 p-3 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-green-400 font-medium">{vehicle.fromDb.fuelType2}</span>
              <span className="text-sm text-gray-400">{100 - (vehicle.usageSplit || DEFAULT_FUEL_SPLIT)}%</span>
            </div>
            {secondaryMPG && (
              <div className="text-sm text-gray-400">
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
    const vehicle = calculatorState[`vehicle${vehicleNumber}` as keyof Pick<CalculatorState, 'vehicle1' | 'vehicle2'>].fromDb

    return (
      <div className="space-y-4">
        {/* Show selected vehicle details if exists */}
        {vehicle && (
          <div className="bg-gray-900/50 rounded-lg border border-gray-700 overflow-hidden mb-4">
            <div className="bg-gradient-to-r from-blue-800 to-blue-900 p-3">
              <div className="flex items-center gap-3">
                <CarFront className="h-6 w-6 text-white" />
                <h4 className="text-lg font-semibold text-white">
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </h4>
              </div>
            </div>
            
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
          </div>
        )}

        <FuelSavingsVehicleLookup 
          onVehicleSelect={onVehicleSelect}
          makes={makes}
          customResultDisplay={(vehicle: Vehicle) => (
            <div className="bg-gray-900/50 rounded-lg border border-gray-700 overflow-hidden">
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
              <div className="p-3 bg-gray-800/50 flex justify-end">
                <Button 
                  onClick={() => onVehicleSelect(vehicle)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Select
                </Button>
              </div>
            </div>
          )}
        />
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
        fromDb: null,
        manual: null,
        fuelCost: FUEL_DEFAULTS.GASOLINE,
        isManualInput: checked,
        cityHighwaySplit: 50,
        useCustomSplit: false
      }
    }))
  }

  // Handler for updating manual vehicle details
  const handleManualVehicleUpdate = (
    vehicleNumber: 1 | 2,
    field: keyof ManualVehicle,
    value: string | number | boolean
  ) => {
    setCalculatorState(prev => ({
      ...prev,
      [`vehicle${vehicleNumber}`]: {
        ...prev[`vehicle${vehicleNumber}` as keyof Pick<CalculatorState, 'vehicle1' | 'vehicle2'>],
        manual: {
          ...prev[`vehicle${vehicleNumber}` as keyof Pick<CalculatorState, 'vehicle1' | 'vehicle2'>].manual,
          [field]: value
        },
        cityHighwaySplit: 50,
        useCustomSplit: false
      }
    }))
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
    setCalculatorState(prev => ({
      ...prev,
      [`vehicle${vehicleNumber}`]: {
        ...prev[`vehicle${vehicleNumber}` as keyof Pick<CalculatorState, 'vehicle1' | 'vehicle2'>],
        usageSplit: value[0]
      }
    }))
  }

  // Add handler for city/highway split toggle
  const handleCustomSplitToggle = (checked: boolean) => {
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

  // Helper function to render city/highway split section
  const renderCityHighwaySplit = () => {
    return (
      <div className="space-y-4 bg-gray-900/50 p-4 rounded-lg border border-gray-700">
        <div className="flex items-center justify-between">
          <Label className="text-gray-300 font-semibold">Specify Your City vs Highway Driving?</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent>
                <div className="space-y-2 max-w-xs">
                  <p className="text-sm">Adjust the percentage of city vs highway driving to get more accurate fuel costs.</p>
                  <p className="text-xs text-blue-400">This split applies to both vehicles being compared.</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="custom-split" className="text-white">Toggle to Adjust Driving Percentage</Label>
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

  // Calculate fuel costs for a vehicle
  const calculateVehicleCosts = (
    vehicle: VehicleSelection,
    mileage: number,
    cityPercentage: number,
    useCustomSplit: boolean
  ): FuelCosts | null => {
    let annualCost = 0

    if (vehicle.fromDb) {
      if (vehicle.fromDb.fuelType2) {
        // For dual-fuel vehicles
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
        // For single-fuel vehicles
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
      // For manually entered vehicles
      annualCost = calculateFuelCost({
        miles: mileage,
        mpg: vehicle.manual.mpg,
        fuelPrice: vehicle.fuelCost,
        fuelType: vehicle.manual.isElectric ? 'electricity' : 'gasoline'
      })
    }

    if (annualCost === 0) return null

    return {
      weekly: annualCost / 52,
      monthly: annualCost / 12,
      annual: annualCost,
      threeYear: annualCost * 3,
      fiveYear: annualCost * 5,
      tenYear: annualCost * 10
    }
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

  // Helper function to render fuel cost input with tooltip
  const renderFuelCostInput = (
    vehicleNumber: 1 | 2,
    fuelType: string,
    isSecondaryFuel: boolean = false
  ) => {
    const vehicle = calculatorState[`vehicle${vehicleNumber}` as keyof Pick<CalculatorState, 'vehicle1' | 'vehicle2'>]
    const fuelInfo = getFuelTypeInfo(fuelType)
    const fuelCost = isSecondaryFuel ? vehicle.fuelCost2 : vehicle.fuelCost

    return (
      <div className="space-y-2 bg-gray-800/50 p-3 rounded-lg border border-gray-700/50
                      transition-all duration-300 hover:border-blue-500/20">
        <div className="flex items-center justify-between">
          <Label htmlFor={`v${vehicleNumber}-fuel-cost${isSecondaryFuel ? '-2' : ''}`} 
                 className="text-white/90 flex items-center gap-2">
            <Fuel className="h-4 w-4 text-blue-400" />
            <span>{fuelInfo.label}</span>
            <span className="text-gray-400 text-sm">({fuelInfo.unit})</span>
          </Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-gray-400 hover:text-blue-400 transition-colors" />
              </TooltipTrigger>
              <TooltipContent className="bg-gray-800 border-gray-700">
                <div className="space-y-2 max-w-xs">
                  <p className="text-sm text-gray-300">{fuelInfo.explanation}</p>
                  <p className="text-xs text-blue-400">
                    Default: ${FUEL_DEFAULTS[getFuelTypeCategory(fuelType)]}/{fuelInfo.unit.split('/')[1]}
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
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

  // Add this helper function before the return statement
  const prepareChartData = (costs: { vehicle1: FuelCosts, vehicle2: FuelCosts }) => {
    return [
      {
        period: 'Weekly',
        vehicle1: costs.vehicle1.weekly,
        vehicle2: costs.vehicle2.weekly
      },
      {
        period: 'Monthly',
        vehicle1: costs.vehicle1.monthly,
        vehicle2: costs.vehicle2.monthly
      },
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

  return (
    <div className="space-y-8 relative min-h-screen">
      {/* Sophisticated background with patterns */}
      <div className="absolute inset-0 bg-[#111827] bg-gradient-to-br from-gray-900/50 to-gray-800/50">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02]" />
      </div>
      
      {/* Decorative orbs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-[#1E3A8A] rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob" />
      <div className="absolute top-0 -right-4 w-72 h-72 bg-[#047857] rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-[#D97706] rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-4000" />
      
      {/* Content wrapper with glass effect */}
      <div className="relative z-10 space-y-8">
        {/* Vehicle Selection Section */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Vehicle 1 Selection */}
          <Card className="backdrop-blur-md bg-purple-400/20 border border-white/10
                          shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]
                          hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.5)]
                          transition-all duration-500">
            <CardHeader className="border-b border-white/5 bg-gradient-to-r 
                                  from-[#1E3A8A]/10 to-transparent">
              <CardTitle className="text-white/90 font-heading">Vehicle 1</CardTitle>
            </CardHeader>
            <CardContent className="relative">
              {/* Glass card inner glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent" />
              
              {/* Rest of the Vehicle 1 content */}
              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="manual-input-1" className="text-white">Toggle for Manual Input</Label>
                  <Switch
                    id="manual-input-1"
                    checked={calculatorState.vehicle1.isManualInput}
                    onCheckedChange={(checked) => handleManualToggle(checked, 1)}
                  />
                </div>
                
                {calculatorState.vehicle1.isManualInput ? (
                  <div className="space-y-4 bg-gray-900/40 p-4 rounded-lg border border-gray-700/50">
                    <div className="space-y-3">
                      <div className="group">
                        <Label htmlFor="vehicle1-name" className="text-white/90 inline-flex items-center space-x-2">
                          <CarFront className="h-4 w-4 text-blue-400" />
                          <span>Vehicle Name</span>
                        </Label>
                        <Input
                          id="vehicle1-name"
                          value={calculatorState.vehicle1.manual?.name || ''}
                          onChange={(e) => handleManualVehicleUpdate(1, 'name', e.target.value)}
                          className="mt-1.5 bg-gray-800/50 border-gray-600/50 text-white/90 
                                    focus:border-blue-500/50 focus:ring-blue-500/20 
                                    transition-all duration-300"
                          placeholder="Enter vehicle name"
                        />
                      </div>
                      <div className="group">
                        <Label htmlFor="vehicle1-mpg" className="text-white/90 inline-flex items-center space-x-2">
                          <Gauge className="h-4 w-4 text-blue-400" />
                          <span>MPG/MPGe</span>
                        </Label>
                        <Input
                          id="vehicle1-mpg"
                          type="number"
                          value={calculatorState.vehicle1.manual?.mpg || ''}
                          onChange={(e) => handleManualVehicleUpdate(1, 'mpg', e.target.value)}
                          className="mt-1.5 bg-gray-800/50 border-gray-600/50 text-white/90 
                                    focus:border-blue-500/50 focus:ring-blue-500/20 
                                    transition-all duration-300"
                          placeholder="Enter MPG/MPGe"
                        />
                      </div>
                      <div className="flex items-center justify-between bg-gray-800/50 p-3 rounded-lg
                                      border border-gray-700/50">
                        <Label htmlFor="vehicle1-iselectric" 
                               className="text-white/90 inline-flex items-center space-x-2">
                          <Zap className="h-4 w-4 text-yellow-400" />
                          <span>Electric Vehicle</span>
                        </Label>
                        <Switch
                          id="vehicle1-iselectric"
                          checked={calculatorState.vehicle1.manual?.isElectric || false}
                          onCheckedChange={(checked) => handleManualVehicleUpdate(1, 'isElectric', checked)}
                          className="data-[state=checked]:bg-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <FuelComparisonVehicleLookup
                    onVehicleSelect={(vehicle) => handleVehicleSelect(vehicle, 1)}
                    vehicleNumber={1}
                  />
                )}

                {/* Fuel Cost Inputs */}
                {(calculatorState.vehicle1.fromDb || calculatorState.vehicle1.manual) && (
                  <div className="mt-6 space-y-4 bg-red-900/20 p-4 rounded-lg border border-gray-700/50">
                    <h3 className="text-lg font-semibold text-white/90 mb-4 flex items-center gap-2">
                      <Fuel className="h-5 w-5 text-blue-400" />
                      Fuel Costs
                    </h3>
                    <div className="space-y-4">
                      {renderFuelCostInput(1, calculatorState.vehicle1.fromDb?.fuelType1 || 'Gasoline')}
                      {calculatorState.vehicle1.fromDb?.fuelType2 && (
                        <>
                          <div className="border-t border-gray-700/50 my-4" />
                          {renderFuelCostInput(1, calculatorState.vehicle1.fromDb.fuelType2, true)}
                          {renderFuelSplitSlider(1)}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Vehicle 2 Selection - Mirror the same styling */}
          <Card className="backdrop-blur-md bg-purple-400/20 border border-white/10
                          shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]
                          hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.5)]
                          transition-all duration-500">
            <CardHeader className="border-b border-white/5 bg-gradient-to-r 
                                  from-[#1E3A8A]/10 to-transparent">
              <CardTitle className="text-white/90 font-heading">Vehicle 2</CardTitle>
            </CardHeader>
            <CardContent className="relative">
              {/* Glass card inner glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent" />
              
              {/* Rest of the Vehicle 2 content */}
              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="manual-input-2" className="text-white">Toggle for Manual Input</Label>
                  <Switch
                    id="manual-input-2"
                    checked={calculatorState.vehicle2.isManualInput}
                    onCheckedChange={(checked) => handleManualToggle(checked, 2)}
                  />
                </div>
                
                {calculatorState.vehicle2.isManualInput ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="vehicle2-name" className="text-white">Vehicle Name</Label>
                      <Input
                        id="vehicle2-name"
                        value={calculatorState.vehicle2.manual?.name || ''}
                        onChange={(e) => handleManualVehicleUpdate(2, 'name', e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="Enter vehicle name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="vehicle2-mpg" className="text-white">MPG/MPGe</Label>
                      <Input
                        id="vehicle2-mpg"
                        type="number"
                        value={calculatorState.vehicle2.manual?.mpg || ''}
                        onChange={(e) => handleManualVehicleUpdate(2, 'mpg', e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="Enter MPG/MPGe"
                      />
                    </div>
                    <div>
                      <Label htmlFor="vehicle2-iselectric" className="text-white">Electric Vehicle</Label>
                      <Switch
                        id="vehicle2-iselectric"
                        checked={calculatorState.vehicle2.manual?.isElectric || false}
                        onCheckedChange={(checked) => handleManualVehicleUpdate(2, 'isElectric', checked)}
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
                {(calculatorState.vehicle2.fromDb || calculatorState.vehicle2.manual) && (
                  <div className="mt-6 space-y-4 bg-red-900/20 p-4 rounded-lg border border-gray-700/50">
                    <h3 className="text-lg font-semibold text-white/90 mb-4 flex items-center gap-2">
                      <Fuel className="h-5 w-5 text-blue-400" />
                      Fuel Costs
                    </h3>
                    <div className="space-y-4">
                      {renderFuelCostInput(2, calculatorState.vehicle2.fromDb?.fuelType1 || 'Gasoline')}
                      {calculatorState.vehicle2.fromDb?.fuelType2 && (
                        <>
                          <div className="border-t border-gray-700/50 my-4" />
                          {renderFuelCostInput(2, calculatorState.vehicle2.fromDb.fuelType2, true)}
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
        <Card className="backdrop-blur-md bg-gray-700/30 border border-white/10
                        shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]">
          <CardHeader className="border-b border-white/5 bg-gradient-to-r 
                                from-[#1E3A8A]/10 to-transparent">
            <CardTitle className="text-white/90 font-heading flex items-center gap-2">
              <Gauge className="h-5 w-5 text-[#047857]" />
              Your Driving Pattern
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Mileage Input */}
              <div className="space-y-4">
                {/* Mileage Input Type Selection */}
                <div className="grid grid-cols-4 gap-2 bg-yellow-500 p-4 rounded-lg border border-gray-700/50">
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
                      className="capitalize"
                    >
                      {period}
                    </Button>
                  ))}
                </div>

                {/* Mileage Input */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="mileage-input" className="text-white capitalize">
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
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder={`Enter ${calculatorState.mileageInputType} mileage`}
                      />
                      <span className="text-gray-400 whitespace-nowrap">
                        miles/{getPeriodSuffix(calculatorState.mileageInputType)}
                      </span>
                    </div>
                  </div>

                  {/* Other Period Displays */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(['annual', 'monthly', 'weekly', 'daily'] as const)
                      .filter(period => period !== calculatorState.mileageInputType)
                      .map(period => (
                        <div key={period} className="bg-gray-700/50 p-3 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400 capitalize">{period}:</span>
                            <span className="text-white">
                              {convertMileage(calculatorState.annualMileage, 'annual', period).toLocaleString()} 
                              <span className="text-gray-400 text-sm ml-1">
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

              {/* Cost Comparison Graph */}
              <div className="mt-8 bg-gray-900/50 p-6 rounded-lg border border-gray-700">
                <h3 className="text-xl font-semibold text-white mb-6">Cost Comparison Over Time</h3>
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
                            return (
                              <div className="bg-gray-800 border border-gray-700 p-3 rounded-lg shadow-lg">
                                <p className="text-gray-300 mb-2">{label}</p>
                                <p className="text-blue-400">
                                  Vehicle 1: ${value1.toLocaleString(undefined, {maximumFractionDigits: 2})}
                                </p>
                                <p className="text-green-400">
                                  Vehicle 2: ${value2.toLocaleString(undefined, {maximumFractionDigits: 2})}
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

              {/* Savings Summary */}
              <div className="mt-8 p-6 bg-blue-900/30 rounded-lg border border-blue-800">
                <h3 className="text-xl font-semibold text-white mb-4">Potential Savings</h3>
                <div className="grid md:grid-cols-3 gap-6">
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
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Annual Savings:</span>
                      <span className={costs.savings.annual >= 0 ? "text-green-400" : "text-red-400"}>
                        ${Math.abs(costs.savings.annual).toLocaleString(undefined, {maximumFractionDigits: 2})}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">3-Year Savings:</span>
                      <span className={costs.savings.threeYear >= 0 ? "text-green-400" : "text-red-400"}>
                        ${Math.abs(costs.savings.threeYear).toLocaleString(undefined, {maximumFractionDigits: 2})}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3">
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
                  {costs.savings.annual >= 0 ? (
                    <p>Vehicle 2 could save you money on fuel costs compared to Vehicle 1.</p>
                  ) : (
                    <p>Vehicle 1 could save you money on fuel costs compared to Vehicle 2.</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 