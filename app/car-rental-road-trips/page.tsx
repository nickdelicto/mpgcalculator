import { Metadata } from 'next'
import Link from 'next/link'
import { SITE, miles } from '../road-trip-cost/lib'
import { AIRPORTS, airportTrips } from './airports'

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Fly and Drive Road Trips - Airport Car Rental Guides with Gas Costs',
  description: 'Fly into Denver, Orlando, Las Vegas, Phoenix, Salt Lake City or Miami and rent a car. Road trips from each airport with drive times, gas costs and rental tips.',
  alternates: { canonical: `${SITE}/car-rental-road-trips` },
  openGraph: { title: 'Fly and Drive Road Trips', description: 'Airport car rental guides with road trips, drive times and gas costs.', url: `${SITE}/car-rental-road-trips`, type: 'website', siteName: 'MPGCalculator.net' },
}

export default function CarRentalHub() {
  const cards = AIRPORTS.map((a) => ({ a, trips: airportTrips(a) }))
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-3">Fly and drive road trips</h1>
      <p className="text-lg text-gray-700 mb-8">
        Some of the best American road trips start at an airport. Fly in, pick up a rental car and drive to the national parks, mountains or beaches.
        Each guide lists the road trips from that airport with drive times and gas costs at this week&apos;s prices.
      </p>
      <div className="grid sm:grid-cols-2 gap-4">
        {cards.map(({ a, trips }) => (
          <Link key={a.slug} href={`/car-rental-road-trips/${a.slug}`} className="block bg-white rounded-xl border border-blue-100 p-5 shadow-sm hover:border-blue-400 hover:shadow-md transition">
            <div className="text-xs uppercase tracking-wide text-gray-500">{a.airport} ({a.code})</div>
            <div className="font-heading font-bold text-xl text-gray-900">{a.city} airport road trips</div>
            <div className="text-sm text-gray-600 mt-1">{trips.length} trips, including {trips.slice(0, 3).map((t) => `${t.dest.name} (${miles(t.r.distanceMi)})`).join(', ')}</div>
          </Link>
        ))}
      </div>
      <p className="text-sm text-gray-600 mt-8">
        Driving your own car? See <Link href="/road-trip-cost" className="text-blue-700 underline">gas costs for 159 road trips</Link> or plan any route with the{' '}
        <Link href="/road-trip-cost-calculator" className="text-blue-700 underline">Road Trip Cost Calculator</Link>.
      </p>
    </div>
  )
}
