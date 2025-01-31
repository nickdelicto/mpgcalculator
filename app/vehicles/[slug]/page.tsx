import { Metadata } from 'next'
import { Vehicle } from '../../types/vehicle'
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Fuel, CarFront, Leaf } from 'lucide-react'
import VehicleComparison from '../../components/VehicleComparison'
import Link from 'next/link'

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
  if (vehicle.combA08) return vehicle.combA08
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
  // Await params before accessing
  const resolvedParams = await params
  const [year, make, model] = resolvedParams.slug.split('-')
  
  return {
    title: `${year} ${make} ${model} MPG - Fuel Economy Data & Ratings`,
    description: `Get official ${year} ${make} ${model} MPG ratings. View detailed city, highway, and combined fuel economy data, emissions information, and compare with similar vehicles.`,
    keywords: `${year} ${make} ${model} mpg, ${year} ${make} ${model} fuel economy, ${make} ${model} gas mileage, ${make} ${model} fuel efficiency`,
  }
}

async function getVehicleData(slug: string): Promise<Vehicle | null> {
  // Remove the "-mpg" suffix first
  const slugWithoutSuffix = slug.replace(/-mpg$/, '')
  
  // Extract year and remaining parts
  const [year, ...parts] = slugWithoutSuffix.split('-')
  
  // Find the make by checking for special makes first
  let make = ''
  let modelParts = [...parts]
  
  // Try to match special makes first (case-insensitive)
  for (let i = 1; i <= parts.length; i++) {
    const possibleMake = parts.slice(0, i).join('-').toLowerCase()
    if (SPECIAL_MAKES.has(possibleMake)) {
      // Use the original casing from the URL for the make
      make = parts.slice(0, i).join('-')
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
    
    return data[0] || null
  } catch (error) {
    console.error('Error fetching vehicle:', error)
    return null
  }
}

async function getSimilarVehicles(vehicle: Vehicle): Promise<Vehicle[]> {
  try {
    const url = new URL('/api/vehicles/similar-mpg', baseUrl)
    url.search = new URLSearchParams({
      mpg: vehicle.comb08.toString(),
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

export default async function VehiclePage({ params }: Props) {
  // Await params before accessing
  const resolvedParams = await params
  const vehicle = await getVehicleData(resolvedParams.slug)
  
  if (!vehicle) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-6">Vehicle Not Found</h1>
        <p className="text-gray-300">Sorry, we couldn't find the vehicle you're looking for.</p>
      </div>
    )
  }

  const similarVehicles = await getSimilarVehicles(vehicle)
  const bestCombinedMPG = getBestCombinedMPG(vehicle)
  const mpgSuffix = usesMPGe(vehicle.fuelType1) ? 'MPGe' : 'MPG'

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Title */}
      <h1 className="text-3xl font-bold text-white mb-6">
        {vehicle.year} {vehicle.make} {vehicle.model} MPG & Fuel Economy
      </h1>

      {/* Quick Summary */}
      <Card className="bg-gray-800 border-gray-700 mb-8">
        <CardHeader>
          <CardTitle className="text-xl text-white flex items-center gap-2">
            <CarFront className="h-6 w-6 text-blue-400" />
            Quick Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-200">
            The {vehicle.year} {vehicle.make} {vehicle.model} achieves {bestCombinedMPG} {mpgSuffix} combined.
            This {vehicle.fuelType1.toLowerCase()}-powered vehicle offers{' '}
            {vehicle.city08} {mpgSuffix} in the city and {vehicle.highway08} {mpgSuffix} on the highway.
          </p>
        </CardContent>
      </Card>

      {/* Main MPG Data */}
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        {/* Primary Fuel Economy */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-xl text-white flex items-center gap-2">
              <Fuel className="h-6 w-6 text-yellow-400" />
              {vehicle.fuelType1} Fuel Economy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="bg-gray-700/50 p-4 rounded-lg">
                <p className="text-2xl font-mono text-green-400 flex items-center justify-between">
                  <span className="text-gray-300 text-sm">Combined</span>
                  {vehicle.comb08} {mpgSuffix}
                </p>
              </div>
              <div className="bg-gray-700/50 p-4 rounded-lg">
                <p className="text-2xl font-mono text-blue-400 flex items-center justify-between">
                  <span className="text-gray-300 text-sm">City</span>
                  {vehicle.city08} {mpgSuffix}
                </p>
              </div>
              <div className="bg-gray-700/50 p-4 rounded-lg">
                <p className="text-2xl font-mono text-red-400 flex items-center justify-between">
                  <span className="text-gray-300 text-sm">Highway</span>
                  {vehicle.highway08} {mpgSuffix}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Environmental Impact */}
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
                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <p className="text-2xl font-mono text-orange-400 flex items-center justify-between">
                    <span className="text-gray-300 text-sm">CO₂ Emissions</span>
                    {vehicle.co2} g/mi
                  </p>
                </div>
              )}
              {vehicle.ghgScore !== null && (
                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <p className="text-2xl font-mono text-green-400 flex items-center justify-between">
                    <span className="text-gray-300 text-sm">GHG Score</span>
                    {vehicle.ghgScore}/10
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
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
                    <div className="bg-gray-700/50 p-4 rounded-lg">
                      <p className="text-2xl font-mono text-green-400 flex items-center justify-between">
                        <span className="text-gray-300 text-sm">Combined</span>
                        {vehicle.combA08} {usesMPGe(vehicle.fuelType2) ? 'MPGe' : 'MPG'}
                      </p>
                    </div>
                  )}
                  {vehicle.cityA08 && (
                    <div className="bg-gray-700/50 p-4 rounded-lg">
                      <p className="text-2xl font-mono text-blue-400 flex items-center justify-between">
                        <span className="text-gray-300 text-sm">City</span>
                        {vehicle.cityA08} {usesMPGe(vehicle.fuelType2) ? 'MPGe' : 'MPG'}
                      </p>
                    </div>
                  )}
                  {vehicle.highwayA08 && (
                    <div className="bg-gray-700/50 p-4 rounded-lg">
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
                  <h4 className="text-sm font-semibold text-emerald-300">Environmental Impact</h4>
                  <div className="grid gap-4">
                    {vehicle.co2A !== null && (
                      <div className="bg-gray-700/50 p-4 rounded-lg">
                        <p className="text-xl font-mono text-orange-400 flex items-center justify-between">
                          <span className="text-gray-300 text-sm">CO₂ Emissions</span>
                          {vehicle.co2A} g/mi
                        </p>
                      </div>
                    )}
                    {vehicle.ghgScoreA !== null && (
                      <div className="bg-gray-700/50 p-4 rounded-lg">
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
                    <div className="bg-gray-700/50 p-4 rounded-lg">
                      <p className="text-2xl font-mono text-green-400 flex items-center justify-between">
                        <span className="text-gray-300 text-sm">Combined</span>
                        {vehicle.phevComb} MPGe
                      </p>
                    </div>
                  )}
                  {vehicle.phevCity && (
                    <div className="bg-gray-700/50 p-4 rounded-lg">
                      <p className="text-2xl font-mono text-blue-400 flex items-center justify-between">
                        <span className="text-gray-300 text-sm">City</span>
                        {vehicle.phevCity} MPGe
                      </p>
                    </div>
                  )}
                  {vehicle.phevHwy && (
                    <div className="bg-gray-700/50 p-4 rounded-lg">
                      <p className="text-2xl font-mono text-red-400 flex items-center justify-between">
                        <span className="text-gray-300 text-sm">Highway</span>
                        {vehicle.phevHwy} MPGe
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-emerald-300">PHEV Features</h4>
                <div className="grid gap-4">
                  <div className="bg-gray-700/50 p-4 rounded-lg">
                    <p className="text-gray-300">
                      <span className="font-semibold">Blended Operation:</span>{' '}
                      {vehicle.phevBlended ? 
                        'This PHEV can blend electric and gas power for optimal efficiency.' :
                        'This PHEV operates in distinct electric and gas modes.'}
                    </p>
                  </div>
                  {vehicle.startStop === 'Y' && (
                    <div className="bg-gray-700/50 p-4 rounded-lg">
                      <p className="text-gray-300">
                        <span className="font-semibold">Start-Stop Technology:</span>{' '}
                        Equipped with start-stop technology to reduce idle fuel consumption.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comparison Tool */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-6">Compare with Other Vehicles</h2>
        <VehicleComparison />
      </section>

      {/* Similar Vehicles Section */}
      {similarVehicles.length > 0 && (
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">
            Similar Vehicles with Comparable Fuel Economy
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {similarVehicles.map((similarVehicle) => (
              <Link 
                key={`${similarVehicle.year}-${similarVehicle.make}-${similarVehicle.model}`}
                href={`/vehicles/${similarVehicle.year}-${normalizeForUrl(similarVehicle.make)}-${normalizeForUrl(similarVehicle.model)}-mpg`}
                className="block"
              >
                <Card className="bg-gray-800 border-gray-700 hover:border-blue-500 transition-colors">
                  <CardHeader>
                    <CardTitle className="text-lg text-white">
                      {similarVehicle.year} {similarVehicle.make} {similarVehicle.model}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid gap-2">
                        <div className="bg-gray-700/50 p-3 rounded-lg">
                          <p className="text-xl font-mono text-green-400 flex items-center justify-between">
                            <span className="text-gray-300 text-sm">Combined</span>
                            {similarVehicle.comb08} {usesMPGe(similarVehicle.fuelType1) ? 'MPGe' : 'MPG'}
                          </p>
                        </div>
                        <div className="bg-gray-700/50 p-3 rounded-lg">
                          <p className="text-xl font-mono text-blue-400 flex items-center justify-between">
                            <span className="text-gray-300 text-sm">City</span>
                            {similarVehicle.city08} {usesMPGe(similarVehicle.fuelType1) ? 'MPGe' : 'MPG'}
                          </p>
                        </div>
                        <div className="bg-gray-700/50 p-3 rounded-lg">
                          <p className="text-xl font-mono text-red-400 flex items-center justify-between">
                            <span className="text-gray-300 text-sm">Highway</span>
                            {similarVehicle.highway08} {usesMPGe(similarVehicle.fuelType1) ? 'MPGe' : 'MPG'}
                          </p>
                        </div>
                      </div>
                      {similarVehicle.ghgScore !== null && (
                        <div className="bg-gray-700/50 p-3 rounded-lg">
                          <p className="text-lg font-mono text-green-400 flex items-center justify-between">
                            <span className="text-gray-300 text-sm">GHG Score</span>
                            {similarVehicle.ghgScore}/10
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          <p className="text-gray-300 mt-4">
            These vehicles are in the same class ({vehicle.VClass}) and offer similar fuel economy ratings.
            Click on any vehicle to view its detailed MPG data and specifications.
          </p>
        </section>
      )}

      {/* SEO Content Sections */}
      <div className="space-y-8 text-gray-300">
        {/* Vehicle Overview */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">
            {vehicle.year} {vehicle.make} {vehicle.model} Fuel Economy Overview
          </h2>
          <div className="prose prose-invert max-w-none">
            <p>
              The {vehicle.year} {vehicle.make} {vehicle.model} is a {vehicle.VClass.toLowerCase()} that 
              achieves {bestCombinedMPG} {mpgSuffix} combined fuel economy. This {vehicle.fuelType1.toLowerCase()}-powered
              vehicle delivers {vehicle.city08} {mpgSuffix} in city driving conditions and {vehicle.highway08} {mpgSuffix} on
              the highway.
            </p>
            {vehicle.fuelType2 && (
              <p className="mt-4">
                As a multi-fuel vehicle, it also supports {vehicle.fuelType2.toLowerCase()} operation
                {vehicle.combA08 && ` with a combined rating of ${vehicle.combA08} ${usesMPGe(vehicle.fuelType2) ? 'MPGe' : 'MPG'}`}.
                This flexibility provides drivers with more options for efficient and environmentally conscious travel.
              </p>
            )}
            {vehicle.phevComb && (
              <p className="mt-4">
                With its plug-in hybrid capability, this vehicle achieves an impressive {vehicle.phevComb} MPGe in combined
                driving conditions when utilizing both electricity and {vehicle.fuelType1.toLowerCase()}. This advanced
                powertrain technology significantly enhances fuel efficiency and reduces environmental impact.
              </p>
            )}
          </div>
        </section>

        {/* Environmental Impact */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">
            Environmental Performance
          </h2>
          <div className="prose prose-invert max-w-none">
            {vehicle.ghgScore && (
              <p>
                With a Greenhouse Gas Score of {vehicle.ghgScore}/10, this vehicle {
                  vehicle.ghgScore >= 7 ? 'demonstrates excellent' :
                  vehicle.ghgScore >= 5 ? 'shows average' :
                  'has below average'
                } environmental performance in its class. {
                  vehicle.ghgScore >= 7 ? 'This high score indicates a significant reduction in greenhouse gas emissions compared to other vehicles.' :
                  vehicle.ghgScore >= 5 ? 'This score suggests typical greenhouse gas emissions for vehicles in this category.' :
                  'There may be more environmentally friendly alternatives available in this vehicle class.'
                }
              </p>
            )}
            {vehicle.co2 && (
              <p className="mt-4">
                The vehicle produces approximately {vehicle.co2} grams of CO₂ per mile under typical driving conditions.
                {vehicle.co2 < 250 ? ' This is a relatively low carbon footprint for its class.' :
                 vehicle.co2 < 350 ? ' This represents average carbon emissions for its vehicle type.' :
                 ' Consider more fuel-efficient alternatives if environmental impact is a priority.'}
              </p>
            )}
          </div>
        </section>

        {/* Technical Specifications */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">
            Technical Specifications
          </h2>
          <div className="prose prose-invert max-w-none">
            <p>
              This {vehicle.VClass.toLowerCase()} features a {vehicle.displ}L {
                vehicle.cylinders ? `${vehicle.cylinders}-cylinder` : ''
              } engine, paired with a {vehicle.trany.toLowerCase()} transmission and {vehicle.drive.toLowerCase()} drivetrain.
              {vehicle.startStop === 'Y' && ' It includes start-stop technology to improve fuel efficiency in city driving conditions.'}
              {vehicle.sCharger === 'Y' && ' The engine is supercharged for enhanced performance.'}
              {vehicle.tCharger === 'Y' && ' The turbocharged engine provides improved power and efficiency.'}
            </p>
          </div>
        </section>

        {/* Fuel Economy Tips */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">
            Maximizing Fuel Economy
          </h2>
          <div className="prose prose-invert max-w-none">
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
      </div>
    </div>
  )
} 
