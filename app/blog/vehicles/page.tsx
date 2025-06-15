import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Vehicle Guides | MPGCalculator.net Blog',
  description: 'Explore our collection of vehicle guides with fuel efficiency tips, maintenance advice, and information on the best cars for road trips.',
}

export default function VehiclesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Category Header */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-8 text-white">
          <Link href="/blog" className="text-gray-300 hover:text-white mb-2 inline-block">
            ← Back to Blog Home
          </Link>
          <h2 className="text-3xl font-bold mb-2">Vehicle Guides</h2>
          <p className="text-xl text-gray-200">Expert advice on fuel efficiency, maintenance, and choosing the right car</p>
        </div>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-8">
        <main className="w-full lg:w-2/3">
          {/* Category Introduction */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
            <h1 className="text-2xl font-bold mb-4 text-gray-900">
              Make Smart Vehicle Choices
            </h1>
            <p className="text-gray-700 mb-4">
              Our vehicle guides help you make informed decisions about your car, whether you're looking to maximize fuel efficiency, perform proper maintenance, or choose the best vehicle for your next road trip. Each guide provides expert advice, practical tips, and data-driven recommendations.
            </p>
            <p className="text-gray-700">
              From electric vehicles to gas-powered cars, SUVs to compact models, we offer insights that will help you save money and get the most out of your vehicle.
            </p>
          </div>
          
          {/* Featured Vehicle Guide */}
          <div className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Featured Vehicle Guide</h2>
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl overflow-hidden border border-gray-200">
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Coming Soon</h3>
                <p className="text-gray-700 mb-4">
                  We're working on detailed vehicle guides with fuel efficiency ratings, maintenance tips, and recommendations for different travel needs. Check back soon for our featured guides!
                </p>
                <div className="flex items-center text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Coming soon</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* All Vehicle Guides */}
          <div>
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">All Vehicle Guides</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Placeholder for future articles */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="h-40 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-gray-400">Image Coming Soon</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Coming Soon</h3>
                <p className="text-gray-600 mb-4">
                  Our team is creating comprehensive vehicle guides with fuel efficiency tips, maintenance schedules, and road trip vehicle recommendations.
                </p>
                <div className="flex items-center text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Coming soon</span>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="h-40 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-gray-400">Image Coming Soon</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Coming Soon</h3>
                <p className="text-gray-600 mb-4">
                  Stay tuned for detailed guides on the most fuel-efficient vehicles, maintenance best practices, and choosing the right car for your travel needs.
                </p>
                <div className="flex items-center text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Coming soon</span>
                </div>
              </div>
            </div>
          </div>
        </main>
        
        {/* Sidebar */}
        <aside className="w-full lg:w-1/3 space-y-6">
          {/* Vehicle Efficiency Tools */}
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Vehicle Tools</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/" className="flex items-start hover:bg-gray-100 p-2 rounded transition-colors">
                  <div className="mr-3 text-blue-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <span className="font-medium block">MPG Calculator</span>
                    <span className="text-sm text-gray-600">Calculate your vehicle's fuel efficiency</span>
                  </div>
                </Link>
              </li>
              <li>
                <Link href="/road-trip-cost-calculator" className="flex items-start hover:bg-gray-100 p-2 rounded transition-colors">
                  <div className="mr-3 text-blue-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <span className="font-medium block">Road Trip Cost Calculator</span>
                    <span className="text-sm text-gray-600">Calculate travel costs for your vehicle</span>
                  </div>
                </Link>
              </li>
              <li>
                <Link href="/fuel-savings-calculator" className="flex items-start hover:bg-gray-100 p-2 rounded transition-colors">
                  <div className="mr-3 text-blue-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <span className="font-medium block">Fuel Savings Calculator</span>
                    <span className="text-sm text-gray-600">Compare vehicle efficiency savings</span>
                  </div>
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Vehicle Categories */}
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Vehicle Types</h3>
            <ul className="space-y-2">
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-gray-700">Electric Vehicles</span>
              </li>
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-gray-700">Hybrid Cars</span>
              </li>
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-gray-700">SUVs & Crossovers</span>
              </li>
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-gray-700">Sedans & Compact Cars</span>
              </li>
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-gray-700">RVs & Camper Vans</span>
              </li>
            </ul>
          </div>
          
          {/* Call to Action */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 rounded-xl text-white">
            <h3 className="text-xl font-semibold mb-3">Calculate Your MPG</h3>
            <p className="text-blue-100 mb-4">Use our free MPG Calculator to measure your vehicle's actual fuel efficiency.</p>
            <Link href="/" className="block text-center bg-white text-blue-700 hover:bg-blue-50 font-medium py-2 px-4 rounded-md transition-colors">
              Try the MPG Calculator
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
} 