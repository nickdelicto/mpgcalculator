import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Destination Guides | MPGCalculator.net Blog',
  description: 'Explore our collection of destination guides with travel tips, attraction recommendations, and insider advice for popular locations.',
}

export default function DestinationsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Category Header */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-xl p-8 text-white">
          <Link href="/blog" className="text-emerald-200 hover:text-white mb-2 inline-block">
            ← Back to Blog Home
          </Link>
          <h2 className="text-3xl font-bold mb-2">Destination Guides</h2>
          <p className="text-xl text-emerald-100">Explore popular locations with travel tips and insider advice</p>
        </div>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-8">
        <main className="w-full lg:w-2/3">
          {/* Category Introduction */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
            <h1 className="text-2xl font-bold mb-4 text-emerald-900">
              Discover Amazing Destinations
            </h1>
            <p className="text-gray-700 mb-4">
              Our comprehensive destination guides help you discover the best places to visit, whether you're planning a weekend getaway or a longer vacation. Each guide provides detailed information about attractions, accommodations, dining options, and local tips to make your trip memorable.
            </p>
            <p className="text-gray-700">
              From popular tourist destinations to hidden gems off the beaten path, our guides will help you make the most of your travel experience.
            </p>
          </div>
          
          {/* Featured Destination */}
          <div className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 text-emerald-800">Featured Destination</h2>
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl overflow-hidden border border-emerald-100">
              <div className="p-6">
                <h3 className="text-xl font-bold text-emerald-900 mb-2">Coming Soon</h3>
                <p className="text-gray-700 mb-4">
                  We're working on detailed destination guides with attraction recommendations, accommodation options, and local insights. Check back soon for our featured destinations!
                </p>
                <div className="flex items-center text-emerald-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Coming soon</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* All Destination Guides */}
          <div>
            <h2 className="text-2xl font-semibold mb-6 text-emerald-800">All Destination Guides</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Placeholder for future articles */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="h-40 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-gray-400">Image Coming Soon</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Coming Soon</h3>
                <p className="text-gray-600 mb-4">
                  Our team is creating comprehensive destination guides with attraction lists, accommodation recommendations, and local tips.
                </p>
                <div className="flex items-center text-emerald-600">
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
                  Stay tuned for detailed guides featuring the most popular travel destinations across the country.
                </p>
                <div className="flex items-center text-emerald-600">
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
          {/* Travel Planning Tools */}
          <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-100">
            <h3 className="text-lg font-semibold mb-4">Travel Planning Tools</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/road-trip-cost-calculator" className="flex items-start hover:bg-emerald-100 p-2 rounded transition-colors">
                  <div className="mr-3 text-emerald-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <span className="font-medium block">Road Trip Cost Calculator</span>
                    <span className="text-sm text-gray-600">Plan your journey to these destinations</span>
                  </div>
                </Link>
              </li>
              <li>
                <Link href="/" className="flex items-start hover:bg-emerald-100 p-2 rounded transition-colors">
                  <div className="mr-3 text-emerald-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <span className="font-medium block">MPG Calculator</span>
                    <span className="text-sm text-gray-600">Calculate fuel costs for your trip</span>
                  </div>
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Destination Categories */}
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Destination Types</h3>
            <ul className="space-y-2">
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-gray-700">Beach Destinations</span>
              </li>
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-gray-700">Mountain Getaways</span>
              </li>
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-gray-700">City Escapes</span>
              </li>
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-gray-700">National Parks</span>
              </li>
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-gray-700">Historical Sites</span>
              </li>
            </ul>
          </div>
          
          {/* Call to Action */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-6 rounded-xl text-white">
            <h3 className="text-xl font-semibold mb-3">Plan Your Trip</h3>
            <p className="text-emerald-100 mb-4">Use our free Road Trip Cost Calculator to estimate expenses for your journey to these destinations.</p>
            <Link href="/road-trip-cost-calculator" className="block text-center bg-white text-emerald-700 hover:bg-emerald-50 font-medium py-2 px-4 rounded-md transition-colors">
              Try the Calculator
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
} 