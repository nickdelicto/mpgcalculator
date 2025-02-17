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
    </div>
  )
} 