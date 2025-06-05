import React from 'react'
import MPGCalculator from './components/MPGCalculator'
import MPGCalculatorSchema from './components/MPGCalculatorSchema'
import { Metadata } from 'next'
import { Footer } from './components/Footer'
import Image from 'next/image'
import FloatingRoadTripPromo from './components/FloatingRoadTripPromo'
import ToolsPromoSidebar from './components/ToolsPromoSidebar'

export const metadata: Metadata = {
  title: 'MPG Calculator | Fuel Efficiency Calculator with Cost Analysis',
  description: 'This free MPG Calculator estimates your vehicle\'s fuel economy & cost of a trip based on distance and gas price.',
  keywords: 'MPG calculator, fuel efficiency calculator, fuel economy, miles per gallon, multi-trip calculator, fuel costs calculator',
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
            <h1 className="text-3xl font-bold mb-6 text-blue-900 font-heading">MPG Calculator: Estimate Your Vehicle's Fuel Economy</h1>
            
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
                  <h2 className="text-2xl md:text-3xl font-bold mb-2 font-heading">Plan Your Next Adventure With Our Road Trip Cost Calculator</h2>
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
                      <span className="mr-2 text-yellow-400">✓</span> Find & book hotels, attractions, and more along the way!&nbsp;&nbsp;<span className="text-gray-300 text-xs">(Coming soon)</span>
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
            
            <div className="mt-12 text-gray-900 space-y-6 font-heading">
              <h2 className="text-3xl font-bold font-heading">About the MPG Calculator</h2>
              <p>
                Our MPG (Miles Per Gallon) Calculator is a powerful tool designed to help vehicle owners and enthusiasts accurately measure and analyze their fuel efficiency. Whether you're tracking a single trip or comparing multiple journeys, this calculator provides precise insights into your vehicle's performance.
              </p>
              
              <h3 className="text-2xl font-semibold mt-6 font-heading">How to Use the MPG Calculator</h3>
              <ol className="list-decimal list-inside space-y-2">
                <li><strong>Choose Your Mode:</strong> Select between Simple and Advanced modes to suit your needs.</li>
                <li><strong>Enter Trip Details:</strong> Input the distance traveled and fuel used. In Advanced mode, you can add multiple trips and include fuel costs.</li>
                <li><strong>Select Units:</strong> Choose between miles/gallons or kilometers/liters.</li>
                <li><strong>Calculate:</strong> Click the "Calculate" button to see your results.</li>
                <li><strong>Analyze Results:</strong> View your MPG, and in Advanced mode, see total cost and cost per mile/km.</li>
              </ol>

              <h3 className="text-2xl font-semibold mt-6 font-heading">Why Use Our MPG Calculator?</h3>
              <ul className="list-disc list-inside space-y-2">
                <li><strong>Accuracy:</strong> Our calculator uses precise formulas to ensure reliable results.</li>
                <li><strong>Flexibility:</strong> Supports both US and metric units for global usability.</li>
                <li><strong>Cost Analysis:</strong> Advanced mode helps you understand your fuel expenses.</li>
                <li><strong>Multiple Trips:</strong> Compare efficiency across different journeys or vehicles.</li>
                <li><strong>User-Friendly:</strong> Intuitive interface for easy calculations.</li>
              </ul>

              <h3 className="text-2xl font-semibold mt-6 font-heading">Understanding MPG</h3>
              <p>
                MPG, or Miles Per Gallon, is a measure of how far a vehicle can travel on one gallon of fuel. A higher MPG indicates better fuel efficiency, which can lead to cost savings and reduced environmental impact. Factors affecting MPG include driving habits, vehicle maintenance, road conditions, and vehicle specifications.
              </p>

              <p className="italic mt-4">
                Use our MPG Calculator regularly to track your vehicle's efficiency, identify trends, and make informed decisions about your driving habits and vehicle maintenance.
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

