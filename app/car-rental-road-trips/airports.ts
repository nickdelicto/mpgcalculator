import { ROUTES, getGasPrices, routeCost, statePrice, type RouteRec } from '../road-trip-cost/lib'

// Fly-and-drive airport guides. Intros are short, factual, and specific to each airport's
// road trips; everything numeric is computed from our route data and EIA prices.
export interface Airport {
  slug: string
  city: string
  state: string
  airport: string
  code: string
  dcPath: string // Discover Cars airport page
  intro: string
  /** Route slugs to feature first (park and scenic drives) */
  featured: string[]
}

export const AIRPORTS: Airport[] = [
  {
    slug: 'denver-airport', city: 'Denver', state: 'CO', airport: 'Denver International Airport', code: 'DEN', dcPath: '/usa-colorado/denver/den',
    intro: 'Denver is the gateway to the Rockies. From the airport you can be in the mountains in a couple of hours, or set off on longer drives to Moab, Jackson Hole, Mount Rushmore and Yellowstone.',
    featured: ['denver-to-moab', 'denver-to-aspen', 'denver-to-jackson', 'denver-to-west-yellowstone', 'denver-to-keystone', 'denver-to-colorado-springs'],
  },
  {
    slug: 'orlando-airport', city: 'Orlando', state: 'FL', airport: 'Orlando International Airport', code: 'MCO', dcPath: '/usa-florida/orlando/mco',
    intro: 'Most Florida road trips start in Orlando. The Gulf Coast, St. Augustine and Miami are all an easy drive, and the Keys make a long but classic day on the road.',
    featured: ['orlando-to-tampa', 'orlando-to-st-augustine', 'miami-to-orlando', 'orlando-to-jacksonville', 'orlando-to-key-west'],
  },
  {
    slug: 'las-vegas-airport', city: 'Las Vegas', state: 'NV', airport: 'Harry Reid International Airport', code: 'LAS', dcPath: '/usa-nevada/las-vegas/las',
    intro: 'Las Vegas is the classic fly-and-drive start for the Southwest. Zion, the Grand Canyon and Page (for Horseshoe Bend and Lake Powell) are all a few hours away.',
    featured: ['las-vegas-to-springdale', 'las-vegas-to-grand-canyon-village', 'las-vegas-to-page', 'los-angeles-to-las-vegas', 'las-vegas-to-salt-lake-city'],
  },
  {
    slug: 'phoenix-airport', city: 'Phoenix', state: 'AZ', airport: 'Phoenix Sky Harbor International Airport', code: 'PHX', dcPath: '/usa-arizona/phoenix/phx',
    intro: 'Phoenix puts Sedona’s red rocks under two hours away and the Grand Canyon’s South Rim within a long morning’s drive, with Tucson and Southern California also in reach.',
    featured: ['phoenix-to-sedona', 'phoenix-to-grand-canyon-village', 'phoenix-to-tucson', 'los-angeles-to-phoenix', 'phoenix-to-albuquerque'],
  },
  {
    slug: 'salt-lake-city-airport', city: 'Salt Lake City', state: 'UT', airport: 'Salt Lake City International Airport', code: 'SLC', dcPath: '/usa-utah/salt-lake-city/slc',
    intro: 'Salt Lake City is the closest big airport to many of the West’s national parks. Yellowstone, Grand Teton, Arches and Zion are all one long day of driving or less.',
    featured: ['salt-lake-city-to-west-yellowstone', 'salt-lake-city-to-jackson', 'salt-lake-city-to-moab', 'salt-lake-city-to-springdale', 'salt-lake-city-to-boise'],
  },
  {
    slug: 'miami-airport', city: 'Miami', state: 'FL', airport: 'Miami International Airport', code: 'MIA', dcPath: '/usa-florida/miami/mia',
    intro: 'From Miami the Overseas Highway runs all the way to Key West, and Orlando and Tampa are a half day north if you want to see more of Florida.',
    featured: ['miami-to-key-west', 'miami-to-orlando', 'miami-to-tampa'],
  },
]

export const getAirport = (slug: string) => AIRPORTS.find((a) => a.slug === slug)

/** Road trips that start or end in the airport's city, featured first, as drives from the airport. */
export function airportTrips(a: Airport) {
  const gas = getGasPrices()
  const touches = (r: RouteRec) => (r.from.name === a.city && r.from.state === a.state) || (r.to.name === a.city && r.to.state === a.state)
  const list = ROUTES.filter(touches)
  const order = (r: RouteRec) => { const i = a.featured.indexOf(r.slug); return i === -1 ? 100 + r.distanceMi / 100 : i }
  return list.sort((x, y) => order(x) - order(y)).map((r) => {
    const dest = r.from.name === a.city ? r.to : r.from
    const c = routeCost(r, gas)
    const suv = c.vehicles.find((v) => v.key === 'smallsuv')!
    const compact = c.vehicles.find((v) => v.key === 'compact')!
    return { r, dest, featured: a.featured.includes(r.slug), suvRoundTrip: suv.roundTrip, compactRoundTrip: compact.roundTrip, suvGallons: suv.gallons }
  })
}

export function airportGas(a: Airport) {
  const gas = getGasPrices()
  return { ...statePrice(gas, a.state), weekOf: gas.weekOf }
}

/** Discover Cars airport link with our affiliate query string (null if not configured). */
export function airportRentalLink(a: Airport) {
  const base = process.env.RENTAL_CAR_AFFILIATE_URL
  if (!base) return null
  try {
    const u = new URL(base)
    return /(^|\.)discovercars\.com$/.test(u.hostname) ? `${u.origin}${a.dcPath}${u.search}` : base
  } catch {
    return base
  }
}
