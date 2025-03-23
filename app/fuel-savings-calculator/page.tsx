import { Metadata } from 'next'
import FuelSavingsCalculator from '../components/FuelSavingsCalculator'
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Calculator, DollarSign } from 'lucide-react'
import EmbedSection from '../components/EmbedSection'
import Script from 'next/script'

// Structured Data Component
const StructuredData = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Fuel Savings Calculator",
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
    "description": "Calculate and compare fuel costs between different vehicles. See potential savings over time with our interactive fuel cost savings comparison tool.",
    "featureList": [
      "Compare fuel costs between vehicles",
      "Calculate potential savings over time",
      "Support for gas, electric, and hybrid vehicles",
      "Interactive cost comparison visualization",
      "Customizable mileage and fuel price inputs"
    ]
  }

  return (
    <Script id="structured-data" type="application/ld+json">
      {JSON.stringify(structuredData)}
    </Script>
  )
}

export const metadata: Metadata = {
  title: 'Fuel Savings Calculator | Compare Vehicle Fuel Costs',
  description: 'Use our interactive fuel savings calculator to compare fuel costs between 2 cars and see fuel savings over time.',
  keywords: 'fuel savings calculator, gas savings calculator, ev savings calculator, phev savings calculator, gas vs ev savings calculator, hybrid vs gas cost calculator, fuel efficiency savings, car fuel cost comparison',
}

export default function FuelSavingsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <StructuredData />
      
      <div className="flex flex-col">
        <main className="w-full">
          {/* Hero Section */}
          <div className="relative mb-12 bg-gradient-to-r from-blue-900 to-blue-800 rounded-2xl p-8 overflow-hidden">
            <div className="relative z-10">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 font-heading">
                Fuel Savings Calculator
              </h1>
              <p className="text-blue-100 text-lg md:text-xl font-heading max-w-2xl">
                Compare fuel costs between vehicles and see your potential savings over time
              </p>
            </div>
            {/* Decorative calculator icon */}
            <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4">
              <Calculator size={300} />
            </div>
          </div>

          {/* Calculator Card */}
          <Card className="bg-gradient-to-r from-gray-900 to-gray-800 border-gray-700 mb-12">
            <CardHeader className="border-b border-gray-700">
              <CardTitle className="text-white flex items-center gap-2 text-2xl">
                <DollarSign className="h-6 w-6 text-green-400" />
                Calculate Your Fuel Savings
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 font-heading">
              <FuelSavingsCalculator />
            </CardContent>
          </Card>

          {/* Embed Section */}
          <div className="mb-12">
            <EmbedSection />
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