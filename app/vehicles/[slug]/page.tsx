import { Metadata } from 'next'
import { Vehicle } from '../../types/vehicle'
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Fuel, CarFront, Leaf, Gauge, LineChart, DollarSign } from 'lucide-react'
import VehicleComparison from '../../components/VehicleComparison'
import VehicleTimeline from '../../components/VehicleTimeline'
import Link from 'next/link'
import { Suspense } from 'react'
import VehiclePageSkeleton from '../../components/VehiclePageSkeleton'
import Script from 'next/script'
import FuelSavingsCalculator from '../../components/FuelSavingsCalculator'
import VehiclePageProducts from '../../components/VehiclePageProducts'
import ToolsPromoSidebar from '../../components/ToolsPromoSidebar'
import type { AmazonProduct } from '../../components/VehiclePageProducts'

// Helper function to determine if fuel type uses MPGe
const usesMPGe = (fuelType: string): boolean => {
  const MPGeTypes = [
    'Electricity',
    'Natural Gas',
    'Hydrogen',
    'Propane',
    'LPG'
  ]
  return MPGeTypes.includes(fuelType)
}

// Helper to get the best combined MPG/MPGe value
const getBestCombinedMPG = (vehicle: Vehicle): number => {
  // Prioritize PHEV combined if available
  if (vehicle.phevComb) return vehicle.phevComb
  // Then alternative fuel if available
  // if (vehicle.combA08) return vehicle.combA08
  // Finally fall back to primary fuel
  return vehicle.comb08
}

// Add this near the top of the file after imports
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

// Add this after the existing helper functions
function normalizeForUrl(text: string): string {
  // First normalize the text the same way as the database
  const normalized = text
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')  // Replace all non-alphanumeric chars with space
    .replace(/\s+/g, ' ')        // Replace multiple spaces with single space
    .trim()                      // Trim leading/trailing spaces
    
  // Then convert spaces to hyphens for URL-friendly format
  return normalized.replace(/\s/g, '-')
}

// Add this constant at the top of the file after imports
const SPECIAL_MAKES = new Set([
  'mercedes-benz',
  'rolls-royce',
  'aston martin',
  'land rover',
  'alfa romeo',
  'bugatti rimac',
  'ineos automotive',
  'ruf automobile',
  'mclaren automotive',
  'roush performance'
]);

interface Props {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const canonicalUrl = `${baseUrl}/vehicles/${resolvedParams.slug}`
  
  // Fetch the complete vehicle data first
  const vehicles = await getVehicleData(resolvedParams.slug)
  
  let title = ''
  let description = ''
  
  if (vehicles.length > 0) {
    // Use the complete vehicle data to create a unique title
    const vehicle = vehicles[0]
    title = `${vehicle.year} ${vehicle.make} ${vehicle.model} MPG - Fuel Efficiency Data`
    description = `Get official ${vehicle.year} ${vehicle.make} ${vehicle.model} MPG ratings. View detailed city, highway, and combined fuel efficiency data and compare with similar vehicles.`
  } else {
    // Fallback to simple parsing if vehicle data isn't available
    const [year, make, ...modelParts] = resolvedParams.slug.replace(/-mpg$/, '').split('-')
    // For special makes like Mercedes-Benz, handle with care
    let fullMake = make
    let fullModel = modelParts.join(' ')
    
    if (SPECIAL_MAKES.has(make.toLowerCase())) {
      // If the make is in our special list, make sure we handle it properly
      const specialMakeEnd = modelParts.findIndex((part, idx) => {
        const possibleMake = [make, ...modelParts.slice(0, idx + 1)].join(' ').toLowerCase()
        return SPECIAL_MAKES.has(possibleMake)
      })
      
      if (specialMakeEnd !== -1) {
        fullMake = [make, ...modelParts.slice(0, specialMakeEnd + 1)].join(' ')
        fullModel = modelParts.slice(specialMakeEnd + 1).join(' ')
      }
    }
    
    title = `${year} ${fullMake} ${fullModel} MPG - Fuel Economy Data`
    description = `Get official ${year} ${fullMake} ${fullModel} MPG ratings. View detailed city, highway, and combined fuel efficiency data and compare with similar vehicles.`
  }

  return {
    title,
    description,
    keywords: `${title.replace(' - Fuel Economy Data & Ratings', '')}, ${title.replace('MPG - Fuel Economy Data & Ratings', 'fuel economy')}, ${title.replace('MPG - Fuel Economy Data & Ratings', 'gas mileage')}, ${title.replace('MPG - Fuel Economy Data & Ratings', 'fuel efficiency')}`,
    
    // Open Graph
    openGraph: {
      title,
      description,
      type: 'website',
      url: canonicalUrl,
      siteName: 'MPGCalculator.net',
    },

    // Twitter
    twitter: {
      card: 'summary',
      title,
      description,
    },

    // Canonical URL
    alternates: {
      canonical: canonicalUrl,
    },

    // Additional metadata
    robots: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  }
}

async function getVehicleData(slug: string): Promise<Vehicle[]> {
  // Remove the "-mpg" suffix first
  const slugWithoutSuffix = slug.replace(/-mpg$/, '')
  
  // Extract year and remaining parts
  const [year, ...parts] = slugWithoutSuffix.split('-')
  
  // Find the make by checking for special makes first
  let make = ''
  let modelParts = [...parts]
  
  // Try to match special makes first (case-insensitive)
  for (let i = 1; i <= parts.length; i++) {
    // Try both space-separated and hyphen-separated formats
    const possibleMakeWithSpace = parts.slice(0, i).join(' ').toLowerCase()
    const possibleMakeWithHyphen = parts.slice(0, i).join('-').toLowerCase()
    
    if (SPECIAL_MAKES.has(possibleMakeWithSpace) || SPECIAL_MAKES.has(possibleMakeWithHyphen)) {
      // Use the format that matched (prefer space if both match)
      make = SPECIAL_MAKES.has(possibleMakeWithSpace) 
        ? parts.slice(0, i).join(' ')
        : parts.slice(0, i).join('-')
      modelParts = parts.slice(i)
      break
    }
  }
  
  // If no special make found, use the first part as make
  if (!make) {
    make = parts[0]
    modelParts = parts.slice(1)
  }
  
  // Join the remaining parts with spaces to match database normalization
  const model = modelParts.join(' ')
  
  console.log('Parsed URL components:', {
    original_slug: slug,
    year,
    make,
    model,
    normalized_model: model.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim()
  })

  const url = new URL(`${baseUrl}/api/vehicles/details`)
  url.searchParams.append('make', make)
  url.searchParams.append('model', model)
  url.searchParams.append('year', year)

  console.log('Fetching from URL:', url.toString())

  try {
    const response = await fetch(url.toString(), { cache: 'no-store' })
    console.log('Response status:', response.status)
    
    if (!response.ok) {
      console.log('Response not OK:', await response.text())
      throw new Error('Failed to fetch vehicle')
    }
    
    const data = await response.json()
    console.log('Response data:', data)
    
    return data || []
  } catch (error) {
    console.error('Error fetching vehicle:', error)
    return []
  }
}

async function getSimilarVehicles(vehicle: Vehicle): Promise<Vehicle[]> {
  try {
    const url = new URL('/api/vehicles/similar-mpg', baseUrl)
    url.search = new URLSearchParams({
      mpg: (vehicle.phevComb || vehicle.comb08).toString(),
      vclass: vehicle.VClass,
      excludeYear: vehicle.year.toString(),
      excludeMake: vehicle.make,
      excludeModel: vehicle.model
    }).toString()
    
    const response = await fetch(url.toString(), {
      cache: 'no-store' // Disable caching to ensure fresh data
    })
    if (!response.ok) throw new Error('Failed to fetch similar vehicles')
    return await response.json()
  } catch (error) {
    console.error('Error fetching similar vehicles:', error)
    return []
  }
}

// Set revalidation time to 30 days
export const revalidate = 2592000 // 30 days in seconds

export default async function VehiclePage({ params }: Props) {
  return (
    <Suspense fallback={<VehiclePageSkeleton />}>
      <VehicleContent params={params} />
    </Suspense>
  )
}

// Move the main content to a new component
async function VehicleContent({ params }: Props) {
  const resolvedParams = await params
  const vehicles = await getVehicleData(resolvedParams.slug)
  
  // Add this: Fetch products
  const productsResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/amazon/products`, {
    cache: 'no-store'
  })
  const products = await productsResponse.json()

  if (!vehicles.length) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-6">Vehicle Not Found</h1>
        <p className="text-gray-300">Sorry, we couldn't find the vehicle you're looking for.</p>
      </div>
    )
  }

  const [vehicle, ...variants] = vehicles
  const similarVehicles = await getSimilarVehicles(vehicle)
  const bestCombinedMPG = getBestCombinedMPG(vehicle)
  const primaryMpgSuffix = usesMPGe(vehicle.fuelType1) ? 'MPGe' : 'MPG'
  const phevSuffix = 'MPGe'  // PHEV values are always in MPGe

  // Add this before generateVehicleSchema function
  async function getVehicleClassCount(vclass: string): Promise<number> {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/vehicles/class-count?vclass=${encodeURIComponent(vclass)}`,
        { cache: 'no-store' }
      )
      if (!response.ok) throw new Error('Failed to fetch class count')
      const data = await response.json()
      return data.count
    } catch (error) {
      console.error('Error getting vehicle class count:', error)
      return 0
    }
  }

  // Modify the generateVehicleSchema function
  async function generateVehicleSchema(vehicle: any, variants: any[]) {
    // Get best combined MPG/MPGe
    const bestCombined = getBestCombinedMPG(vehicle)
    
    // Get class MPG stats and rating using best combined value
    const mpgStats = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/vehicles/class-mpg-stats?vclass=${encodeURIComponent(vehicle.VClass)}&mpg=${bestCombined}`,
      { cache: 'no-store' }
    ).then(res => res.json())

    // Base vehicle schema
    const vehicleSchema = {
      '@context': 'https://schema.org',
      '@type': 'Vehicle',
      name: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
      manufacturer: {
        '@type': 'Organization',
        name: vehicle.make
      },
      modelDate: vehicle.year,
      vehicleConfiguration: vehicle.trany,
      driveWheelConfiguration: vehicle.drive,
      fuelType: vehicle.fuelType1,
      fuelEfficiency: {
        '@type': 'QuantitativeValue',
        value: vehicle.comb08,
        unitText: usesMPGe(vehicle.fuelType1) ? 'MPGe' : 'MPG'
      },
      numberOfForwardGears: vehicle.trany.includes('Speed') ? parseInt(vehicle.trany.split('-')[0]) : undefined,
      vehicleEngine: {
        '@type': 'EngineSpecification',
        engineDisplacement: {
          '@type': 'QuantitativeValue',
          value: vehicle.displ,
          unitText: 'L'
        },
        engineType: [
          vehicle.fuelType1,
          vehicle.sCharger === 'S' ? 'Supercharged' : '',
          vehicle.tCharger === 'T' ? 'Turbocharged' : '',
        ].filter(Boolean).join(' ')
      }
    }

    // Product schema
    const productSchema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
      description: `${vehicle.year} ${vehicle.make} ${vehicle.model} with ${bestCombined} ${usesMPGe(vehicle.fuelType1) || vehicle.phevComb ? 'MPGe' : 'MPG'} combined fuel economy. Features ${vehicle.displ}L engine and ${vehicle.drive.toLowerCase()} drivetrain.`,
      brand: {
        '@type': 'Brand',
        name: vehicle.make
      },
      model: vehicle.model,
      modelDate: vehicle.year,
      vehicleConfiguration: vehicle.trany,
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: (mpgStats.rating || 3.0).toString(),
        bestRating: '5',
        worstRating: '1',
        ratingCount: mpgStats.total_vehicles,
        reviewCount: mpgStats.total_vehicles,
        description: `Rating based on combined fuel economy of ${bestCombined} ${usesMPGe(vehicle.fuelType1) || vehicle.phevComb ? 'MPGe' : 'MPG'} compared to other vehicles in the ${vehicle.VClass} class (range: ${mpgStats.min_mpg}-${mpgStats.max_mpg} ${usesMPGe(vehicle.fuelType1) || vehicle.phevComb ? 'MPGe' : 'MPG'}, average: ${mpgStats.avg_mpg} ${usesMPGe(vehicle.fuelType1) || vehicle.phevComb ? 'MPGe' : 'MPG'}). A higher rating indicates better fuel efficiency.`
      },
      additionalProperty: [
        {
          '@type': 'PropertyValue',
          name: 'Combined Fuel Economy',
          value: `${bestCombined} ${usesMPGe(vehicle.fuelType1) || vehicle.phevComb ? 'MPGe' : 'MPG'}`
        },
        {
          '@type': 'PropertyValue',
          name: 'City Fuel Economy',
          value: `${vehicle.phevCity || vehicle.city08} ${usesMPGe(vehicle.fuelType1) || vehicle.phevCity ? 'MPGe' : 'MPG'}`
        },
        {
          '@type': 'PropertyValue',
          name: 'Highway Fuel Economy',
          value: `${vehicle.phevHwy || vehicle.highway08} ${usesMPGe(vehicle.fuelType1) || vehicle.phevHwy ? 'MPGe' : 'MPG'}`
        }
      ]
    }

    return {
      '@context': 'https://schema.org',
      '@graph': [vehicleSchema, productSchema]
    }
  }

  // Generate schemas with proper async handling
  const schemas = await generateVehicleSchema(vehicle, variants)

  // Add shuffle utility function at the top with other utility functions
  function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  // Add type annotation here
  const shuffledProducts = shuffleArray<AmazonProduct>(products)
  
  return (
    <>
      <Script id="vehicle-schema" type="application/ld+json">
        {JSON.stringify(schemas)}
      </Script>
      <div className="container mx-auto px-4 py-8 font-heading">
        {/* Wrap content in flex layout */}
        <div className="flex flex-col lg:flex-row gap-8">
          <main className="lg:w-2/3 2xl:w-3/4">
        {/* Enhanced Hero Section */}
            <div className="relative mb-8 bg-gradient-to-r from-blue-900 to-blue-800 rounded-xl p-6 overflow-hidden">
              {/* Decorative car silhouette */}
              <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4">
                <CarFront size={180} />
              </div>

              <h1 className="text-3xl font-bold text-white mb-2 font-heading relative z-10">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </h1>
              <p className="text-blue-200 font-heading relative z-10">
                MPG & Fuel Economy Data
              </p>
            </div>

        {/* Quick Summary */}
        <Card className="bg-blue-900/90 border-blue-800/30 mb-8">
          <CardHeader>
            <CardTitle className="text-xl text-white flex items-center gap-2">
              <Gauge className="h-6 w-6 text-blue-400" />
              Quick Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-100">
              The {vehicle.year} {vehicle.make} {vehicle.model} has an estimated {bestCombinedMPG} {vehicle.phevComb ? phevSuffix : primaryMpgSuffix} combined.&nbsp;
              {vehicle.phevComb ? (
                `This ${vehicle.fuelType1.toLowerCase()}/${vehicle.fuelType2?.toLowerCase() || ''}-powered hybrid vehicle offers ${vehicle.phevCity || vehicle.city08} ${phevSuffix} in the city and ${vehicle.phevHwy || vehicle.highway08} ${phevSuffix} on the highway.`
              ) : (
                `This ${vehicle.fuelType1.toLowerCase()}-powered vehicle offers ${vehicle.city08} ${primaryMpgSuffix} in the city and ${vehicle.highway08} ${primaryMpgSuffix} on the highway.`
              )}&nbsp;
              Check out its full EPA-estimated fuel economy data below.
            </p>
          </CardContent>
        </Card>

        {/* Main MPG Data */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Primary Fuel Economy */}
          <Card className={`bg-gray-800 border-gray-700 ${vehicle.co2 === null && vehicle.ghgScore === null ? 'md:col-span-2' : ''}`}>
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <Fuel className="h-6 w-6 text-yellow-400" />
                {vehicle.fuelType1} Fuel Economy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="bg-gray-600/50 p-4 rounded-lg">
                  <p className="text-2xl font-mono text-green-400 flex items-center justify-between">
                    <span className="text-gray-300 text-sm">Combined</span>
                    {vehicle.comb08} {primaryMpgSuffix}
                  </p>
                </div>
                <div className="bg-gray-600/50 p-4 rounded-lg">
                  <p className="text-2xl font-mono text-blue-400 flex items-center justify-between">
                    <span className="text-gray-300 text-sm">City</span>
                    {vehicle.city08} {primaryMpgSuffix}
                  </p>
                </div>
                <div className="bg-gray-600/50 p-4 rounded-lg">
                  <p className="text-2xl font-mono text-red-400 flex items-center justify-between">
                    <span className="text-gray-300 text-sm">Highway</span>
                    {vehicle.highway08} {primaryMpgSuffix}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Environmental Impact - Only show if data exists */}
          {(vehicle.co2 !== null || vehicle.ghgScore !== null) && (
          <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <Leaf className="h-6 w-6 text-green-400" />
                Environmental Impact
              </CardTitle>
            </CardHeader>
              <CardContent className="space-y-4">
              <div className="grid gap-4">
                {vehicle.co2 !== null && (
                  <div className="bg-gray-600/50 p-4 rounded-lg">
                    <p className="text-2xl font-mono text-orange-400 flex items-center justify-between">
                      <span className="text-gray-300 text-sm">CO₂ Emissions</span>
                      {vehicle.co2} g/mi
                    </p>
                  </div>
                )}
                {vehicle.ghgScore !== null && (
                  <div className="bg-gray-600/50 p-4 rounded-lg">
                    <p className="text-2xl font-mono text-green-400 flex items-center justify-between">
                      <span className="text-gray-300 text-sm">GHG Score</span>
                      {vehicle.ghgScore}/10
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          )}
        </div>

        {/* Alternative Fuel Section */}
        {vehicle.fuelType2 && (vehicle.combA08 || vehicle.cityA08 || vehicle.highwayA08) && (
          <Card className="bg-gray-800 border-gray-700 mb-8">
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <Fuel className="h-6 w-6 text-yellow-400" />
                {vehicle.fuelType2} Fuel Economy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="grid gap-4">
                    {vehicle.combA08 && (
                      <div className="bg-gray-600/50 p-4 rounded-lg">
                        <p className="text-2xl font-mono text-green-400 flex items-center justify-between">
                          <span className="text-gray-300 text-sm">Combined</span>
                          {vehicle.combA08} {usesMPGe(vehicle.fuelType2) ? 'MPGe' : 'MPG'}
              </p>
            </div>
                    )}
                    {vehicle.cityA08 && (
                      <div className="bg-gray-600/50 p-4 rounded-lg">
                        <p className="text-2xl font-mono text-blue-400 flex items-center justify-between">
                          <span className="text-gray-300 text-sm">City</span>
                          {vehicle.cityA08} {usesMPGe(vehicle.fuelType2) ? 'MPGe' : 'MPG'}
                        </p>
          </div>
                    )}
                    {vehicle.highwayA08 && (
                      <div className="bg-gray-600/50 p-4 rounded-lg">
                        <p className="text-2xl font-mono text-red-400 flex items-center justify-between">
                          <span className="text-gray-300 text-sm">Highway</span>
                          {vehicle.highwayA08} {usesMPGe(vehicle.fuelType2) ? 'MPGe' : 'MPG'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                {/* Alternative Fuel Environmental Impact */}
                {(vehicle.co2A !== null || vehicle.ghgScoreA !== null) && (
                  <div className="space-y-4">
                    <CardHeader>
                      <CardTitle className="text-xl text-white flex items-center gap-2">
                        <Leaf className="h-6 w-6 text-green-400" />
                        Environmental Impact
                      </CardTitle>
                    </CardHeader>
                    <div className="grid gap-4">
                      {vehicle.co2A !== null && (
                        <div className="bg-gray-600/50 p-4 rounded-lg">
                          <p className="text-xl font-mono text-orange-400 flex items-center justify-between">
                            <span className="text-gray-300 text-sm">CO₂ Emissions</span>
                            {vehicle.co2A} g/mi
                          </p>
                        </div>
                      )}
                      {vehicle.ghgScoreA !== null && (
                        <div className="bg-gray-600/50 p-4 rounded-lg">
                          <p className="text-xl font-mono text-green-400 flex items-center justify-between">
                            <span className="text-gray-300 text-sm">GHG Score</span>
                            {vehicle.ghgScoreA}/10
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* PHEV Mode Section */}
        {(vehicle.phevComb || vehicle.phevCity || vehicle.phevHwy) && (
          <Card className="bg-gray-800 border-gray-700 mb-8">
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <Fuel className="h-6 w-6 text-green-400" />
                Plug-in Hybrid (PHEV) Mode
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <p className="text-gray-300">
                    This vehicle features plug-in hybrid technology, offering enhanced fuel efficiency through electric power.
                  </p>
                  <div className="grid gap-4">
                    {vehicle.phevComb && (
                      <div className="bg-gray-600/50 p-4 rounded-lg">
                        <p className="text-2xl font-mono text-green-400 flex items-center justify-between">
                          <span className="text-gray-300 text-sm">Combined</span>
                          {vehicle.phevComb} {phevSuffix}
                        </p>
                      </div>
                    )}
                    {vehicle.phevCity && (
                      <div className="bg-gray-600/50 p-4 rounded-lg">
                        <p className="text-2xl font-mono text-blue-400 flex items-center justify-between">
                          <span className="text-gray-300 text-sm">City</span>
                          {vehicle.phevCity} {phevSuffix}
                        </p>
                      </div>
                    )}
                    {vehicle.phevHwy && (
                      <div className="bg-gray-600/50 p-4 rounded-lg">
                        <p className="text-2xl font-mono text-red-400 flex items-center justify-between">
                          <span className="text-gray-300 text-sm">Highway</span>
                          {vehicle.phevHwy} {phevSuffix}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-emerald-300">PHEV Features</h4>
                  <div className="grid gap-4">
                    <div className="bg-gray-600/50 p-4 rounded-lg">
                      <p className="text-gray-300">
                        <span className="font-bold">Charge-Depleting Operation:</span>{' '}
                        {vehicle.phevBlended ? 
                          'This PHEV uses both electricity and gasoline while the battery charge is being depleted.' :
                          'This PHEV uses only electricity until the battery is depleted, then switches to gasoline.'}
                      </p>
                    </div>
                    {/* {vehicle.startStop === 'Y' && (
                      <div className="bg-gray-600/50 p-4 rounded-lg">
                        <p className="text-gray-300">
                          <span className="font-semibold">Start-Stop Technology:</span>{' '}
                          Equipped with start-stop technology to reduce idle fuel consumption.
                        </p>
                      </div>
                    )} */}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

            {/* First placement after PHEV Mode Section */}
            <VehiclePageProducts
              title="Recommended*"
              products={shuffledProducts.slice(0, 3)}
            />

        {/* Content Sections */}
        <div className="space-y-12">
          {/* Environmental Performance - if data exists */}
          {(vehicle.co2 !== null || vehicle.ghgScore !== null || vehicle.co2A !== null || vehicle.ghgScoreA !== null) && (
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Environmental Performance
            </h2>
              <div className="prose prose-invert max-w-none text-gray-600 space-y-4">
              {vehicle.ghgScore && (
                <p>
                  With a Greenhouse Gas Score of {vehicle.ghgScore}/10, the {vehicle.year} {vehicle.make} {vehicle.model} {
                    vehicle.ghgScore >= 7 ? 'demonstrates excellent' :
                    vehicle.ghgScore >= 5 ? 'shows average' :
                    'has below average'
                  } environmental performance in its class. {
                    vehicle.ghgScore >= 7 ? 'This high score indicates a significant reduction in greenhouse gas emissions compared to other vehicles.' :
                    vehicle.ghgScore >= 5 ? 'This score suggests typical greenhouse gas emissions for vehicles in this category.' : (
                    <>
                      If you prefer more environmentally friendly alternatives,{' '}
                      <a href="#compare" className="text-blue-400 hover:text-blue-300 transition-colors">
                        compare this vehicle's fuel economy
                      </a>
                      {' '}with others in this class.
                    </>
                  )}
                </p>
              )}
              {vehicle.co2 && (
                <p>
                  The vehicle produces approximately {vehicle.co2} grams of CO₂ per mile under typical driving conditions.
                  {vehicle.co2 < 250 ? ' This is a relatively low carbon footprint for its class.' :
                   vehicle.co2 < 350 ? ' This represents average carbon emissions for its vehicle type.' :
                   ' Consider more fuel-efficient alternatives if environmental impact is a priority.'}
                </p>
              )}
            </div>
        </section>
          )}

          {/* Technical Specifications - always show */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Technical Specifications
          </h2>
            <div className="prose prose-invert max-w-none text-gray-600">
              <p>
                This {vehicle.VClass.toLowerCase()} features a {vehicle.displ}L {
                  vehicle.cylinders ? `${vehicle.cylinders}-cylinder` : ''
                } engine, paired with a {vehicle.trany.toLowerCase()} transmission and {vehicle.drive.toLowerCase()} drivetrain.
                {vehicle.startStop === 'Y' && ' It includes start-stop technology to improve fuel efficiency in city driving conditions.'}
                {vehicle.sCharger === 'S' && ' The engine is supercharged for enhanced performance.'}
                {vehicle.tCharger === 'T' && ' Plus it has a turbocharged engine for improved power and efficiency.'}
                          </p>
                        </div>
          </section>

          {/* Fuel Economy Tips - always show */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Maximizing Fuel Economy
            </h2>
            <div className="prose prose-invert max-w-none text-gray-600">
              <p>
                To achieve the best fuel economy in your {vehicle.year} {vehicle.make} {vehicle.model}, consider these tips:
                      </p>
              <ul className="list-disc pl-6 mt-4 space-y-2">
                <li>Maintain steady speeds and avoid rapid acceleration</li>
                <li>Keep tires properly inflated to manufacturer specifications</li>
                <li>Remove excess weight and roof cargo when not needed</li>
                <li>Follow recommended maintenance schedules</li>
                {vehicle.startStop === 'Y' && (
                  <li>Utilize the vehicle's start-stop technology in city driving</li>
                )}
                {vehicle.phevBlended && (
                  <li>Charge the battery regularly to maximize electric-only operation</li>
                )}
              </ul>
          </div>
        </section>

        {/* Base Model Timeline */}
        <Card className="bg-gray-800 border-gray-700 mb-8">
          <CardHeader>
            <CardTitle className="text-xl text-white flex items-center gap-2">
              <LineChart className="h-6 w-6 text-blue-400" />
              {vehicle.make} {vehicle.model} {vehicle.trany.toLowerCase()} Historical Fuel Efficiency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <VehicleTimeline 
              make={vehicle.make} 
              model={vehicle.model} 
              drive={vehicle.drive}
              fuelType1={vehicle.fuelType1}
              fuelType2={vehicle.fuelType2}
              transmission={vehicle.trany}
              displacement={vehicle.displ?.toString()}
            />
          </CardContent> 
        </Card>

          {/* Fuel Savings Calculator */}
          <section id="savings" className="mt-12 border-t border-gray-700 pt-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Compare & Calculate Your Fuel Savings</h2>
            <Card className="bg-gradient-to-r from-gray-900 to-gray-800 border-gray-700">
              <CardHeader className="border-b border-gray-700">
                <CardTitle className="text-white flex items-center gap-2 text-2xl">
                  <DollarSign className="h-6 w-6 text-green-400" />
                  Estimate Fuel Savings Over Time
                </CardTitle>
                <p className="text-gray-400 mt-2 text-sm">
                  To embed this FREE calculator on your site, visit our <Link href="/fuel-savings-calculator" className="text-blue-400 hover:text-blue-300 transition-colors">fuel savings calculator</Link> page, and copy the embed code.
                </p>
              </CardHeader>
              <CardContent className="pt-6 font-heading">
                <FuelSavingsCalculator />
              </CardContent>
            </Card>
          </section>

          {/* Vehicle Variants Section */}
          {variants.length > 0 && variants.map((variant, index) => {
              const differentiator = getVariantDifferentiator(vehicle, variant)
              if (!differentiator) return null

              const variantMpgSuffix = usesMPGe(variant.fuelType1) ? 'MPGe' : 'MPG'
              const variantPhevSuffix = 'MPGe'

              return (
                <section key={index} className="border-t border-gray-700 pt-12 space-y-12">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">
                    {variant.year} {variant.make} {variant.model} - {differentiator}
                  </h2>

                  {/* Quick Summary */}
                  <Card className="bg-blue-900/90 border-blue-800/30 mb-8">
                    <CardHeader>
                      <CardTitle className="text-xl text-white flex items-center gap-2">
                        <CarFront className="h-6 w-6 text-blue-400" />
                        Quick Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-blue-100">
                        The {variant.year} {variant.make} {variant.model} with {differentiator.toLowerCase()} has an estimated {variant.phevComb || variant.comb08} {variant.phevComb ? variantPhevSuffix : variantMpgSuffix} combined.&nbsp;
                        {variant.phevComb ? (
                          `This ${differentiator.toLowerCase()} ${variant.fuelType1.toLowerCase()}/${variant.fuelType2?.toLowerCase() || ''}-powered hybrid vehicle offers ${variant.phevCity || variant.city08} ${variantPhevSuffix} in the city and ${variant.phevHwy || variant.highway08} ${variantPhevSuffix} on the highway.`
                        ) : (
                          `This ${differentiator.toLowerCase()} ${variant.fuelType1.toLowerCase()}-powered vehicle offers ${variant.city08} ${variantMpgSuffix} in the city and ${variant.highway08} ${variantMpgSuffix} on the highway.`
                        )}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Variant MPG Data */}
                  <div className="grid md:grid-cols-2 gap-8 mb-12">
                    {/* Primary Fuel Economy */}
                    <Card className={`bg-gray-800 border-gray-700 ${variant.co2 === null && variant.ghgScore === null ? 'md:col-span-2' : ''}`}>
                      <CardHeader>
                        <CardTitle className="text-xl text-white flex items-center gap-2">
                          <Fuel className="h-6 w-6 text-yellow-400" />
                          {variant.fuelType1} Fuel Economy
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid gap-4">
                          <div className="bg-gray-600/50 p-4 rounded-lg">
                            <p className="text-2xl font-mono text-green-400 flex items-center justify-between">
                              <span className="text-gray-300 text-sm">Combined</span>
                              {variant.comb08} {usesMPGe(variant.fuelType1) ? 'MPGe' : 'MPG'}
                            </p>
                          </div>
                          <div className="bg-gray-600/50 p-4 rounded-lg">
                            <p className="text-2xl font-mono text-blue-400 flex items-center justify-between">
                              <span className="text-gray-300 text-sm">City</span>
                              {variant.city08} {usesMPGe(variant.fuelType1) ? 'MPGe' : 'MPG'}
                            </p>
                          </div>
                          <div className="bg-gray-600/50 p-4 rounded-lg">
                            <p className="text-2xl font-mono text-red-400 flex items-center justify-between">
                              <span className="text-gray-300 text-sm">Highway</span>
                              {variant.highway08} {usesMPGe(variant.fuelType1) ? 'MPGe' : 'MPG'}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Environmental Impact - Only show if data exists */}
                    {(variant.co2 !== null || variant.ghgScore !== null) && (
                      <Card className="bg-gray-800 border-gray-700">
                        <CardHeader>
                          <CardTitle className="text-xl text-white flex items-center gap-2">
                            <Leaf className="h-6 w-6 text-green-400" />
                            Environmental Impact
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid gap-4">
                            {variant.co2 !== null && (
                              <div className="bg-gray-600/50 p-4 rounded-lg">
                                <p className="text-2xl font-mono text-orange-400 flex items-center justify-between">
                                  <span className="text-gray-300 text-sm">CO₂ Emissions</span>
                                  {variant.co2} g/mi
                                </p>
                              </div>
                            )}
                            {variant.ghgScore !== null && (
                              <div className="bg-gray-600/50 p-4 rounded-lg">
                                <p className="text-2xl font-mono text-green-400 flex items-center justify-between">
                                  <span className="text-gray-300 text-sm">GHG Score</span>
                                  {variant.ghgScore}/10
                                </p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  {/* Alternative Fuel Economy - Only show if available */}
                  {variant.fuelType2 && (
                    <div className="grid md:grid-cols-2 gap-8 mb-12">
                      <Card className="bg-gray-800 border-gray-700">
                        <CardHeader>
                          <CardTitle className="text-xl text-white flex items-center gap-2">
                            <Fuel className="h-6 w-6 text-yellow-400" />
                            {variant.fuelType2} Fuel Economy
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid gap-4">
                            {variant.combA08 && (
                              <div className="bg-gray-600/50 p-4 rounded-lg">
                                <p className="text-2xl font-mono text-green-400 flex items-center justify-between">
                                  <span className="text-gray-300 text-sm">Combined</span>
                                  {variant.combA08} {usesMPGe(variant.fuelType2) ? 'MPGe' : 'MPG'}
                                </p>
                              </div>
                            )}
                            {variant.cityA08 && (
                              <div className="bg-gray-600/50 p-4 rounded-lg">
                                <p className="text-2xl font-mono text-blue-400 flex items-center justify-between">
                                  <span className="text-gray-300 text-sm">City</span>
                                  {variant.cityA08} {usesMPGe(variant.fuelType2) ? 'MPGe' : 'MPG'}
                                </p>
                              </div>
                            )}
                            {variant.highwayA08 && (
                              <div className="bg-gray-600/50 p-4 rounded-lg">
                                <p className="text-2xl font-mono text-red-400 flex items-center justify-between">
                                  <span className="text-gray-300 text-sm">Highway</span>
                                  {variant.highwayA08} {usesMPGe(variant.fuelType2) ? 'MPGe' : 'MPG'}
                                </p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Environmental Impact for Alternative Fuel - Only show if data exists */}
                      {(variant.co2A !== null || variant.ghgScoreA !== null) && (
                        <Card className="bg-gray-800 border-gray-700">
                          <CardHeader>
                            <CardTitle className="text-xl text-white flex items-center gap-2">
                              <Leaf className="h-6 w-6 text-green-400" />
                              Environmental Impact ({variant.fuelType2})
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid gap-4">
                              {variant.co2A !== null && (
                                <div className="bg-gray-600/50 p-4 rounded-lg">
                                  <p className="text-2xl font-mono text-orange-400 flex items-center justify-between">
                                    <span className="text-gray-300 text-sm">CO₂ Emissions</span>
                                    {variant.co2A} g/mi
                                  </p>
                                </div>
                              )}
                              {variant.ghgScoreA !== null && (
                                <div className="bg-gray-600/50 p-4 rounded-lg">
                                  <p className="text-2xl font-mono text-green-400 flex items-center justify-between">
                                    <span className="text-gray-300 text-sm">GHG Score</span>
                                    {variant.ghgScoreA}/10
                                  </p>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}

                  {/* PHEV Mode - Only show if available */}
                  {(variant.phevCity || variant.phevHwy || variant.phevComb) && (
                    <div className="mb-12">
                      <Card className="bg-gray-800 border-gray-700">
                        <CardHeader>
                          <CardTitle className="text-xl text-white flex items-center gap-2">
                            <Fuel className="h-6 w-6 text-green-400" />
                            Hybrid Mode Fuel Economy
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid gap-4">
                            {variant.phevComb && (
                              <div className="bg-gray-600/50 p-4 rounded-lg">
                                <p className="text-2xl font-mono text-green-400 flex items-center justify-between">
                                  <span className="text-gray-300 text-sm">Combined</span>
                                  {variant.phevComb} MPGe
                                </p>
                              </div>
                            )}
                            {variant.phevCity && (
                              <div className="bg-gray-600/50 p-4 rounded-lg">
                                <p className="text-2xl font-mono text-blue-400 flex items-center justify-between">
                                  <span className="text-gray-300 text-sm">City</span>
                                  {variant.phevCity} MPGe
                                </p>
                              </div>
                            )}
                            {variant.phevHwy && (
                              <div className="bg-gray-600/50 p-4 rounded-lg">
                                <p className="text-2xl font-mono text-red-400 flex items-center justify-between">
                                  <span className="text-gray-300 text-sm">Highway</span>
                                  {variant.phevHwy} MPGe
                                </p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                      {/* Variant placement after Maximizing Fuel Economy */}
                      <VehiclePageProducts
                        title="More Featured Products*"
                        products={shuffledProducts.slice(3, 6)}
                      />

                  {/* Environmental Performance - Only show if data exists */}
                  {(variant.co2 !== null || variant.ghgScore !== null || variant.co2A !== null || variant.ghgScoreA !== null) && (
                    <section className="space-y-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-6">
                        Environmental Performance
                      </h3>
                      <div className="prose prose-invert max-w-none text-gray-600 space-y-4">
                        {/* Primary Fuel Environmental Info */}
                        {(variant.co2 !== null || variant.ghgScore !== null) && (
                          <p>
                            When using {variant.fuelType1.toLowerCase()}, the {variant.year} {variant.make} {variant.model} with {differentiator.toLowerCase()} has a carbon footprint of {variant.co2} grams of CO₂ per mile.
                            {variant.ghgScore && ` Its Greenhouse Gas Score of ${variant.ghgScore}/10 indicates its relative environmental impact, with higher scores representing lower emissions.`}
                          </p>
                        )}

                        {/* Alternative Fuel Environmental Info */}
                        {(variant.co2A !== null || variant.ghgScoreA !== null) && (
                          <p>
                            When running on {variant.fuelType2?.toLowerCase()}, it produces {variant.co2A} grams of CO₂ per mile
                            {variant.ghgScoreA && ` and achieves a Greenhouse Gas Score of ${variant.ghgScoreA}/10`}.
                          </p>
                        )}

                        {/* General Environmental Info */}
                        {((variant.co2 !== null && variant.ghgScore !== null) || (variant.co2A !== null && variant.ghgScoreA !== null)) && (
                          <p>
                            These environmental metrics reflect the vehicle's efficiency in {differentiator.toLowerCase()} configuration. The CO₂ emissions measurement provides a direct indicator of the vehicle's contribution to greenhouse gases, while the GHG score offers a standardized comparison with other vehicles in its class.
                          </p>
                        )}
                        {variant.startStop === 'Y' && (
                          <p>
                            This variant includes start-stop technology, which can help reduce emissions and fuel consumption during city driving by automatically shutting off the engine when the vehicle is stationary.
                          </p>
                        )}
                      </div>
                    </section>
                  )}

                  {/* Technical Specifications */}
                  <section className="space-y-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-6">
                      Technical Specifications
                    </h3>
                    <div className="prose prose-invert max-w-none text-gray-600">
                      <p>
                        This {variant.VClass.toLowerCase()} with {differentiator.toLowerCase()} features a {variant.displ}L {
                          variant.cylinders ? `${variant.cylinders}-cylinder` : ''
                        } engine and {variant.drive.toLowerCase()} drivetrain.
                        {variant.startStop === 'Y' && ' It includes start-stop technology to improve fuel efficiency in city driving conditions.'}
                        {variant.sCharger === 'S' && ' The engine is supercharged for enhanced performance.'}
                        {variant.tCharger === 'T' && ' And it has a turbocharged engine for improved power and efficiency.'}
                      </p>
                    </div>
                  </section>

                      {/* Ad after Technical Specifications */}
                      <VehiclePageProducts
                        title="More Featured Products*"
                        products={shuffledProducts.slice(3, 6)}
                      />

                  {/* Variant Timeline */}
                  <Card className="bg-gray-800 border-gray-700 mb-8">
                    <CardHeader>
                      <CardTitle className="text-xl text-white flex items-center gap-2">
                        <LineChart className="h-6 w-6 text-blue-400" />
                        {variant.make} {variant.model} {differentiator.toLowerCase()} Historical Fuel Efficiency
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <VehicleTimeline 
                        make={variant.make} 
                        model={variant.model} 
                        drive={variant.drive}
                        fuelType1={variant.fuelType1}
                        fuelType2={variant.fuelType2}
                        transmission={variant.trany}
                        displacement={variant.displ?.toString()}
                      />
                    </CardContent>  
                  </Card>

                </section>
              )
            })}

          {/* Similar Vehicles Section - if exists */}
          {similarVehicles.length > 0 && (
            <section className="border-t border-gray-700 pt-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Vehicles With Similar Fuel Economy
              </h2>
              <div className="grid lg:grid-cols-3 gap-6 mb-4">
                {similarVehicles.slice(0, 3).map((similarVehicle) => {
                  const combinedMPG = similarVehicle.phevComb || similarVehicle.comb08;
                  const mpgSuffix = similarVehicle.phevComb ? 'MPGe' : 
                                   usesMPGe(similarVehicle.fuelType1) ? 'MPGe' : 'MPG';
                  
                  return (
                    <Link 
                      key={`${similarVehicle.year}-${similarVehicle.make}-${similarVehicle.model}`}
                      href={`/vehicles/${similarVehicle.year}-${normalizeForUrl(similarVehicle.make)}-${normalizeForUrl(similarVehicle.model)}-mpg`}
                      className="block group"
                    >
                      <Card className="bg-gray-800 border-gray-700 hover:border-blue-500 transition-all hover:shadow-lg">
                        <CardHeader>
                          <div className="flex items-center justify-between mb-2">
                            <CarFront className="h-8 w-8 text-blue-400 group-hover:text-blue-300 transition-colors" />
                            <div className="bg-gray-700/50 px-3 py-2 rounded-lg">
                              <p className="text-xl font-mono text-green-400 flex items-center gap-2">
                                {combinedMPG} <span className="text-sm">{mpgSuffix}</span>
                              </p>
                            </div>
                          </div>
                          <CardTitle className="text-lg text-white group-hover:text-blue-300 transition-colors">
                            {similarVehicle.year} {similarVehicle.make} {similarVehicle.model}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-400 text-sm">
                            View detailed fuel economy data
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
              <p className="text-gray-500 text-sm">
                These vehicles are in the same class ({vehicle.VClass}) and offer comparable fuel economy ratings.
              </p>
          </section>
        )}

            </div>
          </main>
          
          {/* Tools promo sidebar */}
          <ToolsPromoSidebar width="lg:w-1/3 2xl:w-1/4" className="hidden lg:block" />
        </div>
      </div>
    </>
  )
}

// Add helper to get variant differentiator
function getVariantDifferentiator(mainVehicle: Vehicle, variant: Vehicle): string {
  if (mainVehicle.trany !== variant.trany) {
    return variant.trany.replace('Automatic', 'Auto').replace('Manual', 'Manual')
  }
  return ''
}
