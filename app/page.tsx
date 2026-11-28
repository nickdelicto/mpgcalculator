import React from 'react'
import MPGCalculator from './components/MPGCalculator'
import MPGCalculatorSchema from './components/MPGCalculatorSchema'
import { Metadata } from 'next'
import { Footer } from './components/Footer'
import Image from 'next/image'
import FloatingRoadTripPromo from './components/FloatingRoadTripPromo'
import ToolsPromoSidebar from './components/ToolsPromoSidebar'
import MpgGuide from './components/MpgGuide'

export const metadata: Metadata = {
  alternates: { canonical: 'https://mpgcalculator.net' },
  title: 'MPG Calculator - Free Gas Mileage and Fuel Cost Calculator',
  description: 'Calculate your miles per gallon in seconds. Enter miles and gallons to get your MPG, cost per mile and fuel cost, plus how to calculate gas mileage by hand.',
  keywords: 'MPG calculator, gas mileage calculator, miles per gallon calculator, how to calculate miles per gallon, fuel cost calculator, fuel economy calculator',
  openGraph: { title: 'MPG Calculator - Free Gas Mileage and Fuel Cost Calculator', description: 'Work out your miles per gallon, cost per mile and fuel cost. Free, no sign-up.', url: 'https://mpgcalculator.net', siteName: 'MPGCalculator.net', type: 'website' },
}

export default function Home() {
  return (
    <>
      <MPGCalculatorSchema />
      <FloatingRoadTripPromo />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main content area - Adjusted width for large screens */}
          <main className="w-full lg:w-2/3">
            {/* Main page heading - Added for SEO */}
            <h1 className="text-3xl font-bold mb-2 text-blue-900 font-heading">MPG Calculator</h1>
            <p className="text-gray-700 mb-6">Free gas mileage calculator. Enter the miles you drove and the gallons you used to get your miles per gallon, cost per mile and fuel cost.</p>
            
            {/* Calculator component */}
            <MPGCalculator />
            
            {/* Road Trip Calculator Promo Banner */}
            <div className="mt-10 mb-12 bg-gradient-to-r from-blue-600 to-indigo-800 rounded-xl overflow-hidden shadow-2xl border border-blue-400 relative">
              <div className="absolute right-0 top-0 w-1/3 h-full overflow-hidden opacity-10">
                <svg viewBox="0 0 24 24" fill="none" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L4 8V20H20V8L12 2Z" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 14V20H15V14L12 12L9 14Z" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M4 8H20" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              
              <div className="flex flex-col md:flex-row items-center py-6 px-8">
                <div className="md:w-2/3 text-white z-10">
                  <div className="inline-block bg-yellow-500 text-blue-900 font-bold text-xs px-3 py-1 rounded-full mb-3">FREE NEW TOOL</div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-2 font-heading">Plan your next trip with the Road Trip Cost Calculator</h2>
                  <p className="text-blue-100 mb-4">Estimate fuel costs, find hotels, and visualize your route with our interactive road trip planner!</p>
                  <ul className="mb-6 text-sm space-y-1 text-blue-100">
                    <li className="flex items-center">
                      <span className="mr-2 text-yellow-400">✓</span> Calculate fuel expenses for any vehicle
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2 text-yellow-400">✓</span> Interactive maps with real routes
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2 text-yellow-400">✓</span> Estimate total trip costs including tolls
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2 text-yellow-400">✓</span> Find hotels, attractions and overnight stops along the way
                    </li>
                  </ul>
                  <a href="/road-trip-cost-calculator" className="inline-block bg-yellow-500 hover:bg-yellow-400 text-blue-900 font-bold px-6 py-3 rounded-lg transition-all transform hover:-translate-y-1 hover:shadow-xl">
                    Plan Your Trip Now →
                  </a>
                </div>
                <div className="md:w-1/3 mt-6 md:mt-0 flex justify-center">
                  <div className="bg-white bg-opacity-10 p-2 rounded-lg shadow-inner transform rotate-3 hover:rotate-0 transition-transform">
                    <img src="/Website-Logo.png" alt="Road Trip Calculator Preview" className="w-52 h-auto rounded" />
                  </div>
                </div>
              </div>
            </div>
            
            <MpgGuide />

            <div className="mt-12 text-gray-900 space-y-3">
              <h2 className="text-2xl font-bold font-heading text-blue-900">Using this calculator</h2>
              <p>
                <strong>Simple mode</strong> takes one trip: miles and gallons. <strong>Advanced mode</strong> adds several fill-ups and your fuel price, then shows your
                average MPG, total cost and cost per mile. Both work in miles and gallons or kilometers and liters, and nothing you enter is stored.
              </p>
            </div>
          </main>
          
          {/* Tools promo sidebar - using the new component */}
          <ToolsPromoSidebar width="lg:w-1/3" className="hidden lg:block" />
        </div>
      </div>
    </>
  )
}

