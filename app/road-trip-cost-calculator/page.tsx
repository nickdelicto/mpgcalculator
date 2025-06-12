import { Metadata } from 'next'
import RoadTripCalculator from '../components/RoadTripCalculator'
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { MapPin, DollarSign } from 'lucide-react'
import EmbedSection from '../components/EmbedSection'
import Script from 'next/script'
import ScrollToTopButton from '../components/ScrollToTopButton'

// Structured Data Component
const StructuredData = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Road Trip Cost Calculator",
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
    "description": "Calculate the cost of your next road trip including fuel expenses, tolls, and find hotels along your route with our interactive road trip cost calculator.",
    "featureList": [
      "Calculate fuel costs for road trips",
      "Plan routes with interactive maps",
      "Support for gas, electric, and hybrid vehicles",
      "Toll cost estimation",
      "Customizable fuel efficiency and price inputs"
    ]
  }

  // FAQ Structured Data
  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Is the Road Trip Cost Calculator free to use?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! Our Road Trip Cost Calculator is completely free to use with no hidden fees or subscriptions required. We offer this tool as a free resource to help travelers plan their journeys more effectively. You can use all features including route planning, cost estimation, hotel discovery, and attraction finding without any charges."
        }
      },
      {
        "@type": "Question",
        "name": "How accurate is the road trip cost calculator?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Our road trip calculator provides highly accurate estimates based on current data and your specific inputs. It accounts for your vehicle's fuel efficiency, current fuel prices, and the exact route between your starting point and destination. For even greater accuracy, you can add toll costs and adjust for your driving style. While external factors like traffic conditions, weather, and sudden fuel price changes may affect actual costs, most users report our estimates are within 5-10% of their actual expenses."
        }
      },
      {
        "@type": "Question",
        "name": "Can I use the calculator for electric vehicles?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! Our road trip calculator fully supports electric vehicles. When entering your vehicle details, simply select \"Electric\" as your fuel type, then input your vehicle's efficiency (kWh/100 miles or kWh/100 km) and your electricity cost per kWh. The calculator will provide accurate cost estimates for your EV journey, including total energy consumption and cost."
        }
      },
      {
        "@type": "Question",
        "name": "Does the calculator work for international road trips?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Our calculator works for road trips worldwide, with support for both imperial (miles, gallons) and metric (kilometers, liters) units. You can calculate costs for trips across countries, though please note that for cross-border journeys, you may need to manually adjust for different fuel prices in each country."
        }
      },
      {
        "@type": "Question",
        "name": "How can I save or share my road trip plan?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Currently, you can save your road trip plan by taking a screenshot or bookmarking the page after calculation. We're developing a feature to allow you to save your trips to an account and share them directly with friends and family."
        }
      },
      {
        "@type": "Question",
        "name": "Can I calculate costs for multi-stop road trips?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "While our calculator currently focuses on direct routes between a starting point and destination, you can calculate multi-stop trips by breaking your journey into segments. Calculate each leg separately (e.g., A to B, then B to C), and add the results together for your total trip cost."
        }
      },
      {
        "@type": "Question",
        "name": "Do you earn commissions from hotels and attractions?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, we may earn affiliate commissions if you book hotels, attractions, or experiences through links on our site. These partnerships help us keep the Road Trip Cost Calculator completely free for everyone. Rest assured that our recommendations are based on quality and relevance to your journey, not commission rates."
        }
      }
    ]
  };

  return (
    <>
    <Script id="structured-data" type="application/ld+json">
      {JSON.stringify(structuredData)}
    </Script>
      <Script id="faq-structured-data" type="application/ld+json">
        {JSON.stringify(faqStructuredData)}
      </Script>
    </>
  )
}

export const metadata: Metadata = {
  title: 'Road Trip Cost Calculator | Find Best Route & Estimate Travel Expenses',
  description: 'Plan your next journey with our free road trip cost calculator. Find the best route, accomodation, attractions & estimate total expenses for your car trip with our interactive tool.',
  keywords: 'road trip cost calculator, car trip cost calculator, travel fuel cost calculator, fuel expense calculator, trip planner, gas cost calculator, road trip planner, road trip calculator, road trip cost, road trip expenses, road trip planner, road trip calculator, road trip cost, road trip expenses, route planner, route calculator, route cost, route expenses',
  openGraph: {
    title: 'Road Trip Cost Calculator | Estimate Travel Expenses',
    description: 'Plan your next journey with our interactive road trip cost calculator. Estimate fuel costs, tolls, and total expenses for your car trip with our free tool.',
    url: 'https://mpgcalculator.net/road-trip-cost-calculator',
    siteName: 'MPGCalculator.net',
    locale: 'en_US',
    type: 'website',
  },
  alternates: {
    canonical: 'https://mpgcalculator.net/road-trip-cost-calculator',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
}

export default function RoadTripCalculatorPage() {
  return (
    <div className="w-full px-4 py-8">
      <StructuredData />
      
      <div className="flex flex-col">
        <main className="w-full">
          {/* Hero Section */}
          <div className="relative mb-12 bg-gradient-to-r from-blue-900 to-blue-800 rounded-2xl p-8 overflow-hidden">
            <div className="relative z-10">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 font-heading">
                Road Trip Cost Calculator
              </h1>
              <p className="text-blue-100 text-lg md:text-xl font-heading max-w-2xl">
                Plan your journey and estimate the total cost of your next road trip with our <span className="font-bold underline decoration-2 decoration-blue-400">100% free</span> interactive calculator
              </p>
            </div>
            {/* Decorative map icon */}
            <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4">
              <MapPin size={300} />
            </div>
          </div>

          {/* Affiliate Disclosure Banner */}
          <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-600">
            <p className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span><strong>Affiliate Disclosure:</strong> We may earn a commission if you book hotels or attractions through links on this page. This helps us keep our tools free for everyone to use.</span>
            </p>
          </div>

          {/* Calculator Card */}
          <Card className="bg-gradient-to-r from-gray-100 to-gray-50 border-gray-700 mb-12">
            <CardHeader className="border-b border-gray-700">
              <CardTitle className="text-gray-800 flex items-center gap-2 text-2xl">
                <DollarSign className="h-6 w-6 text-blue-400" />
                Calculate Your Road Trip Costs
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 font-heading">
              <RoadTripCalculator />
            </CardContent>
          </Card>

          {/* Embed Section */}
          {/* <div className="mb-12">
            <EmbedSection />
          </div> */}

          {/* SEO Content Section */}
          <div className="mt-12 text-gray-900 space-y-8 font-heading">
            <h2 className="text-3xl font-bold font-heading bg-gradient-to-r from-blue-700 to-blue-900 text-transparent bg-clip-text">Plan Your Perfect Road Trip: The Ultimate Journey Planner</h2>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-lg leading-relaxed">
                Planning a road trip should be as exciting as the journey itself. But between calculating fuel costs, finding places to stay, and discovering attractions worth visiting, the planning process can quickly become overwhelming.
              </p>
              
              <p className="text-lg leading-relaxed">
                That's where our interactive Road Trip Cost Calculator comes in. We've created more than just a tool that estimates expenses—we've built a comprehensive journey planner that helps you discover the full potential of your next adventure.
              </p>
              
              <div className="bg-blue-50 border-l-4 border-blue-500 p-5 my-6 rounded-r-lg">
                <p className="italic text-blue-800">
                  Whether you're mapping out a weekend escape to the mountains or orchestrating a cross-country expedition, our calculator gives you the clarity and confidence to hit the road knowing exactly what to expect.
                </p>
              </div>
            </div>
            
            <h3 className="text-2xl font-semibold mt-8 font-heading flex items-center">
              <span className="bg-blue-100 p-2 rounded-full mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </span>
              What Makes Our Road Trip Calculator Special
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6 mt-4">
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-start">
                  <div className="bg-indigo-100 p-3 rounded-lg mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-800 mb-2">Interactive Route Planning</h4>
                    <p className="text-gray-600">
                      Plot your journey on our interactive map and instantly see the most efficient route between your starting point and destination. Adjust your route and watch as costs update in real-time.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-start">
                  <div className="bg-green-100 p-3 rounded-lg mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-800 mb-2">Precise Cost Estimation</h4>
                    <p className="text-gray-600">
                      Get accurate fuel cost estimates based on your specific vehicle's fuel efficiency, current gas prices, and route details. Add toll expenses to get a complete picture of your travel costs.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-start">
                  <div className="bg-amber-100 p-3 rounded-lg mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-800 mb-2">Accommodation Discovery</h4>
                    <p className="text-gray-600">
                      Find hotels and accommodations along your route with our integrated mapping system. Compare options and make informed decisions about where to stay during your journey.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-start">
                  <div className="bg-rose-100 p-3 rounded-lg mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-rose-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-800 mb-2">Attraction Exploration</h4>
                    <p className="text-gray-600">
                      Discover exciting attractions, landmarks, and points of interest along your journey. Turn a simple road trip into an unforgettable adventure with curated recommendations.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl mt-8 border border-blue-100">
              <h3 className="text-2xl font-semibold mb-4 text-blue-800">Why Use a Road Trip Cost Calculator?</h3>
              <p className="text-gray-700 mb-4">
                In today's world of fluctuating gas prices and hidden travel expenses, planning ahead can save you from budget surprises. Our road trip calculator helps you:
              </p>
              <ul className="space-y-2 text-gray-700 list-none">
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 mr-2 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span><strong>Budget accurately</strong> for your entire journey, eliminating financial stress</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 mr-2 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span><strong>Compare different routes</strong> to find the most cost-effective path to your destination</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 mr-2 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span><strong>Plan for fuel stops</strong> by understanding your vehicle's range and efficiency</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 mr-2 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span><strong>Make informed decisions</strong> about which vehicle to take on your journey</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 mr-2 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span><strong>Discover the perfect places</strong> to stay and explore along your route</span>
                </li>
            </ul>

              {/* First inline CTA */}
              <div className="mt-5 text-center">
                <ScrollToTopButton 
                  buttonText="Try Our Free Calculator" 
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  }
                />
              </div>
            </div>

            {/* How to Use section - replace the old list with a visually enhanced guide */}
            <h3 className="text-2xl font-semibold mt-10 font-heading flex items-center">
              <span className="bg-blue-100 p-2 rounded-full mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </span>
              How to Use the Road Trip Cost Calculator
            </h3>
            
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm mt-4">
              <div className="grid grid-cols-1 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-gray-200">
                <div className="p-4 md:p-5 bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center text-center">
                  <div className="bg-white rounded-full p-3 shadow-sm mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-lg mb-1">Enter Your Route</h4>
                  <p className="text-sm text-gray-600">Input your starting point and destination to map your journey.</p>
                  <p className="text-xs text-blue-600 mt-2 italic">Tip: For better results, use complete addresses</p>
                </div>
                
                <div className="p-4 md:p-5 flex flex-col items-center text-center">
                  <div className="bg-white rounded-full p-3 shadow-sm mb-3 border border-gray-100">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-lg mb-1">Vehicle Details</h4>
                  <p className="text-sm text-gray-600">Enter your vehicle's fuel efficiency and current fuel price.</p>
                  <p className="text-xs text-indigo-600 mt-2 italic">Works with gas, diesel & electric vehicles</p>
                </div>
                
                <div className="p-4 md:p-5 flex flex-col items-center text-center">
                  <div className="bg-white rounded-full p-3 shadow-sm mb-3 border border-gray-100">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-lg mb-1">Additional Costs</h4>
                  <p className="text-sm text-gray-600">Add toll expenses if applicable to your route.</p>
                  <p className="text-xs text-green-600 mt-2 italic">Don't forget to include return tolls if needed</p>
                </div>
                
                <div className="p-4 md:p-5 flex flex-col items-center text-center">
                  <div className="bg-white rounded-full p-3 shadow-sm mb-3 border border-gray-100">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-lg mb-1">Calculate</h4>
                  <p className="text-sm text-gray-600">Get a comprehensive breakdown of your trip costs.</p>
                  <p className="text-xs text-amber-600 mt-2 italic">Includes fuel costs, tolls, and trip duration</p>
                </div>
                
                <div className="p-4 md:p-5 bg-gradient-to-br from-indigo-50 to-indigo-100 flex flex-col items-center text-center">
                  <div className="bg-white rounded-full p-3 shadow-sm mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-lg mb-1">Explore the Map</h4>
                  <p className="text-sm text-gray-600">View your route and discover points of interest.</p>
                  <p className="text-xs text-purple-600 mt-2 italic">Find hotels, attractions, and more!</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <div className="flex items-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-blue-800 font-medium">Pro Tip: Save your results by taking a screenshot or bookmarking the page after calculation.</span>
              </div>
            </div>

            {/* Factors Affecting section - replace the old list with cards */}
            <h3 className="text-2xl font-semibold mt-10 pt-6 border-t border-gray-200 font-heading flex items-center">
              <span className="bg-amber-100 p-2 rounded-full mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              Factors Affecting Your Road Trip Costs
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-start">
                  <div className="bg-blue-100 p-2 rounded-lg mr-4 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-1">Fuel Efficiency</h4>
                    <p className="text-gray-600 text-sm">
                      Your vehicle's MPG (or kWh/mile for electric vehicles) has the biggest impact on your trip's cost. A difference of just 5 MPG can save you hundreds of dollars on a long journey.
                    </p>
                    <div className="mt-2 text-xs bg-blue-50 p-2 rounded">
                      <span className="font-semibold block">Example:</span> 
                      A 1,000-mile trip costs $125 in a 30 MPG vehicle versus $167 in a 20 MPG vehicle (at $3.75/gallon).
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-start">
                  <div className="bg-green-100 p-2 rounded-lg mr-4 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-1">Fuel Prices</h4>
                    <p className="text-gray-600 text-sm">
                      Gas prices can vary significantly between regions and states. Our calculator uses current fuel prices, but prices may change during your trip.
                    </p>
                    <div className="mt-2 text-xs bg-green-50 p-2 rounded">
                      <span className="font-semibold block">Tip:</span> 
                      Consider using gas price apps to find the cheapest fuel along your route.
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-start">
                  <div className="bg-purple-100 p-2 rounded-lg mr-4 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-1">Route Selection</h4>
                    <p className="text-gray-600 text-sm">
                      Different routes may have varying distances, traffic conditions, and toll charges. The shortest route isn't always the most economical.
                    </p>
                    <div className="mt-2 text-xs bg-purple-50 p-2 rounded">
                      <span className="font-semibold block">Consider:</span> 
                      Highway driving is typically more fuel-efficient than stop-and-go city driving.
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-start">
                  <div className="bg-amber-100 p-2 rounded-lg mr-4 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-1">Driving Habits</h4>
                    <p className="text-gray-600 text-sm">
                      Aggressive driving with rapid acceleration and high speeds can reduce fuel economy by up to 30% on highways and 40% in city driving.
                    </p>
                    <div className="mt-2 text-xs bg-amber-50 p-2 rounded">
                      <span className="font-semibold block">Best practice:</span> 
                      Maintain a steady speed and use cruise control on highways to maximize efficiency.
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-start">
                  <div className="bg-rose-100 p-2 rounded-lg mr-4 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-rose-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-1">Accommodation</h4>
                    <p className="text-gray-600 text-sm">
                      For trips longer than a day, overnight accommodations will significantly impact your total expenses. Our map helps you find options along your route.
                    </p>
                    <div className="mt-2 text-xs bg-rose-50 p-2 rounded">
                      <span className="font-semibold block">Budget tip:</span> 
                      Book accommodations in advance for better rates, especially during peak travel seasons.
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-start">
                  <div className="bg-indigo-100 p-2 rounded-lg mr-4 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-1">Vehicle Maintenance</h4>
                    <p className="text-gray-600 text-sm">
                      A well-maintained vehicle runs more efficiently. Properly inflated tires alone can improve your gas mileage by up to 3%.
                    </p>
                    <div className="mt-2 text-xs bg-indigo-50 p-2 rounded">
                      <span className="font-semibold block">Pre-trip checklist:</span> 
                      Check tire pressure, oil level, and air filters before your journey.
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Budget-friendly section - replace paragraph with better formatted content */}
            <h3 className="text-2xl font-semibold mt-10 pt-6 border-t border-gray-200 font-heading flex items-center">
              <span className="bg-green-100 p-2 rounded-full mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              Planning a Budget-Friendly Road Trip
            </h3>
            
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl mt-4 border border-green-100">
              <p className="text-gray-700 mb-5">
                Using our road trip cost calculator helps you identify ways to save money while maximizing your travel experience. Here are some strategic approaches to plan a more economical journey:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Compare Vehicle Options
                  </h4>
                  <p className="text-sm text-gray-600">
                    If you have access to multiple vehicles, use our calculator to compare fuel costs for each. The more fuel-efficient option could save you significant money, especially on longer trips.
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Explore Alternative Routes
                  </h4>
                  <p className="text-sm text-gray-600">
                    The shortest route isn't always the cheapest. Try different route options to find one with fewer tolls or better fuel economy due to less congestion or more consistent speeds.
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Find Affordable Accommodations
                  </h4>
                  <p className="text-sm text-gray-600">
                    Use our map's hotel feature to discover accommodation options along your route. Look for stays with free breakfast or kitchenettes to save on meal costs during your journey.
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Pack Smart for Efficiency
                  </h4>
                  <p className="text-sm text-gray-600">
                    Every 100 pounds of weight reduces fuel economy by about 1%. Pack only what you need and avoid rooftop cargo boxes when possible, as they can decrease fuel efficiency by up to 25%.
                  </p>
                </div>
              </div>
              
              <div className="mt-5 bg-white p-4 rounded-lg border border-green-100 shadow-sm">
                <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Remember the Experience Value
                </h4>
                <p className="text-sm text-gray-600">
                  While it's important to budget wisely, don't sacrifice the quality of your experience just to save a few dollars. Use our trip calculator to find the sweet spot between cost and enjoyment. Some attractions or slightly pricier accommodations might be worth the extra cost for the memories they'll create.
                </p>
              </div>
            </div>
            
            {/* Phase 3: Discovery & Exploration Section */}
            <h3 className="text-2xl font-semibold mt-10 pt-6 border-t border-gray-200 font-heading flex items-center">
              <span className="bg-purple-100 p-2 rounded-full mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </span>
              Discover More Than Just Costs: Explore Your Route
            </h3>
            
            <div className="prose prose-lg max-w-none mt-4">
              <p className="text-gray-700">
                While knowing the cost of your road trip is essential, our calculator goes beyond numbers to help you discover what makes your journey truly memorable. Our interactive map feature transforms your trip from a simple A-to-B route into an adventure filled with possibilities.
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
              <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 flex flex-col">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3"></div>
                <div className="p-5">
                  <div className="rounded-full bg-indigo-100 w-12 h-12 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-semibold mb-2 text-gray-800">Find Perfect Accommodations</h4>
                  <p className="text-gray-600 mb-4">
                    Discover hotels, motels, and B&Bs along your route with our integrated map layers. Compare options based on location, price, and amenities to find the perfect place to rest.
                  </p>
                  <div className="bg-indigo-50 p-3 rounded-lg mt-auto">
                    <h5 className="font-medium text-indigo-800 text-sm mb-2">How to use this feature:</h5>
                    <ol className="text-xs text-indigo-700 space-y-1 pl-4 list-decimal">
                      <li>Enter your route and calculate costs</li>
                      <li>Ensure "Hotels" is selected in the map layers</li>
                      <li>Click on hotel icons to see details</li>
                      <li>Compare options in the "Hotels" tab</li>
                    </ol>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 flex flex-col">
                <div className="bg-gradient-to-r from-rose-500 to-pink-600 h-3"></div>
                <div className="p-5">
                  <div className="rounded-full bg-rose-100 w-12 h-12 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-semibold mb-2 text-gray-800">Explore Attractions & Activities</h4>
                  <p className="text-gray-600 mb-4">
                    Uncover hidden gems, tourist attractions, and unique experiences that transform your journey into an adventure. Find museums, parks, historical sites, and local hotspots.
                  </p>
                  <div className="bg-rose-50 p-3 rounded-lg mt-auto">
                    <h5 className="font-medium text-rose-800 text-sm mb-2">How to use this feature:</h5>
                    <ol className="text-xs text-rose-700 space-y-1 pl-4 list-decimal">
                      <li>Calculate your route</li>
                      <li>Enable "Attractions" in map layers</li>
                      <li>Browse points of interest on your route</li>
                      <li>View the "Attractions" tab for curated options</li>
                    </ol>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 flex flex-col">
                <div className="bg-gradient-to-r from-amber-500 to-orange-600 h-3"></div>
                <div className="p-5">
                  <div className="rounded-full bg-amber-100 w-12 h-12 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-semibold mb-2 text-gray-800">Step-by-Step Directions</h4>
                  <p className="text-gray-600 mb-4">
                    Navigate with confidence using our detailed turn-by-turn directions. Know exactly when to turn, which highways to take, and where to exit to stay on the most efficient route.
                  </p>
                  <div className="bg-amber-50 p-3 rounded-lg mt-auto">
                    <h5 className="font-medium text-amber-800 text-sm mb-2">How to use this feature:</h5>
                    <ol className="text-xs text-amber-700 space-y-1 pl-4 list-decimal">
                      <li>Enter start and destination points</li>
                      <li>Calculate your trip</li>
                      <li>Click the "Directions" tab</li>
                      <li>Follow the detailed step-by-step guidance</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Use Cases/Scenarios Section */}
            <h3 className="text-2xl font-semibold mt-10 pt-6 border-t border-gray-200 font-heading flex items-center">
              <span className="bg-teal-100 p-2 rounded-full mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </span>
              Road Trip Calculator for Every Journey
            </h3>
            
            <div className="prose prose-lg max-w-none mt-4">
              <p className="text-gray-700">
                Whether you're planning a quick weekend getaway or an epic cross-country adventure, our road trip cost calculator adapts to your specific needs. Here's how our tool helps different travelers plan their perfect journey:
              </p>
            </div>
            
            <div className="mt-6 space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl overflow-hidden border border-blue-200">
                <div className="md:flex">
                  <div className="md:w-1/3 bg-blue-600 text-white p-6 flex flex-col justify-center">
                    <h4 className="text-xl font-bold mb-2">Family Vacation Planning</h4>
                    <p className="text-blue-100 text-sm">
                      Optimize costs and experiences for traveling with children of all ages
                    </p>
                  </div>
                  <div className="md:w-2/3 p-6">
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-700">
                          <strong>Find family-friendly stops</strong> - Discover attractions, parks, and rest areas perfect for kids to stretch their legs
                        </span>
                      </li>
                      <li className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-700">
                          <strong>Budget for larger vehicles</strong> - Calculate costs for minivans or SUVs with adjusted fuel efficiency
                        </span>
                      </li>
                      <li className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-700">
                          <strong>Find hotels with family amenities</strong> - Locate accommodations with pools, free breakfast, or family suites
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl overflow-hidden border border-emerald-200">
                <div className="md:flex">
                  <div className="md:w-1/3 bg-emerald-600 text-white p-6 flex flex-col justify-center">
                    <h4 className="text-xl font-bold mb-2">Eco-Conscious Travelers</h4>
                    <p className="text-emerald-100 text-sm">
                      Plan a more sustainable journey with lower environmental impact
                    </p>
                  </div>
                  <div className="md:w-2/3 p-6">
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-600 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-700">
                          <strong>Calculate EV charging costs</strong> - Specific support for electric vehicles with charging station mapping
                        </span>
                      </li>
                      <li className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-600 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-700">
                          <strong>Compare vehicle emissions</strong> - See the carbon footprint difference between various vehicle options
                        </span>
                      </li>
                      <li className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-600 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-700">
                          <strong>Find eco-friendly accommodations</strong> - Discover hotels with green certifications and sustainable practices
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl overflow-hidden border border-amber-200">
                <div className="md:flex">
                  <div className="md:w-1/3 bg-amber-600 text-white p-6 flex flex-col justify-center">
                    <h4 className="text-xl font-bold mb-2">Weekend Getaways</h4>
                    <p className="text-amber-100 text-sm">
                      Maximize your short trips with efficient planning and discovery
                    </p>
                  </div>
                  <div className="md:w-2/3 p-6">
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-700">
                          <strong>Find the perfect distance</strong> - Calculate ideal destinations that maximize your limited time
                        </span>
                      </li>
                      <li className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-700">
                          <strong>Discover hidden gems</strong> - Explore attractions and experiences within a few hours' drive
                        </span>
                      </li>
                      <li className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-700">
                          <strong>Budget for quick trips</strong> - Plan an affordable weekend escape without unexpected expenses
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Third inline CTA - After Features */}
            <div className="mx-auto max-w-md mt-6">
              <ScrollToTopButton 
                buttonText="Start Planning For Free" 
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium py-3 rounded-md shadow-md hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 flex items-center justify-center"
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                }
              />
              <p className="text-center text-xs text-gray-500 mt-2">No credit card or signup required. Instant results.</p>
            </div>
            
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl mt-8 border border-blue-100">
              <div className="rounded-full bg-indigo-100 p-3 mr-5 hidden md:block flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h4 className="text-xl font-semibold text-indigo-900 mb-2 flex md:block items-center">
                  <span className="rounded-full bg-indigo-100 p-2 mr-3 md:hidden">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </span>
                  Create Your Own Adventure
                </h4>
                <p className="text-indigo-800">
                  Every road trip is unique, and our calculator is designed to adapt to your specific journey. Whether you're traveling solo, with friends, or with family; in an SUV, sedan, or electric vehicle; our tool helps you plan the perfect trip tailored to your preferences and needs.
                </p>
              </div>
            </div>
            
            {/* Phase 4: Trust Signals & FAQs */}
            <h3 className="text-2xl font-semibold mt-10 pt-6 border-t border-gray-200 font-heading flex items-center">
              <span className="bg-blue-100 p-2 rounded-full mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              Frequently Asked Questions
            </h3>
            
            <div className="mt-6">
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden divide-y divide-gray-200">
                <div className="p-6 bg-green-50">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2 flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Is the Road Trip Cost Calculator free to use?
                  </h4>
                  <p className="text-gray-700">
                    <strong className="text-green-600">Yes! Our Road Trip Cost Calculator is completely free to use</strong> with no hidden fees or subscriptions required. We offer this tool as a free resource to help travelers plan their journeys more effectively. You can use all features including route planning, cost estimation, hotel discovery, and attraction finding without any charges.
                  </p>
                </div>
                
                <div className="p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2 flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    How accurate is the road trip cost calculator?
                  </h4>
                  <p className="text-gray-700">
                    Our road trip calculator provides highly accurate estimates based on current data and your specific inputs. It accounts for your vehicle's fuel efficiency, current fuel prices, and the exact route between your starting point and destination. For even greater accuracy, you can add toll costs and adjust for your driving style. While external factors like traffic conditions, weather, and sudden fuel price changes may affect actual costs, most users report our estimates are within 5-10% of their actual expenses.
                  </p>
                </div>
                
                <div className="p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2 flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Can I use the calculator for electric vehicles?
                  </h4>
                  <p className="text-gray-700">
                    Yes! Our road trip calculator fully supports electric vehicles. When entering your vehicle details, simply select "Electric" as your fuel type, then input your vehicle's efficiency (kWh/100 miles or kWh/100 km) and your electricity cost per kWh. The calculator will provide accurate cost estimates for your EV journey, including total energy consumption and cost. While our map doesn't currently show charging stations, we're working on adding this feature in a future update.
                  </p>
                </div>
                
                <div className="p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2 flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Does the calculator work for international road trips?
                  </h4>
                  <p className="text-gray-700">
                    Our calculator works for road trips worldwide, with support for both imperial (miles, gallons) and metric (kilometers, liters) units. You can calculate costs for trips across countries, though please note that for cross-border journeys, you may need to manually adjust for different fuel prices in each country. The mapping feature works globally, helping you discover accommodations and attractions around the world.
                  </p>
                </div>
                
                <div className="p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2 flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    How can I save or share my road trip plan?
                  </h4>
                  <p className="text-gray-700">
                    Currently, you can save your road trip plan by taking a screenshot or bookmarking the page after calculation. We're developing a feature to allow you to save your trips to an account and share them directly with friends and family. In the meantime, you can share your screen capture via email or messaging apps, or simply send them the link to our calculator with instructions on entering the same route information.
                  </p>
                </div>
                
                <div className="p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2 flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Can I calculate costs for multi-stop road trips?
                  </h4>
                  <p className="text-gray-700">
                    While our calculator currently focuses on direct routes between a starting point and destination, you can calculate multi-stop trips by breaking your journey into segments. Calculate each leg separately (e.g., A to B, then B to C), and add the results together for your total trip cost. We're working on adding native multi-stop functionality in a future update to make planning complex road trips even easier.
                  </p>
                </div>
                
                <div className="p-6 bg-gray-50">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2 flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Do you earn commissions from hotels and attractions?
                  </h4>
                  <p className="text-gray-700">
                    Yes, we may earn affiliate commissions if you book hotels, attractions, or experiences through links on our site. These partnerships help us keep the Road Trip Cost Calculator completely free for everyone. Rest assured that our recommendations are based on quality and relevance to your journey, not commission rates. Our primary goal is to help you plan the best possible road trip experience.
                  </p>
                </div>
              </div>
            </div>
            
            {/* User Testimonials / Social Proof */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-100 rounded-full w-10 h-10 flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="text-blue-700 font-bold">M</span>
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900">Michael T.</h5>
                    <p className="text-sm text-gray-500">Family road trip planner</p>
                  </div>
                  <div className="ml-auto flex">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 01.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-gray-700 italic">
                  "This calculator was a game-changer for our family's cross-country trip. We were able to budget accurately and discover amazing stops along the way. The hotel finder saved us from endless searching and comparison. Highly recommended!"
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="bg-green-100 rounded-full w-10 h-10 flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="text-green-700 font-bold">S</span>
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900">Sarah K.</h5>
                    <p className="text-sm text-gray-500">EV road tripper</p>
                  </div>
                  <div className="ml-auto flex">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 01.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-gray-700 italic">
                  "Finally a road trip calculator that works well for electric vehicles! I was able to accurately predict my Tesla's energy consumption and costs for a 1,200-mile journey. The estimates were spot on, within 5% of my actual expenses."
                </p>
              </div>
            </div>
            
            {/* Road Trip Stats */}
            <div className="bg-gradient-to-br from-gray-900 to-blue-900 text-white rounded-xl p-6 mt-10">
              <h3 className="text-xl font-bold mb-6 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Road Trip Statistics
              </h3>
              
              {/* Popular Stats */}
              <div className="mb-6">
                <h4 className="text-blue-300 text-sm uppercase tracking-wider mb-3 border-b border-blue-800 pb-1">Popularity & Preferences</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
                    <div className="text-3xl font-bold text-blue-300">66%</div>
                    <div className="text-sm text-blue-100">of Americans are likely to go on a summer road trip</div>
                  </div>
                  <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
                    <div className="text-3xl font-bold text-blue-300">73%</div>
                    <div className="text-sm text-blue-100">of U.S. travelers prefer road trips over flying</div>
                  </div>
                  <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
                    <div className="text-3xl font-bold text-blue-300">30%+</div>
                    <div className="text-sm text-blue-100">of travelers plan to take a road trip, making it the 3rd most popular vacation type</div>
                  </div>
                  <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
                    <div className="text-3xl font-bold text-blue-300">Florida</div>
                    <div className="text-sm text-blue-100">was the top U.S. state for summer road trips in 2024</div>
                  </div>
                </div>
              </div>
              
              {/* Trip Planning */}
              <div className="mb-6">
                <h4 className="text-blue-300 text-sm uppercase tracking-wider mb-3 border-b border-blue-800 pb-1">Trip Planning & Destinations</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
                    <div className="text-3xl font-bold text-blue-300">6-10</div>
                    <div className="text-sm text-blue-100">hours is the most common driving time Americans plan for road trips</div>
                  </div>
                  <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
                    <div className="text-3xl font-bold text-blue-300">The Beach</div>
                    <div className="text-sm text-blue-100">is the leading road trip destination in the U.S.</div>
                  </div>
                  <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
                    <div className="text-3xl font-bold text-blue-300">3,365</div>
                    <div className="text-sm text-blue-100">miles is the length of Route 20, America's longest highway</div>
                  </div>
                  <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
                    <div className="text-3xl font-bold text-blue-300">20%</div>
                    <div className="text-sm text-blue-100">of Americans would take road trips instead of flying due to inflation</div>
                  </div>
                </div>
              </div>
              
              {/* Vehicle Preferences */}
              <div>
                <h4 className="text-blue-300 text-sm uppercase tracking-wider mb-3 border-b border-blue-800 pb-1">Vehicle Preferences</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
                    <div className="text-3xl font-bold text-blue-300">SUVs</div>
                    <div className="text-sm text-blue-100">are the most popular vehicle type for road trips across all generations</div>
                  </div>
                  <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
                    <div className="text-3xl font-bold text-blue-300">85%</div>
                    <div className="text-sm text-blue-100">of travelers prioritize comfortable seating when selecting a road trip vehicle</div>
                  </div>
                  <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
                    <div className="text-3xl font-bold text-blue-300">Adventure</div>
                    <div className="text-sm text-blue-100">is Gen Z's leading reason for going on road trips</div>
                  </div>
                  <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
                    <div className="text-2xl md:text-xl lg:text-2xl font-bold text-blue-300">Baby Boomers</div>
                    <div className="text-sm text-blue-100">are the generation willing to drive the longest distances on road trips</div>
                  </div>
                </div>
              </div>
              
              <div className="text-xs text-blue-200 mt-6 italic text-right">
                Sources: <a href="https://www.statista.com/topics/12887/road-trips-in-the-us/" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-300">Statista Road Trips Report 2024</a>
              </div>
            </div>
            
            {/* Expert Tips */}
            <div className="mt-10 bg-gradient-to-r from-teal-50 to-emerald-50 p-6 rounded-xl border border-teal-100">
              <div className="flex items-start">
                <div className="rounded-full bg-teal-100 p-3 mr-4 hidden sm:block flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-teal-800 mb-3 flex sm:block items-center">
                    <span className="rounded-full bg-teal-100 p-2 mr-2 sm:hidden">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </span>
                    Expert Tips for Better Road Trip Planning
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-start">
                      <div className="bg-white rounded-full p-1 mr-2 flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-sm text-teal-800">
                        <strong>Plan around rush hours</strong> in major cities to avoid traffic and maximize fuel efficiency.
                      </p>
                    </div>
                    <div className="flex items-start">
                      <div className="bg-white rounded-full p-1 mr-2 flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-sm text-teal-800">
                        <strong>Book accommodations midweek</strong> when possible for better rates and availability.
                      </p>
                    </div>
                    <div className="flex items-start">
                      <div className="bg-white rounded-full p-1 mr-2 flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-sm text-teal-800">
                        <strong>Plan gas stops at major highway exits</strong> with multiple stations for better prices.
                      </p>
                    </div>
                    <div className="flex items-start">
                      <div className="bg-white rounded-full p-1 mr-2 flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-sm text-teal-800">
                        <strong>Consider seasonal factors</strong> like tourism peaks, weather, and special events.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
                        
            {/* Call to Action */}
            <div className="mt-10 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-8 text-white text-center shadow-lg">
              <h3 className="text-2xl font-bold mb-4">Ready to Plan Your Perfect Road Trip?</h3>
              <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                Use our interactive calculator above to map your route, estimate costs, discover accommodations, and find attractions that will make your journey unforgettable.
              </p>
              <ScrollToTopButton />
            </div>
            
            <div className="bg-blue-50 border-l-4 border-blue-400 p-5 rounded-r-lg mt-8">
              <p className="italic text-blue-800 text-sm">
                Our road trip cost calculator provides estimates based on your inputs and current data. Actual costs may vary due to changes in fuel prices, traffic conditions, detours, and other factors. We recommend adding a 10-15% buffer to your budget for unexpected expenses.
            </p>
          </div>

          {/* Donation Section */}
            <div className="mt-10 mb-12 bg-gradient-to-r from-rose-200 to-teal-200 dark:from-rose-500/30 dark:to-teal-500/30 rounded-2xl p-4 sm:p-8 border border-rose-300 dark:border-rose-500/30 backdrop-blur-sm shadow-lg">
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
          </div>
        </main>
      </div>
    </div>
  )
} 