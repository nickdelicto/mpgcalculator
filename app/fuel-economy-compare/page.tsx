import { Metadata } from 'next'
import { Suspense } from 'react'
import VehicleComparison from '../components/VehicleComparison'
import SearchParamsWrapper from '../components/SearchParamsWrapper'

export const metadata: Metadata = {
  title: 'Compare Vehicle Fuel Economy | MPG Comparison Tool',
  description: 'Compare fuel efficiency, emissions, and specifications between different vehicles side by side. Find the most efficient vehicle for your needs.',
  keywords: 'Vehicle MPG comparison, fuel economy compare, car comparison tool, vehicle efficiency comparison, fuel consumption comparison',
}

function LoadingState() {
  return (
    <div className="text-center py-12 bg-gray-800 rounded-lg border border-gray-700">
      <p className="text-gray-300">Loading comparison tool...</p>
    </div>
  )
}

export default function FuelEconomyComparePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col">
        <main className="w-full">
          <h1 className="text-3xl font-heading font-bold text-gray-800 mb-6">
            Compare Vehicle Fuel Economy
          </h1>
          <p className="text-gray-600 mb-8 font-sans">
            Select up to three vehicles to compare MPG, side by side.
          </p>

          <Suspense fallback={<LoadingState />}>
            <SearchParamsWrapper>
              <VehicleComparison />
            </SearchParamsWrapper>
          </Suspense>

          {/* Road Trip Calculator Promo - Contextually Relevant */}
          <div className="bg-gradient-to-r from-green-600 to-blue-700 rounded-lg shadow-xl mt-10 mb-8 overflow-hidden">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-2/3 p-6 md:p-8">
                <h2 className="text-white text-2xl font-bold mb-2 font-heading">Compare & Plan: Ready for a Road Trip?</h2>
                <p className="text-green-100 mb-4">Now that you've compared vehicles, take the next step! Estimate how much your road trip will cost with our interactive tool.</p>
                <div className="bg-white/10 p-4 rounded-lg mb-4">
                  <ul className="space-y-2 text-sm text-white">
                    <li className="flex items-start">
                      <div className="mr-2 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center mt-0.5 flex-shrink-0">✓</div>
                      <span>Enter your vehicle's MPG from the comparison above</span>
                    </li>
                    <li className="flex items-start">
                      <div className="mr-2 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center mt-0.5 flex-shrink-0">✓</div>
                      <span>Plan your route with our interactive map</span>
                    </li>
                    <li className="flex items-start">
                      <div className="mr-2 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center mt-0.5 flex-shrink-0">✓</div>
                      <span>Get accurate fuel costs based on current prices</span>
                    </li>
                    <li className="flex items-start">
                      <div className="mr-2 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center mt-0.5 flex-shrink-0">✓</div>
                      <span>Find & book hotels, attractions, and more along the way!&nbsp;&nbsp;<span className="text-gray-300 text-xs">(Coming soon)</span></span>
                    </li>
                  </ul>
                </div>
                <a href="/road-trip-cost-calculator" className="inline-flex items-center px-5 py-3 bg-white text-green-700 font-bold rounded-lg hover:bg-green-100 transition-colors shadow-md">
                  Calculate Trip Costs
                  <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>
              <div className="md:w-1/3 bg-blue-900/30 p-6 flex items-center justify-center h-full">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-green-400 rounded-lg blur opacity-25"></div>
                  <div className="relative bg-white rounded-lg overflow-hidden shadow-lg transform rotate-1 hover:rotate-0 transition-transform duration-300">
                    <div className="p-1">
                      <div className="p-2 bg-gradient-to-r from-blue-50 to-green-50 rounded">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        </div>
                        <div className="h-24 bg-blue-100 rounded flex items-center justify-center">
                          <span className="text-sm text-blue-800 font-mono">Map with Route</span>
                        </div>
                        <div className="mt-2 h-8 bg-gray-100 rounded"></div>
                        <div className="mt-2 h-6 bg-gray-100 rounded w-3/4"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Expert Guide and FAQs */}
          <div className="text-gray-600 p-8 rounded-lg space-y-8 mt-8 font-heading">
            <h2 className="text-2xl font-heading font-bold text-gray-800">Guide to Vehicle Fuel Economy Comparison</h2>
            <p>
              Here's how to use our vehicle mpg comparison tool as well as make sense of the data.
            </p>

            <h3 className="text-xl font-heading font-semibold text-gray-800">How to Use the Comparison Tool</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li><strong>Select Vehicles</strong>: Start by selecting up to three vehicles you wish to compare. Use the search function to find specific makes and models.
                <br/><em>Example</em>: Compare a 2022 Toyota Camry, a 2022 Honda Accord, and a 2022 Tesla Model 3 to see how they stack up in terms of fuel efficiency.
              </li>
              <li><strong>Understand the Metrics</strong>: The tool displays key metrics such as combined, city, and highway fuel economy.
                <br/><em>Illustration</em>: A bar graph showing the MPG/MPGe for each vehicle in different driving conditions.
              </li>
              <li><strong>Analyze Dual-Fuel Vehicles</strong>: For vehicles with dual-fuel capabilities, examine both fuel economy ratings to understand total efficiency.
                <br/><em>Example</em>: A plug-in hybrid might show 50 MPGe in electric mode and 30 MPG in gasoline mode.
              </li>
              <li><strong>Consider Your Driving Patterns</strong>: Use the city vs. highway ratings to determine which vehicle suits your driving habits best.
                <br/><em>Tip</em>: If you mostly drive in urban areas, focus on city MPG ratings.
              </li>
            </ul>

            <h3 className="text-xl font-heading font-semibold text-gray-800">Making Sense of Different Fuel Types</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li><strong>Gasoline/Diesel</strong>: Measured in MPG, these are traditional fuel types.</li>
              <li><strong>Electric Vehicles</strong>: Measured in MPGe, which equates electrical energy to gasoline.</li>
              <li><strong>Hybrids</strong>: Combine fuel type 1 and fuel type 2 MPG(e) ratings for a comprehensive/normalized view of efficiency.</li>
            </ul>

            <h3 className="text-xl font-heading font-semibold text-gray-800">Understanding Total Cost of Ownership</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li><strong>Annual Fuel Costs</strong>: Calculate based on your driving patterns and local fuel prices.</li>
              <li><strong>Fuel Price Volatility</strong>: Consider how fluctuating prices might impact your budget.</li>
              <li><em>Example</em>: Compare the cost of driving a gasoline vehicle vs. an electric vehicle over a year.</li>
            </ul>

            <h3 className="text-xl font-heading font-semibold text-gray-800">Frequently Asked Questions</h3>
            <div className="space-y-4 text-gray-600">
              <div>
                <h4 className="font-semibold">Why do hybrid vehicles show multiple fuel economy ratings?</h4>
                <p>Hybrid vehicles display separate ratings because they operate in different modes. The standard MPG rating shows efficiency when running on gasoline, while MPGe ratings indicate efficiency in electric mode. This dual rating helps you understand efficiency across all operating conditions.</p>
              </div>
              <div>
                <h4 className="font-semibold">What's the difference between city and highway MPG?</h4>
                <p>City MPG ratings are typically lower due to frequent stops and starts, lower average speeds, and more idle time. Highway ratings are usually higher due to consistent speeds and less braking. Choose based on your primary driving environment.</p>
              </div>
              <div>
                <h4 className="font-semibold">How is MPGe calculated for electric vehicles?</h4>
                <p>MPGe (Miles Per Gallon equivalent) converts electrical energy to a gasoline equivalent: 33.7 kilowatt-hours (kWh) = 1 gallon of gasoline energy. This standardized measure helps compare electric vehicles with conventional ones. Focus on MPGe when comparing electric vehicles or plug-in hybrids.</p>
              </div>
              <div>
                <h4 className="font-semibold">Why do similar vehicles have different fuel economies?</h4>
                <p>Several factors create efficiency differences: aerodynamic design variations, weight differences, powertrain optimization, transmission tuning, and tire specifications.</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 