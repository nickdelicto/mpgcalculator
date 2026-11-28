import dcCities from '../../data/road-trips/discovercars-cities.json'

// "Need a vehicle for this trip?" rental car / RV partner cards.
// Hidden until the affiliate links exist in the server env (.env.local on the VPS):
//   RENTAL_CAR_AFFILIATE_URL  Discover Cars link with your a_aid, e.g. https://www.discovercars.com/?a_aid=mpgcalculator
//   RV_AFFILIATE_URL          Outdoorsy link from AvantLink/CJ
// Discover Cars links go straight to the city's rental page when one exists
// (data/road-trips/discovercars-cities.json), keeping the a_aid query string.
// Either URL may contain {route} (replaced with the page's route slug) for sub-ID tracking.

interface City { name: string; state: string }
interface Props { routeSlug: string; from: City; to: City; distanceMi: number }

const CITY_PATHS = (dcCities as { cities: Record<string, string> }).cities
const fill = (url: string, slug: string) => url.replace(/\{route\}/g, encodeURIComponent(slug))

/** Discover Cars deep link for a city, or the plain affiliate link if we don't know its page. */
function carLink(base: string, city: City, slug: string) {
  const url = fill(base, slug)
  const path = CITY_PATHS[`${city.name}|${city.state}`]
  try {
    const u = new URL(url)
    if (path && /(^|\.)discovercars\.com$/.test(u.hostname)) return `${u.origin}${path}${u.search}`
  } catch {
    // not a URL we can rewrite; use it as given
  }
  return url
}

export default function RentalOffers({ routeSlug, from, to, distanceMi }: Props) {
  const car = process.env.RENTAL_CAR_AFFILIATE_URL
  const rv = process.env.RV_AFFILIATE_URL
  if (!car && !rv) return null
  const long = distanceMi >= 300
  return (
    <section className="mt-10">
      <h2 className="text-2xl font-heading font-bold text-gray-900 mb-2">Need a vehicle for this trip?</h2>
      <p className="text-gray-600 mb-4">
        {long
          ? `Flying into ${to.name} and driving back, or don't want ${Math.round(distanceMi * 2).toLocaleString()} miles on your own car? Compare rentals before you go.`
          : `No car, or want something bigger for the ${from.name} to ${to.name} drive? Compare rentals before you go.`}
      </p>
      <div className="grid sm:grid-cols-2 gap-3">
        {car && (
          <div className="bg-white rounded-xl border border-emerald-200 p-4 shadow-sm">
            <div className="text-xs uppercase text-emerald-700 font-semibold">Rental car</div>
            <a href={carLink(car, from, routeSlug)} target="_blank" rel="sponsored noopener" className="block group">
              <div className="font-bold text-gray-900 group-hover:text-emerald-800">Compare car rental prices in {from.name}</div>
              <div className="text-sm text-gray-600 mt-1">Hundreds of rental companies in one search, free cancellation on most bookings.</div>
              <div className="text-sm text-blue-700 mt-2">Search rental cars in {from.name} →</div>
            </a>
            {long && (
              <a href={carLink(car, to, routeSlug)} target="_blank" rel="sponsored noopener" className="block text-sm text-blue-700 mt-2 hover:underline">
                Flying in? Rental cars in {to.name} →
              </a>
            )}
          </div>
        )}
        {rv && (
          <a href={fill(rv, routeSlug)} target="_blank" rel="sponsored noopener" className="block bg-white rounded-xl border border-orange-200 p-4 shadow-sm hover:shadow-md hover:border-orange-400 transition">
            <div className="text-xs uppercase text-orange-700 font-semibold">RV or campervan</div>
            <div className="font-bold text-gray-900">Make the drive the trip: rent an RV</div>
            <div className="text-sm text-gray-600 mt-1">Sleep on the road instead of paying for hotels along the way.</div>
            <div className="text-sm text-blue-700 mt-2">Browse RV rentals →</div>
          </a>
        )}
      </div>
      <p className="text-xs text-gray-500 mt-2">Partner links. We may earn a commission at no cost to you.</p>
    </section>
  )
}
