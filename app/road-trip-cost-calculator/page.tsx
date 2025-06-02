import { Metadata } from 'next'
import RoadTripCalculator from '../components/RoadTripCalculator'
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { MapPin, DollarSign } from 'lucide-react'
import EmbedSection from '../components/EmbedSection'
import Script from 'next/script'

// Structured Data Component
const StructuredData = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Road Trip Cost Calculator",
    "applicationCategory": "CalculatorApplication",
    "operatingSystem": "Any",
    "browserRequirements": "Requires JavaScript",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "provider": {
      "@type": "Organization",
      "name": "MPGCalculator.net",
      "url": "https://mpgcalculator.net"
    },
    "description": "Calculate the cost of your next road trip including fuel expenses, tolls, and find hotels along your route with our interactive road trip cost calculator.",
    "featureList": [
      "Calculate fuel costs for road trips",
      "Plan routes with interactive maps",
      "Support for gas, electric, and hybrid vehicles",
      "Toll cost estimation",
      "Customizable fuel efficiency and price inputs"
    ]
  }

  return (
    <Script id="structured-data" type="application/ld+json">
      {JSON.stringify(structuredData)}
    </Script>
  )
}

export const metadata: Metadata = {
  title: 'Road Trip Cost Calculator | Estimate Travel Fuel Expenses',
  description: 'Plan your next journey with our road trip cost calculator. Estimate fuel costs, tolls, and total expenses for your car trip with our free interactive tool.',
  keywords: 'road trip cost calculator, car trip cost calculator, travel fuel cost calculator, fuel expense calculator, trip planner, gas cost calculator',
}

export default function RoadTripCalculatorPage() {
  return (
    <div className="w-full px-4 py-8">
      <StructuredData />
      
      <div className="flex flex-col">
        <main className="w-full">
          {/* Hero Section */}
          <div className="relative mb-12 bg-gradient-to-r from-blue-900 to-blue-800 rounded-2xl p-8 overflow-hidden">
            <div className="relative z-10">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 font-heading">
                Road Trip Cost Calculator
              </h1>
              <p className="text-blue-100 text-lg md:text-xl font-heading max-w-2xl">
                Plan your journey and estimate the total cost of your next road trip
              </p>
            </div>
            {/* Decorative map icon */}
            <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4">
              <MapPin size={300} />
            </div>
          </div>

          {/* Calculator Card */}
          <Card className="bg-gradient-to-r from-gray-100 to-gray-50 border-gray-700 mb-12">
            <CardHeader className="border-b border-gray-700">
              <CardTitle className="text-gray-800 flex items-center gap-2 text-2xl">
                <DollarSign className="h-6 w-6 text-blue-400" />
                Calculate Your Road Trip Costs
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 font-heading">
              <RoadTripCalculator />
            </CardContent>
          </Card>

          {/* Embed Section */}
          <div className="mb-12">
            <EmbedSection />
          </div>

          {/* SEO Content Section */}
          <div className="mt-12 text-gray-900 space-y-6 font-heading">
            <h2 className="text-3xl font-bold font-heading">About the Road Trip Cost Calculator</h2>
            <p>
              Our Road Trip Cost Calculator is designed to help travelers accurately estimate and plan for the expenses of their journey. Whether you're planning a weekend getaway or a cross-country adventure, understanding the costs involved helps you budget effectively and avoid surprises.
            </p>
            
            <h3 className="text-2xl font-semibold mt-6 font-heading">How to Use the Road Trip Calculator</h3>
            <ol className="list-decimal list-inside space-y-2">
              <li><strong>Enter Your Route:</strong> Input your starting point and destination to map your journey.</li>
              <li><strong>Vehicle Details:</strong> Either select your vehicle from our database or enter your vehicle's fuel efficiency manually.</li>
              <li><strong>Additional Costs:</strong> Add toll expenses if applicable to your route.</li>
              <li><strong>Calculate:</strong> Get a comprehensive breakdown of your trip costs.</li>
              <li><strong>Explore the Map:</strong> View your route and discover points of interest along the way.</li>
            </ol>

            <h3 className="text-2xl font-semibold mt-6 font-heading">Factors Affecting Road Trip Costs</h3>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Fuel Efficiency:</strong> Your vehicle's MPG significantly impacts your travel expenses.</li>
              <li><strong>Fuel Prices:</strong> Current gas prices along your route affect total costs.</li>
              <li><strong>Route Selection:</strong> Different routes may have varying distances and toll charges.</li>
              <li><strong>Driving Habits:</strong> Speed and driving style can affect fuel consumption.</li>
              <li><strong>Accommodation:</strong> For longer trips, overnight stays add to your total expenses.</li>
            </ul>

            <h3 className="text-2xl font-semibold mt-6 font-heading">Planning a Budget-Friendly Road Trip</h3>
            <p>
              Using our car trip cost calculator helps you identify ways to save money on your journey. Compare different vehicles to find the most fuel-efficient option, explore alternative routes to avoid tolls, and discover affordable accommodation options along your travel route.
            </p>

            <p className="italic mt-4">
              Our travel fuel cost calculator provides estimates based on your inputs. Actual costs may vary due to changes in fuel prices, traffic conditions, and other factors.
            </p>
          </div>

          {/* Donation Section */}
          <div className="mb-12 bg-gradient-to-r from-rose-200 to-teal-200 dark:from-rose-500/30 dark:to-teal-500/30 rounded-2xl p-4 sm:p-8 border border-rose-300 dark:border-rose-500/30 backdrop-blur-sm shadow-lg">
            <div className="text-center space-y-4">
              <h3 className="text-xl sm:text-2xl font-heading font-semibold bg-gradient-to-r from-rose-700 to-teal-700 inline-block text-transparent bg-clip-text">
                ✨ Enjoying the Calculator? <em>I won't mind a coffee</em> ☕️
              </h3>
              <p className="text-gray-700 dark:text-gray-300 max-w-lg mx-auto text-sm sm:text-base">
                No pressure at all, but if you find this tool helpful, I'd appreciate a coffee. I intend to keep this version of the tool free.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 pt-2">
                <a 
                  href="https://venmo.com/u/NickTCA" 
                  className="px-6 py-2.5 bg-[#008CFF] text-white rounded-full hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 border border-[#008CFF]/20 text-sm sm:text-base"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Venmo
                </a>
                <a 
                  href="https://cash.app/$nickndegwaG" 
                  className="px-6 py-2.5 bg-[#00D632] text-white rounded-full hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 border border-[#00D632]/20 text-sm sm:text-base"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Cash App
                </a>
                <a 
                  href="https://paypal.me/nickndegwaG" 
                  className="px-6 py-2.5 bg-[#0079C1] text-white rounded-full hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 border border-[#0079C1]/20 text-sm sm:text-base"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  PayPal
                </a>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 