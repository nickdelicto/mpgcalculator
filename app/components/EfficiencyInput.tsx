'use client'

import React, { useState, useEffect } from 'react'
import { FuelTypeDefinition, FuelEfficiency, AVAILABLE_FUEL_TYPES } from '../types/fuel'
import { Label } from "../../components/ui/label"
import { Input } from "../../components/ui/input"
import { Switch } from "../../components/ui/switch"
import { Info, Gauge, Fuel } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../components/ui/tooltip"
import {
  getEfficiencyLabel,
  validateEfficiency,
  calculateCombinedEfficiency,
  formatEfficiency,
  getEfficiencyStep,
  getEfficiencyBounds,
  EFFICIENCY_TOOLTIPS,
  EfficiencyUnit,
} from '../utils/efficiency'

interface EfficiencyInputProps {
  fuelType: FuelTypeDefinition
  efficiency: FuelEfficiency
  onChange: (efficiency: FuelEfficiency) => void
  className?: string
  allowSecondaryFuel?: boolean
  primaryFuelType?: string
  onSecondaryFuelSelect?: (fuelType: string) => void
  secondaryFuelType?: string
  secondaryEfficiency?: FuelEfficiency
  onSecondaryEfficiencyChange?: (efficiency: FuelEfficiency) => void
  fuelSplit?: number
  onFuelSplitChange?: (split: number) => void
}

export default function EfficiencyInput({
  fuelType,
  efficiency,
  onChange,
  className = '',
  allowSecondaryFuel = false,
  primaryFuelType,
  onSecondaryFuelSelect,
  secondaryFuelType,
  secondaryEfficiency,
  onSecondaryEfficiencyChange,
  fuelSplit = 50,
  onFuelSplitChange
}: EfficiencyInputProps) {
  // Add state for secondary fuel toggle
  const [showSecondaryFuel, setShowSecondaryFuel] = useState(Boolean(secondaryFuelType))
  
  // Local state for validation messages and EV format
  const [validationMessage, setValidationMessage] = useState<string>('')
  const [evFormat, setEvFormat] = useState<'mpge' | 'kwh'>('mpge')
  
  // Get input configuration based on fuel type
  const step = getEfficiencyStep(fuelType)
  const bounds = getEfficiencyBounds(fuelType)
  const label = getEfficiencyLabel(fuelType)

  // Convert between MPGe and kWh/100mi
  const mpgeToKwh = (mpge: number) => (33.705 / mpge) * 100
  const kwhToMpge = (kwh: number) => (33.705 / kwh) * 100

  // Add local state for direct input values
  const [localKwhValue, setLocalKwhValue] = useState<string>('')
  const [localMpgeValue, setLocalMpgeValue] = useState<string>('')

  // Add local state for city/highway values
  const [localCityValue, setLocalCityValue] = useState<string>('')
  const [localHighwayValue, setLocalHighwayValue] = useState<string>('')

  // Modify the format change handler
  const handleFormatChange = (format: 'mpge' | 'kwh') => {
    setEvFormat(format)
    
    // Update local values based on the new format
    if (efficiency.usesCityHighway) {
      if (efficiency.city) {
        setLocalCityValue(format === 'mpge' 
          ? efficiency.city.toString()
          : mpgeToKwh(efficiency.city).toFixed(1))
      }
      if (efficiency.highway) {
        setLocalHighwayValue(format === 'mpge'
          ? efficiency.highway.toString()
          : mpgeToKwh(efficiency.highway).toFixed(1))
      }
    } else {
      if (efficiency.combined) {
        if (format === 'mpge') {
          setLocalMpgeValue(efficiency.combined.toString())
          setLocalKwhValue('')
        } else {
          setLocalKwhValue(mpgeToKwh(efficiency.combined).toFixed(1))
          setLocalMpgeValue('')
        }
      }
    }
    
    // Reset validation message
    setValidationMessage('')
  }

  // Handle efficiency input changes
  const handleEfficiencyChange = (value: string, format: 'mpge' | 'kwh' = 'mpge') => {
    // Store the direct input value
    if (format === 'mpge') {
      setLocalMpgeValue(value)
      setLocalKwhValue('')
    } else {
      setLocalKwhValue(value)
      setLocalMpgeValue('')
    }

    // Allow empty input
    if (value === '') {
      onChange({
        ...efficiency,
        combined: 0,
        kwhPer100mi: 0,
        usesCityHighway: false
      })
      setValidationMessage('')
      return
    }

    // Allow decimal point and numbers
    if (!/^\d*\.?\d*$/.test(value)) return

    // Only proceed if it's a valid number
    const numValue = parseFloat(value)
    if (isNaN(numValue)) return

    if (fuelType.id === 'electricity') {
      // Calculate values based on which format is being edited
      const combinedValue = format === 'mpge' ? numValue : kwhToMpge(numValue)
      const kwhValue = format === 'mpge' ? mpgeToKwh(numValue) : numValue

      const validation = validateEfficiency(combinedValue, fuelType)
      setValidationMessage(validation.message || '')

      if (validation.isValid) {
        onChange({
          ...efficiency,
          combined: Math.round(combinedValue), // Round to whole number
          kwhPer100mi: kwhValue,
          usesCityHighway: false
        })
      }
    } else {
      // For non-electric vehicles, handle as before
      const validation = validateEfficiency(numValue, fuelType)
      setValidationMessage(validation.message || '')

      if (validation.isValid) {
        onChange({
          ...efficiency,
          combined: Math.round(numValue), // Round to whole number
          usesCityHighway: false
        })
      }
    }
  }

  // Add effect to handle format changes
  useEffect(() => {
    if (fuelType.id === 'electricity' && efficiency.combined > 0) {
      // Recalculate kWh value when switching formats
      const kwhValue = mpgeToKwh(efficiency.combined)
      onChange({
        ...efficiency,
        kwhPer100mi: kwhValue
      })
    }
  }, [evFormat])

  // Handle toggle between city/highway and combined modes
  const handleToggleChange = (checked: boolean) => {
    // Clear local values when switching modes
    setLocalCityValue('')
    setLocalHighwayValue('')
    setLocalMpgeValue('')
    setLocalKwhValue('')
    
    if (checked) {
      // Switching to city/highway mode - clear all values
      const newEfficiency: FuelEfficiency = {
        ...efficiency,
        city: undefined,
        highway: undefined,
        combined: 0, // Set to 0 when clearing
        kwhPer100mi: undefined,
        usesCityHighway: true
      }
      onChange(newEfficiency)
    } else {
      // Switching to combined mode - clear all values
      const newEfficiency: FuelEfficiency = {
        ...efficiency,
        city: undefined,
        highway: undefined,
        combined: 0, // Set to 0 when clearing
        kwhPer100mi: undefined,
        usesCityHighway: false
      }
      onChange(newEfficiency)
    }
  }

  // Handle city/highway efficiency inputs
  const handleCityHighwayChange = (type: 'city' | 'highway', value: string) => {
    // Update local state
    if (type === 'city') {
      setLocalCityValue(value)
    } else {
      setLocalHighwayValue(value)
    }

    // Allow empty input
    if (value === '') {
      const newEfficiency: FuelEfficiency = {
        ...efficiency,
        [type]: undefined,
        usesCityHighway: true,
        combined: 0, // Set to 0 when clearing
        kwhPer100mi: undefined
      }
      onChange(newEfficiency)
      return
    }

    // Allow decimal point and numbers
    if (!/^\d*\.?\d*$/.test(value)) return

    // Only proceed if it's a valid number
    const numValue = parseFloat(value)
    if (isNaN(numValue)) return

    if (fuelType.id === 'electricity') {
      // Convert input value based on selected format
      const efficiencyValue = evFormat === 'mpge' ? numValue : kwhToMpge(numValue)
      const validation = validateEfficiency(efficiencyValue, fuelType, type === 'highway')
      setValidationMessage(validation.message || '')

      if (validation.isValid) {
        const newEfficiency: FuelEfficiency = {
          ...efficiency,
          [type]: Math.round(efficiencyValue), // Round to whole number
          usesCityHighway: true,
          combined: 0, // Initialize to 0
          kwhPer100mi: undefined
        }

        // Calculate combined only if both city and highway are present
        if ((type === 'city' && efficiency.highway) || (type === 'highway' && efficiency.city)) {
          const cityVal = type === 'city' ? efficiencyValue : efficiency.city
          const highwayVal = type === 'highway' ? efficiencyValue : efficiency.highway
          if (cityVal && highwayVal) {
            // Calculate combined using 55/45 split and round to whole number
            newEfficiency.combined = Math.round(calculateCombinedEfficiency(cityVal, highwayVal))
            newEfficiency.kwhPer100mi = mpgeToKwh(newEfficiency.combined)
          }
        }

        onChange(newEfficiency)
      }
    } else {
      // For non-electric vehicles
      const validation = validateEfficiency(numValue, fuelType, type === 'highway')
      setValidationMessage(validation.message || '')

      if (validation.isValid) {
        const newEfficiency: FuelEfficiency = {
          ...efficiency,
          [type]: Math.round(numValue), // Round to whole number
          usesCityHighway: true,
          combined: 0 // Initialize to 0
        }

        // Calculate combined only if both city and highway are present
        if ((type === 'city' && efficiency.highway) || (type === 'highway' && efficiency.city)) {
          const cityVal = type === 'city' ? numValue : efficiency.city
          const highwayVal = type === 'highway' ? numValue : efficiency.highway
          if (cityVal && highwayVal) {
            // Calculate combined using 55/45 split and round to whole number
            newEfficiency.combined = Math.round(calculateCombinedEfficiency(cityVal, highwayVal))
          }
        }

        onChange(newEfficiency)
      }
    }
  }

  // Add helper function to format efficiency based on selected format
  const formatEfficiencyValue = (value: number | undefined, format: 'mpge' | 'kwh'): string => {
    if (!value) return ''
    return format === 'mpge' 
      ? value.toFixed(0)
      : mpgeToKwh(value).toFixed(1)
  }

  // Add helper to get unit label
  const getUnitLabel = (format: 'mpge' | 'kwh'): string => {
    return format === 'mpge' ? 'MPGe' : 'kWh/100mi'
  }

  // Add handler for secondary fuel type selection
  const handleSecondaryFuelSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onSecondaryFuelSelect?.(event.target.value)
  }

  // Add handler for fuel split changes
  const handleFuelSplitChange = (value: number) => {
    onFuelSplitChange?.(value)
  }

  // Add type definitions for fuel filtering
  const filterSecondaryFuels = (primaryFuelId: string | undefined): FuelTypeDefinition[] => {
    return AVAILABLE_FUEL_TYPES.filter((fuel: FuelTypeDefinition) => 
      fuel.id !== primaryFuelId  // Only exclude the primary fuel
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Input fields section with improved grouping */}
      <div className="space-y-6">
        {/* EV Format Selection - with modern glassmorphism styling */}
        {fuelType.id === 'electricity' && (
          <div className="backdrop-blur-md bg-indigo-600/10 border border-white/10 rounded-xl overflow-hidden shadow-lg">
            <div className="bg-indigo-500/20 px-4 py-3 border-b border-white/10">
              <Label className="text-black font-medium flex items-center gap-2">
                Input Format
              </Label>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-center space-x-8">
                <label className="relative flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="evFormat"
                    checked={evFormat === 'mpge'}
                    onChange={() => handleFormatChange('mpge')}
                    className="peer sr-only"
                  />
                  <div className="w-5 h-5 border-2 border-indigo-400 rounded-full flex items-center justify-center transition-all duration-200 peer-checked:border-indigo-400 peer-checked:bg-indigo-600/40">
                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 scale-0 transition-transform duration-200 peer-checked:scale-100"></div>
                  </div>
                  <span className="text-indigo-400 font-medium transition-colors duration-200 group-hover:text-indigo-400 peer-checked:text-indigo-400">MPGe</span>
                </label>
                <label className="relative flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="evFormat"
                    checked={evFormat === 'kwh'}
                    onChange={() => handleFormatChange('kwh')}
                    className="peer sr-only"
                  />
                  <div className="w-5 h-5 border-2 border-indigo-400 rounded-full flex items-center justify-center transition-all duration-200 peer-checked:border-indigo-400 peer-checked:bg-indigo-600/40">
                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 scale-0 transition-transform duration-200 peer-checked:scale-100"></div>
                  </div>
                  <span className="text-indigo-400 font-medium transition-colors duration-200 group-hover:text-indigo-400 peer-checked:text-indigo-400">kWh/100mi</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* City/Highway Toggle - with modern styling */}
        <div className="rounded-lg overflow-hidden border border-indigo-500/30">
          <div className="bg-indigo-900/90 px-4 py-3 border-b border-indigo-500/30">
            <div className="flex items-center justify-between">
              <Label htmlFor="city-highway-toggle" className="text-indigo-100 font-medium">
                Split City & Highway MPG?
              </Label>
              <Switch
                id="city-highway-toggle"
                checked={efficiency.usesCityHighway}
                onCheckedChange={handleToggleChange}
              />
            </div>
          </div>

          {/* Efficiency Inputs */}
          <div className="p-4 bg-indigo-500/20">
            {efficiency.usesCityHighway ? (
              // City and Highway inputs with modern layout
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="city-efficiency" className="text-black">
                    City {fuelType.id === 'electricity' ? getUnitLabel(evFormat) : fuelType.efficiencyUnit}
                  </Label>
                  <Input
                    id="city-efficiency"
                    type="text"
                    inputMode="decimal"
                    value={localCityValue || ''}
                    onChange={(e) => handleCityHighwayChange('city', e.target.value)}
                    className="bg-gray-200 border-indigo-500/30 text-black placeholder-indigo-300/50 focus:border-indigo-400 focus:ring-indigo-400/20"
                    placeholder={`Enter city ${fuelType.id === 'electricity' ? getUnitLabel(evFormat) : fuelType.efficiencyUnit}`}
                  />
                  {(efficiency.city ?? 0) > 0 && fuelType.id === 'electricity' && (
                    <div className="mt-2 text-xs text-indigo-800/80">
                      Equivalent to {formatEfficiencyValue(efficiency.city ?? 0, evFormat === 'mpge' ? 'kwh' : 'mpge')} {evFormat === 'mpge' ? 'kWh/100mi' : 'MPGe'}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="highway-efficiency" className="text-black">
                    Highway {fuelType.id === 'electricity' ? getUnitLabel(evFormat) : fuelType.efficiencyUnit}
                  </Label>
                  <Input
                    id="highway-efficiency"
                    type="text"
                    inputMode="decimal"
                    value={localHighwayValue || ''}
                    onChange={(e) => handleCityHighwayChange('highway', e.target.value)}
                    className="bg-gray-200 border-indigo-500/30 text-black placeholder-indigo-300/50 focus:border-indigo-400 focus:ring-indigo-400/20"
                    placeholder={`Enter highway ${fuelType.id === 'electricity' ? getUnitLabel(evFormat) : fuelType.efficiencyUnit}`}
                  />
                  {(efficiency.highway ?? 0) > 0 && fuelType.id === 'electricity' && (
                    <div className="mt-2 text-xs text-indigo-800/80">
                      Equivalent to {formatEfficiencyValue(efficiency.highway ?? 0, evFormat === 'mpge' ? 'kwh' : 'mpge')} {evFormat === 'mpge' ? 'kWh/100mi' : 'MPGe'}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Combined input with modern styling
              <div className="space-y-2">
                <Label htmlFor="combined-efficiency" className="text-black">
                  Combined {fuelType.id === 'electricity' ? getUnitLabel(evFormat) : fuelType.efficiencyUnit}
                </Label>
                <Input
                  id="combined-efficiency"
                  type="text"
                  inputMode="decimal"
                  value={fuelType.id === 'electricity' ? (evFormat === 'mpge' ? localMpgeValue : localKwhValue) : (efficiency.combined || '')}
                  onChange={(e) => handleEfficiencyChange(e.target.value, evFormat)}
                  className="bg-gray-200 border-indigo-500/30 text-black placeholder-indigo-300/50 focus:border-indigo-400 focus:ring-indigo-400/20"
                  placeholder={`Enter combined ${fuelType.id === 'electricity' ? getUnitLabel(evFormat) : fuelType.efficiencyUnit}`}
                />
                {efficiency.combined > 0 && (
                  <div className="mt-2 text-xs text-indigo-800/80">
                    Equivalent to {formatEfficiencyValue(efficiency.combined, evFormat === 'mpge' ? 'kwh' : 'mpge')} {evFormat === 'mpge' ? 'kWh/100mi' : 'MPGe'}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Secondary Fuel Section - with improved visual hierarchy */}
        {allowSecondaryFuel && (
          <div className="mt-8 space-y-4">
            {/* Secondary Fuel Toggle */}
            <div className="bg-emerald-500 rounded-lg overflow-hidden border border-gray-700/50">
              <div className="px-4 py-3 border-b border-gray-700/50">
                <div className="flex items-center justify-between">
                  <Label htmlFor="add-secondary-fuel" className="text-white font-bold flex items-center gap-2">
                    <span>Add Secondary Fuel Type</span>
                    <TooltipProvider delayDuration={0}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button type="button" className="focus:outline-none">
                            <Info className="h-4 w-4 text-gray-100" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="right" align="start" className="max-w-[200px] p-2 bg-gray-100 border border-gray-700">
                          <p className="text-xs text-gray-800">For hybrid, flex-fuel, or plug-in hybrid vehicles</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <Switch
                    id="add-secondary-fuel"
                    checked={showSecondaryFuel}
                    onCheckedChange={(checked) => {
                      setShowSecondaryFuel(checked)
                      if (checked && onSecondaryFuelSelect) {
                        onSecondaryFuelSelect('')
                      } else if (!checked && onSecondaryFuelSelect) {
                        onSecondaryFuelSelect('')
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Secondary Fuel Selection and Settings */}
            {showSecondaryFuel && (
              <div className="space-y-6">
                {/* Secondary Fuel Type Selector */}
                <div className="bg-gray-200/50 rounded-lg overflow-hidden border border-gray-700/50">
                  <div className="bg-gray-800 px-4 py-3 border-b border-gray-700/50">
                    <Label htmlFor="secondary-fuel-type" className="text-white font-medium flex items-center gap-2">
                      <Fuel className="h-4 w-4 text-yellow-400" />
                      <span>Secondary Fuel Type</span>
                    </Label>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-4">
                      <select
                        id="secondary-fuel-type"
                        value={secondaryFuelType}
                        onChange={handleSecondaryFuelSelect}
                        className="flex-1 bg-white border-gray-600/50 text-black rounded-md focus:border-blue-500/50 focus:ring-blue-500/20"
                      >
                        <option value="">Select secondary fuel</option>
                        {filterSecondaryFuels(primaryFuelType).map(fuel => (
                          <option key={fuel.id} value={fuel.id}>
                            {fuel.label}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => onSecondaryFuelSelect?.('')}
                        className="text-gray-400 hover:text-red-400 transition-colors p-2"
                        title="Remove secondary fuel"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>

                {/* Secondary Fuel Efficiency Section */}
                {secondaryFuelType && secondaryEfficiency && onSecondaryEfficiencyChange && (
                  <div className="bg-white rounded-lg overflow-hidden">
                    <div className="">
                      <EfficiencyInput
                        fuelType={AVAILABLE_FUEL_TYPES.find((f: FuelTypeDefinition) => f.id === secondaryFuelType) as FuelTypeDefinition}
                        efficiency={secondaryEfficiency}
                        onChange={onSecondaryEfficiencyChange}
                      />
                    </div>
                  </div>
                )}

                {/* Fuel Distribution Section */}
                {secondaryFuelType && secondaryEfficiency && onFuelSplitChange && (
                  <div className="space-y-4 bg-gray-800 p-6 rounded-xl border border-slate-700/30 shadow-xl backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                      <Label className="text-slate-100 font-semibold flex items-center gap-2">
                        {/* <Gauge className="h-4 w-4 text-emerald-400" /> */}
                        Fuel Usage Distribution
                      </Label>
                      <TooltipProvider delayDuration={0}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button 
                              type="button" 
                              className="hover:bg-slate-700/30 p-1.5 rounded-full transition-colors focus:outline-none touch-manipulation"
                            >
                              <Info className="h-4 w-4 text-slate-300" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent 
                            side="left" 
                            className="w-60 bg-white border-slate-600 text-slate-600"
                            sideOffset={5}
                          >
                            <p className="text-sm">Adjust the split between fuel types</p>
                            <p className="text-xs text-emerald-500 mt-1">Default: 50% for each fuel type</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    <div className="space-y-6">
                      {/* Primary Fuel Info */}
                      <div className="bg-gray-100 p-4 rounded-lg border border-slate-600/20 shadow-inner">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-emerald-600 font-medium flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-600"></div>
                            {fuelType.label}
                          </span>
                          <span className="text-sm bg-emerald-500/10 text-emerald-600 px-2 py-1 rounded-full font-medium">
                            {fuelSplit}%
                          </span>
                        </div>
                        <div className="text-sm text-slate-600 flex items-center gap-2">
                          <span>Combined:</span>
                          <span className="font-medium text-slate-500">
                            {efficiency.combined} {fuelType.efficiencyUnit}
                          </span>
                        </div>
                      </div>

                      {/* Slider - Updated gradient direction */}
                      <div className="py-2 px-1">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={fuelSplit}
                          onChange={(e) => onFuelSplitChange(parseInt(e.target.value))}
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
                      <div className="bg-gray-100 p-4 rounded-lg border border-slate-600/20 shadow-inner">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-violet-600 font-medium flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-violet-600"></div>
                            {AVAILABLE_FUEL_TYPES.find(f => f.id === secondaryFuelType)?.label}
                          </span>
                          <span className="text-sm bg-violet-500/10 text-violet-600 px-2 py-1 rounded-full font-medium">
                            {100 - fuelSplit}%
                          </span>
                        </div>
                        <div className="text-sm text-slate-600 flex items-center gap-2">
                          <span>Combined:</span>
                          <span className="font-medium text-slate-500">
                            {secondaryEfficiency.combined} {AVAILABLE_FUEL_TYPES.find(f => f.id === secondaryFuelType)?.efficiencyUnit}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Validation message */}
        {validationMessage && (
          <p className="text-red-400 text-sm mt-1 p-3 bg-red-900/20 border border-red-500/20 rounded-lg">
            {validationMessage}
          </p>
        )}
      </div>
    </div>
  )
} 