import { FuelTypeDefinition } from '../types/fuel'
import { AVAILABLE_FUEL_TYPES } from '../types/fuel'

/**
 * Conversion factors for different efficiency units
 */
export const EFFICIENCY_CONVERSIONS = {
  MPG_TO_KWH_100MI: 33.705, // 1 gallon of gasoline = 33.705 kWh
  MPG_TO_MPGE: 1,           // 1 MPG = 1 MPGe (for conversion display)
  KWH_100MI_TO_MPGE: 33.705 // 33.705 kWh/100mi = 100 MPGe
}

/**
 * Helper text for different efficiency units
 */
export type EfficiencyUnit = 'MPG' | 'MPGe' | 'kWh/100mi' | 'GGE'

export const EFFICIENCY_TOOLTIPS: Record<EfficiencyUnit, string> = {
  MPG: 'Miles per gallon - how many miles the vehicle can travel on one gallon of fuel',
  MPGe: 'Miles per gallon equivalent - allows comparison between different fuel types',
  'kWh/100mi': 'Kilowatt-hours per 100 miles - energy consumption for electric vehicles',
  GGE: 'Gasoline Gallon Equivalent - amount of alternative fuel equal to 1 gallon of gasoline',
}

/**
 * Converts efficiency value between different units
 */
export function convertEfficiency(
  value: number,
  fromUnit: string,
  toUnit: string
): number {
  if (fromUnit === toUnit) return value
  
  // Common conversions
  switch (`${fromUnit}_to_${toUnit}`) {
    case 'MPG_to_kWh/100mi':
      return EFFICIENCY_CONVERSIONS.MPG_TO_KWH_100MI / value * 100
    case 'kWh/100mi_to_MPGe':
      return EFFICIENCY_CONVERSIONS.KWH_100MI_TO_MPGE / value * 100
    case 'MPG_to_MPGe':
      return value * EFFICIENCY_CONVERSIONS.MPG_TO_MPGE
    default:
      return value
  }
}

/**
 * Gets the appropriate efficiency unit label based on fuel type
 */
export function getEfficiencyLabel(fuelType: FuelTypeDefinition): string {
  const { efficiencyUnit } = fuelType
  
  switch (efficiencyUnit) {
    case 'MPGe':
      return 'MPGe (Miles per Gallon Equivalent)'
    case 'MPG':
      return 'MPG (Miles per Gallon)'
    case 'kWh/100mi':
      return 'kWh/100mi (Kilowatt-hours per 100 miles)'
    default:
      return efficiencyUnit
  }
}

/**
 * Validates an efficiency value for a given fuel type
 */
export function validateEfficiency(
  value: number,
  fuelType: FuelTypeDefinition,
  isHighway: boolean = false
): { isValid: boolean; message?: string } {
  // Get validation rules for this fuel type
  const validation = {
    min: 1,
    max: fuelType.efficiencyUnit === 'MPGe' ? 520 : 150, // Higher limit for electric
    // Highway efficiency typically 20% higher than combined
    highwayMax: fuelType.efficiencyUnit === 'MPGe' ? 620 : 180
  }

  const maxValue = isHighway ? validation.highwayMax : validation.max

  if (value < validation.min) {
    return {
      isValid: false,
      message: `Efficiency cannot be less than ${validation.min} ${fuelType.efficiencyUnit}`
    }
  }

  if (value > maxValue) {
    return {
      isValid: false,
      message: `Efficiency cannot be more than ${maxValue} ${fuelType.efficiencyUnit}`
    }
  }

  return { isValid: true }
}

/**
 * Calculates combined efficiency from city and highway values
 */
export function calculateCombinedEfficiency(
  cityValue: number,
  highwayValue: number,
  cityPercentage: number = 55 // EPA default city percentage
): number {
  const highwayPercentage = 100 - cityPercentage
  return (cityValue * cityPercentage + highwayValue * highwayPercentage) / 100
}

/**
 * Formats efficiency value for display
 */
export function formatEfficiency(
  value: number,
  fuelType: FuelTypeDefinition
): string {
  const precision = fuelType.efficiencyUnit === 'kWh/100mi' ? 1 : 0
  return value.toFixed(precision)
}

/**
 * Gets step value for efficiency input
 */
export function getEfficiencyStep(fuelType: FuelTypeDefinition): number {
  return fuelType.efficiencyUnit === 'kWh/100mi' ? 0.1 : 1
}

/**
 * Gets min/max values for efficiency input
 */
export function getEfficiencyBounds(
  fuelType: FuelTypeDefinition,
  isHighway: boolean = false
): { min: number; max: number } {
  const baseMax = fuelType.efficiencyUnit === 'MPGe' ? 520 : 150
  return {
    min: 1,
    max: isHighway ? baseMax * 1.2 : baseMax // Highway 20% higher
  }
} 