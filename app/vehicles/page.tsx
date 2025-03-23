import { Metadata } from 'next'
import VehicleLookupWrapper from '../components/VehicleLookupWrapper'
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { CarFront, Gauge, Leaf, Info } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Vehicle MPG Directory | Search Fuel Economy Data',
  description: 'Lookup fuel consumption and MPG by car model. Find and compare fuel efficiency for various vehicle models.',
  keywords: 'fuel consumption comparison, fuel consumption calculator by car model, vehicle MPG lookup, car fuel efficiency, gas mileage calculator by make and model,',
}

export default function VehiclesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="relative mb-12 bg-gradient-to-r from-blue-900 to-blue-800 rounded-2xl p-8 overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 font-heading">
            Vehicle MPG Directory
          </h1>
          <p className="text-blue-100 text-lg md:text-xl font-heading max-w-2xl">
            Find detailed fuel economy data and environmental impact information for any vehicle
          </p>
        </div>
        {/* Decorative car silhouette */}
        <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4">
          <CarFront size={300} />
        </div>
      </div>

      <div className="flex flex-col">
        <main className="w-full">
          {/* Search Card */}
          <Card className="bg-gray-800 border-gray-700 mb-12">
            <CardHeader className="border-b border-gray-700">
              <CardTitle className="text-white flex items-center gap-2 text-2xl">
                <Gauge className="h-6 w-6 text-blue-400" />
                Search Vehicle Database
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <VehicleLookupWrapper />
            </CardContent>
          </Card>

          {/* Information Section */}
          <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-6 font-heading flex items-center gap-2">
              <Info className="h-6 w-6 text-green-400" />
              About Our Vehicle Directory
            </h2>
            
            <div className="text-gray-300 space-y-6 font-heading">
              <p className="text-lg">
                Access our comprehensive database of vehicles to find detailed information about:
              </p>
              
              <div className="grid md:grid-cols-2 gap-8">
                {/* EPA Ratings Card */}
                <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Gauge className="h-5 w-5 text-blue-400" />
                    Fuel Economy Metrics
                  </h3>
                  <ul className="space-y-3 text-gray-300">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full" />
                      <span>City, Highway, and Combined MPG/MPGe</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full" />
                      <span>Alternative Fuel Performance Data</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full" />
                      <span>Hybrid and Electric Vehicle Ratings</span>
                    </li>
                  </ul>
                </div>

                {/* Environmental Impact Card */}
                <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Leaf className="h-5 w-5 text-green-400" />
                    Environmental Impact
                  </h3>
                  <ul className="space-y-3 text-gray-300">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full" />
                      <span>Greenhouse Gas Scores</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full" />
                      <span>CO₂ Emissions Data</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full" />
                      <span>Environmental Performance Metrics</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-blue-900/20 rounded-xl p-6 border border-blue-800/30 mt-8">
                <p className="text-blue-100">
                  <span className="font-semibold">Getting Started:</span> Select a make, model, and year above to view complete vehicle details and compare with similar vehicles in its class. Our database includes comprehensive information about fuel efficiency, environmental impact, and technical specifications.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 
