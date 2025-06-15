import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Road Trip Guides | MPGCalculator.net Blog',
  description: 'Explore our collection of road trip guides with routes, cost estimates, and planning tips for your next adventure.',
}

export default function RoadTripsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Category Header */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-xl p-8 text-white">
          <Link href="/blog" className="text-blue-200 hover:text-white mb-2 inline-block">
            ← Back to Blog Home
          </Link>
          <h2 className="text-3xl font-bold mb-2">Road Trip Guides</h2>
          <p className="text-xl text-blue-100">Discover popular routes, cost estimates, and planning tips</p>
        </div>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-8">
        <main className="w-full lg:w-2/3">
          {/* Category Introduction */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
            <h1 className="text-2xl font-bold mb-4 text-blue-900">
              Plan Your Perfect Road Trip
            </h1>
            <p className="text-gray-700 mb-4">
              Road trips offer the freedom to explore at your own pace, stop whenever something catches your eye, and truly experience the journey as much as the destination. Our road trip guides provide detailed routes, cost estimates, accommodation recommendations, and insider tips to help you plan an unforgettable adventure.
            </p>
            <p className="text-gray-700">
              From iconic routes like Route 66 and the Pacific Coast Highway to lesser-known scenic drives, we've got you covered with everything you need to know before hitting the road.
            </p>
          </div>
          
          {/* Featured Road Trip */}
          <div className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 text-blue-800">Featured Road Trip</h2>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl overflow-hidden border border-blue-100">
              <div className="relative h-60 w-full">
                <Image
                  src="/images/blog/road-trips/routes/route66-map.png"
                  alt="Historic Route 66 map showing the journey from Chicago to Los Angeles"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  style={{ objectFit: 'cover' }}
                  className="rounded-t-xl"
                />
                <div className="absolute bottom-2 right-3 bg-black bg-opacity-50 px-2 py-1 rounded text-xs text-white">
                  © MPGCalculator.net
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-blue-900 mb-2">
                  <Link href="/blog/road-trips/best-road-trip-routes-usa" className="hover:text-blue-700 transition-colors">
                    11 Most Popular Best Road Trip Routes in the US with Cost Breakdowns
                  </Link>
                </h3>
                <p className="text-gray-700 mb-4">
                  Explore America's most iconic road trip routes with detailed cost estimates for fuel, accommodations, and attractions. Plan your next adventure with our comprehensive guide to the best routes across the United States.
                </p>
                <div className="flex items-center text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>July 2025</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* All Road Trip Articles */}
          <div>
            <h2 className="text-2xl font-semibold mb-6 text-blue-800">All Road Trip Guides</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Our new article */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="relative h-40 w-full rounded-lg mb-4 overflow-hidden">
                  <Image
                    src="/images/blog/road-trips/routes/route66-map.png"
                    alt="Historic Route 66 map"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    style={{ objectFit: 'cover' }}
                  />
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 px-2 py-1 rounded text-xs text-white">
                    © MPGCalculator.net
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  <Link href="/blog/road-trips/best-road-trip-routes-usa" className="hover:text-blue-700 transition-colors">
                    11 Most Popular Best Road Trip Routes in the US
                  </Link>
                </h3>
                <p className="text-gray-600 mb-4">
                  Comprehensive guide to America's best road trips with detailed cost breakdowns for fuel, lodging, and attractions.
                </p>
                <div className="flex items-center text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>July 2025</span>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="h-40 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-gray-400">Image Coming Soon</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Coming Soon</h3>
                <p className="text-gray-600 mb-4">
                  Stay tuned for detailed guides featuring the most popular and scenic road trip routes across the country.
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
          {/* Road Trip Planning Tools */}
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
            <h3 className="text-lg font-semibold mb-4">Road Trip Planning Tools</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/road-trip-cost-calculator" className="flex items-start hover:bg-blue-100 p-2 rounded transition-colors">
                  <div className="mr-3 text-blue-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <span className="font-medium block">Road Trip Cost Calculator</span>
                    <span className="text-sm text-gray-600">Plan your journey costs</span>
                  </div>
                </Link>
              </li>
              <li>
                <Link href="/" className="flex items-start hover:bg-blue-100 p-2 rounded transition-colors">
                  <div className="mr-3 text-blue-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <span className="font-medium block">MPG Calculator</span>
                    <span className="text-sm text-gray-600">Calculate fuel efficiency</span>
                  </div>
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Road Trip Categories */}
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Road Trip Types</h3>
            <ul className="space-y-2">
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-gray-700">Scenic Drives</span>
              </li>
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-gray-700">National Park Routes</span>
              </li>
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-gray-700">Historic Highways</span>
              </li>
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-gray-700">Coastal Journeys</span>
              </li>
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-gray-700">Cross-Country Trips</span>
              </li>
            </ul>
          </div>
          
          {/* Call to Action */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 rounded-xl text-white">
            <h3 className="text-xl font-semibold mb-3">Plan Your Road Trip</h3>
            <p className="text-blue-100 mb-4">Use our free Road Trip Cost Calculator to estimate expenses for your journey.</p>
            <Link href="/road-trip-cost-calculator" className="block text-center bg-white text-blue-700 hover:bg-blue-50 font-medium py-2 px-4 rounded-md transition-colors">
              Try the Calculator
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
} 