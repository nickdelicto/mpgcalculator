import React from 'react'
import MPGCalculator from './components/MPGCalculator'
import MPGCalculatorSchema from './components/MPGCalculatorSchema'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'MPG Calculator | Fuel Efficiency Calculator with Cost Analysis',
  description: 'This free MPG Calculator estimates your vehicle\'s fuel economy & cost of a trip based on distance and gas price.',
  keywords: 'MPG calculator, fuel efficiency calculator, fuel economy, miles per gallon, multi-trip calculator, fuel costs calculator',
}

export default function Home() {
  // This would be set based on whether ads are enabled
  const adsEnabled = false;

  return (
    <>
      <MPGCalculatorSchema />
      <div className={`container mx-auto px-4 py-8 ${adsEnabled ? 'with-ads' : ''}`}>
        <div className="flex flex-col lg:flex-row gap-8">
          <main className={adsEnabled ? 'lg:w-2/3' : 'w-full'}>
            {adsEnabled && <div className="ad-slot mb-8">{ /* Ad code would go here */ }</div>}
            <MPGCalculator />
            <div className="mt-12 text-gray-900 space-y-6 font-heading">
              <h2 className="text-3xl font-bold font-heading">About the MPG Calculator</h2>
              <p>
                Our MPG (Miles Per Gallon) Calculator is a powerful tool designed to help vehicle owners and enthusiasts accurately measure and analyze their fuel efficiency. Whether you're tracking a single trip or comparing multiple journeys, this calculator provides precise insights into your vehicle's performance.
              </p>
              
              {adsEnabled && <div className="ad-slot my-8">{ /* Ad code would go here */ }</div>}
              
              <h3 className="text-2xl font-semibold mt-6 font-heading">How to Use the MPG Calculator</h3>
              <ol className="list-decimal list-inside space-y-2">
                <li><strong>Choose Your Mode:</strong> Select between Simple and Advanced modes to suit your needs.</li>
                <li><strong>Enter Trip Details:</strong> Input the distance traveled and fuel used. In Advanced mode, you can add multiple trips and include fuel costs.</li>
                <li><strong>Select Units:</strong> Choose between miles/gallons or kilometers/liters.</li>
                <li><strong>Calculate:</strong> Click the "Calculate" button to see your results.</li>
                <li><strong>Analyze Results:</strong> View your MPG, and in Advanced mode, see total cost and cost per mile/km.</li>
              </ol>

              {adsEnabled && <div className="ad-slot my-8">{ /* Ad code would go here */ }</div>}

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
          {adsEnabled && (
            <aside className="lg:w-1/3 space-y-8">
              <div className="ad-slot sticky top-8">{ /* Ad code would go here */ }</div>
              <div className="ad-slot sticky top-8">{ /* Ad code would go here */ }</div>
            </aside>
          )}
        </div>
        {adsEnabled && <div className="ad-slot mt-8">{ /* Ad code would go here */ }</div>}
      </div>
    </>
  )
}

