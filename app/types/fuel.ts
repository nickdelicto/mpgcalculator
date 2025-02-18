// Types and interfaces for fuel-related functionality

/**
 * Defines the structure and metadata for a fuel type
 */
export interface FuelTypeDefinition {
  id: string                  // Unique identifier (e.g., 'gasoline')
  label: string              // Display name (e.g., 'Gasoline')
  efficiencyUnit: string     // e.g., 'MPG', 'MPGe', 'kWh/100mi'
  costUnit: string           // e.g., '$/gallon', '$/kWh'
  defaultCost: number        // Default fuel cost
  sourceInfo?: string        // Optional source of price data
  canBePrimary: boolean      // Can this be a primary fuel?
  canBeSecondary: boolean    // Can this be a secondary fuel?
  requiresEfficiencyConversion: boolean  // Does this need special conversion?
  description?: string       // Optional description of the fuel type
}

/**
 * Efficiency metrics for a fuel type
 */
export interface FuelEfficiency {
  combined: number
  city?: number
  highway?: number
  usesCityHighway: boolean
  kwhPer100mi?: number    // For electric vehicles: kWh per 100 miles
}

/**
 * Validation rules for a fuel type
 */
export interface FuelTypeValidation {
  allowedCombinations: string[]  // Other fuel types this can combine with
  minEfficiency: number
  maxEfficiency: number
  minCost: number
  maxCost: number
  efficiencyStep: number        // Step value for efficiency input
}

/**
 * Extended manual vehicle interface with detailed fuel information
 */
export interface ManualVehicleFuel {
  name: string
  primaryFuelType: string    // Reference to FuelTypeDefinition.id
  primaryEfficiency: FuelEfficiency
  secondaryFuelType?: string  // Optional secondary fuel
  secondaryEfficiency?: FuelEfficiency
  fuelSplit?: number         // Percentage of primary fuel usage (0-100)
}

// Available fuel types with their definitions
export const AVAILABLE_FUEL_TYPES: FuelTypeDefinition[] = [
  {
    id: 'regular_gasoline',
    label: 'Regular Gasoline',
    efficiencyUnit: 'MPG',
    costUnit: '$/gallon',
    defaultCost: 3.15, // From FUEL_DEFAULTS.GASOLINE
    canBePrimary: true,
    canBeSecondary: true,
    requiresEfficiencyConversion: false,
    description: 'Standard regular (87 octane) gasoline fuel'
  },
  {
    id: 'premium_gasoline',
    label: 'Premium Gasoline',
    efficiencyUnit: 'MPG',
    costUnit: '$/gallon',
    defaultCost: 3.85, // Average premium gas price differential is about $0.70 more than regular
    canBePrimary: true,
    canBeSecondary: true,
    requiresEfficiencyConversion: false,
    description: 'Premium (91-93 octane) gasoline fuel'
  },
  {
    id: 'electricity',
    label: 'Electricity',
    efficiencyUnit: 'MPGe',
    costUnit: '$/kWh',
    defaultCost: 0.17, // From FUEL_DEFAULTS.ELECTRICITY
    sourceInfo: 'Average residential electricity rate',
    canBePrimary: true,
    canBeSecondary: true,
    requiresEfficiencyConversion: true,
    description: 'Electric power for EVs and PHEVs'
  },
  {
    id: 'diesel',
    label: 'Diesel',
    efficiencyUnit: 'MPG',
    costUnit: '$/gallon',
    defaultCost: 3.64, // From FUEL_DEFAULTS.DIESEL
    canBePrimary: true,
    canBeSecondary: false,
    requiresEfficiencyConversion: false,
    description: 'Diesel fuel for diesel engines'
  },
  {
    id: 'e85',
    label: 'E85 Flex Fuel',
    efficiencyUnit: 'MPG',
    costUnit: '$/gallon',
    defaultCost: 2.74, // From FUEL_DEFAULTS.E85
    sourceInfo: 'U.S. Department of Energy Alternative Fuels Data Center',
    canBePrimary: true,
    canBeSecondary: true,
    requiresEfficiencyConversion: false,
    description: 'E85 ethanol-gasoline blend'
  },
  {
    id: 'natural_gas',
    label: 'Natural Gas',
    efficiencyUnit: 'MPGe',
    costUnit: '$/GGE',
    defaultCost: 2.91, // From FUEL_DEFAULTS.NATURAL_GAS
    sourceInfo: 'U.S. Department of Energy Alternative Fuels Data Center',
    canBePrimary: true,
    canBeSecondary: false,
    requiresEfficiencyConversion: true,
    description: 'Compressed Natural Gas (CNG)'
  },
  {
    id: 'hydrogen',
    label: 'Hydrogen',
    efficiencyUnit: 'MPGe',
    costUnit: '$/kg',
    defaultCost: 25.00, // From FUEL_DEFAULTS.HYDROGEN
    sourceInfo: 'U.S. Department of Energy Hydrogen Shot Initiative',
    canBePrimary: true,
    canBeSecondary: false,
    requiresEfficiencyConversion: true,
    description: 'Hydrogen fuel for fuel cell vehicles'
  }
];

// Validation rules for each fuel type
export const FUEL_TYPE_VALIDATION: Record<string, FuelTypeValidation> = {
  gasoline: {
    allowedCombinations: ['electricity', 'e85'],
    minEfficiency: 1,
    maxEfficiency: 150,
    minCost: 0.01,
    maxCost: 10.00,
    efficiencyStep: 0.1
  },
  electricity: {
    allowedCombinations: ['gasoline', 'diesel'],
    minEfficiency: 1,
    maxEfficiency: 520, // Tesla Model 3 RWD: 132 MPGe, but allowing higher for future
    minCost: 0.01,
    maxCost: 1.00,
    efficiencyStep: 0.1
  },
  diesel: {
    allowedCombinations: ['electricity'],
    minEfficiency: 1,
    maxEfficiency: 100,
    minCost: 0.01,
    maxCost: 10.00,
    efficiencyStep: 0.1
  },
  e85: {
    allowedCombinations: ['gasoline'],
    minEfficiency: 1,
    maxEfficiency: 100,
    minCost: 0.01,
    maxCost: 10.00,
    efficiencyStep: 0.1
  },
  natural_gas: {
    allowedCombinations: [],
    minEfficiency: 1,
    maxEfficiency: 150,
    minCost: 0.01,
    maxCost: 10.00,
    efficiencyStep: 0.1
  },
  hydrogen: {
    allowedCombinations: [],
    minEfficiency: 1,
    maxEfficiency: 150,
    minCost: 0.01,
    maxCost: 50.00,
    efficiencyStep: 0.1
  }
}; 