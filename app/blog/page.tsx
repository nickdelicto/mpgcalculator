import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'MPGCalculator.net Blog | Road Trip Guides & Travel Resources',
  description: 'Explore our collection of road trip guides, destination tips, vehicle advice, and travel resources to plan your perfect journey.',
}

export default function BlogHomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Blog Header */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-xl p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">MPGCalculator.net Blog</h2>
          <p>Travel guides, road trip planning, and vehicle advice</p>
        </div>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-8">
        <main className="w-full lg:w-2/3">
          <h1 className="text-3xl font-bold mb-6 text-blue-900 font-heading">
            Travel Guides & Resources
          </h1>
          
          <div className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 text-blue-800">Featured Content</h2>
            {/* Featured content grid will go here - empty for now */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-8 text-center">
              <p className="text-blue-800">Featured content coming soon!</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {/* Content Hub Previews */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Road Trip Guides</h3>
              <p className="text-gray-600 mb-4">Discover the best routes, cost estimates, and planning tips for your next road trip adventure.</p>
              <Link href="/blog/road-trips" className="text-blue-600 hover:text-blue-800 font-medium">
                Explore Road Trip Guides →
              </Link>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Destination Guides</h3>
              <p className="text-gray-600 mb-4">In-depth guides to popular destinations with insider tips and hidden gems.</p>
              <Link href="/blog/destinations" className="text-blue-600 hover:text-blue-800 font-medium">
                Explore Destinations →
              </Link>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Accommodation Tips</h3>
              <p className="text-gray-600 mb-4">Find the best places to stay on your travels, from budget options to luxury experiences.</p>
              <Link href="/blog/accommodations" className="text-blue-600 hover:text-blue-800 font-medium">
                Explore Accommodation Tips →
              </Link>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Vehicle Guides</h3>
              <p className="text-gray-600 mb-4">Expert advice on vehicle efficiency, maintenance, and choosing the right car for your needs.</p>
              <Link href="/blog/vehicles" className="text-blue-600 hover:text-blue-800 font-medium">
                Explore Vehicle Guides →
              </Link>
            </div>
          </div>
        </main>
        
        {/* Sidebar */}
        <aside className="w-full lg:w-1/3 space-y-6">
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Explore Topics</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/blog/road-trips" className="text-blue-600 hover:text-blue-800">
                  Road Trip Guides
                </Link>
              </li>
              <li>
                <Link href="/blog/destinations" className="text-blue-600 hover:text-blue-800">
                  Destination Guides
                </Link>
              </li>
              <li>
                <Link href="/blog/accommodations" className="text-blue-600 hover:text-blue-800">
                  Accommodation Tips
                </Link>
              </li>
              <li>
                <Link href="/blog/travel-resources" className="text-blue-600 hover:text-blue-800">
                  Travel Resources
                </Link>
              </li>
              <li>
                <Link href="/blog/vehicles" className="text-blue-600 hover:text-blue-800">
                  Vehicle Guides
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
            <h3 className="text-lg font-semibold mb-4">Our Tools</h3>
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
          
          {/* Newsletter signup */}
          <div className="bg-gradient-to-r from-indigo-100 to-purple-100 p-6 rounded-xl border border-indigo-200">
            <h3 className="text-lg font-semibold mb-2">Travel Tips Newsletter</h3>
            <p className="text-sm text-gray-700 mb-4">Get road trip ideas, destination guides, and travel tips delivered to your inbox.</p>
            <div className="space-y-2">
              <input type="email" placeholder="Your email address" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
} 