import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import GasAlertBox from '../../components/GasAlertBox'
import { SITE, usd, usd2, miles, hm, prettyDate, VEHICLE_TYPES, STATE_NAMES } from '../../road-trip-cost/lib'
import { STATE_LIST } from '../../gas-prices/lib'
import { AIRPORTS, getAirport, airportTrips, airportGas, airportRentalLink } from '../airports'

export const revalidate = 86400
export const dynamicParams = false
export function generateStaticParams() {
  return AIRPORTS.map((a) => ({ airport: a.slug }))
}

interface Props { params: Promise<{ airport: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { airport } = await params
  const a = getAirport(airport)
  if (!a) return {}
  const trips = airportTrips(a)
  const title = `${a.city} Airport Car Rental for Road Trips and Gas Costs`
  const description = `Renting a car at ${a.city} airport (${a.code}) for a road trip? Drive times and gas costs for ${trips.length} trips from ${a.city}, including ${trips.slice(0, 2).map((t) => t.dest.name).join(' and ')}, plus rental tips.`
  const url = `${SITE}/car-rental-road-trips/${a.slug}`
  return { title, description, alternates: { canonical: url }, openGraph: { title, description, url, type: 'article', siteName: 'MPGCalculator.net' } }
}

export default async function AirportPage({ params }: Props) {
  const { airport } = await params
  const a = getAirport(airport)
  if (!a) notFound()
  const trips = airportTrips(a)
  const gas = airportGas(a)
  const link = airportRentalLink(a)
  const compact = VEHICLE_TYPES.find((v) => v.key === 'compact')!
  const suv = VEHICLE_TYPES.find((v) => v.key === 'smallsuv')!
  const top = trips[0]
  const longest = [...trips].sort((x, y) => y.r.distanceMi - x.r.distanceMi)[0]
  const stateSlug = STATE_LIST.find((s) => s.ab === a.state)?.slug
  const oneWay = trips.filter((t) => t.r.distanceMi > 350).slice(0, 2)
  const url = `${SITE}/car-rental-road-trips/${a.slug}`

  const faqs = [
    { q: `How much is gas for a road trip from ${a.city} airport to ${top.dest.name}?`, a: `${a.city} to ${top.dest.name} is ${miles(top.r.distanceMi)} each way, about ${hm(top.r.durationH)} of driving. A round trip uses about ${(top.suvGallons * 2).toFixed(0)} gallons in a ${suv.mpg} MPG small SUV, roughly ${usd(top.suvRoundTrip)} in gas at this week's EIA prices, or ${usd(top.compactRoundTrip)} in a ${compact.mpg} MPG compact car.` },
    { q: `Can I pick up a rental car at ${a.city} airport and drop it off somewhere else?`, a: `Usually yes. Most rental companies allow one-way rentals between airports, but they often add a drop-off fee that can be large for long distances. Compare the one-way price with a round trip before you book${oneWay.length ? `, especially for longer drives like ${oneWay.map((t) => `${a.city} to ${t.dest.name}`).join(' or ')}` : ''}.` },
    { q: `What size rental car is best for a road trip from ${a.city}?`, a: `A compact car (${compact.mpg} MPG average) is cheapest on gas. A small SUV (${suv.mpg} MPG) uses about ${(((compact.mpg / suv.mpg) - 1) * 100).toFixed(0)}% more fuel but has more room for luggage and handles rough or snowy roads better. For ${longest.dest.name} (${miles(longest.r.distanceMi * 2)} round trip) that difference is about ${usd(longest.suvRoundTrip - longest.compactRoundTrip)} in gas.` },
    { q: `How much is gas near ${a.city} airport this week?`, a: `Regular gas averages ${usd2(gas.price)} a gallon (${gas.basis}, EIA week of ${prettyDate(gas.weekOf)}). Most rentals come with a full tank and expect it back full, so fill up shortly before you return the car.` },
  ]
  const jsonLd = [
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
      { '@type': 'ListItem', position: 2, name: 'Car Rental Road Trips', item: `${SITE}/car-rental-road-trips` },
      { '@type': 'ListItem', position: 3, name: `${a.city} Airport`, item: url },
    ] },
    { '@context': 'https://schema.org', '@type': 'ItemList', name: `Road trips from ${a.airport}`, itemListElement: trips.map((t, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE}/road-trip-cost/${t.r.slug}`, name: `${a.city} to ${t.dest.name}` })) },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
  ]

  const Cta = ({ compactStyle = false }: { compactStyle?: boolean }) => link ? (
    <a href={link} target="_blank" rel="sponsored noopener" className={`block rounded-xl ${compactStyle ? 'p-4' : 'p-5'} bg-gradient-to-r from-emerald-600 to-teal-700 text-white hover:from-emerald-700 hover:to-teal-800 shadow-sm`}>
      <div className="text-xs uppercase tracking-wide text-emerald-100 font-semibold">Rental cars at {a.code}</div>
      <div className="font-heading font-bold text-xl">Compare car rental prices at {a.city} airport →</div>
      <div className="text-sm text-emerald-50 mt-1">Hundreds of rental companies in one search, free cancellation on most bookings.</div>
    </a>
  ) : null

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="text-sm text-gray-500 mb-3" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-blue-700">Home</Link> › <Link href="/car-rental-road-trips" className="hover:text-blue-700">Car Rental Road Trips</Link> › <span className="text-gray-700">{a.city} Airport</span>
      </nav>
      <h1 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-3">{a.city} Airport Car Rental for Road Trips</h1>
      <p className="text-lg text-gray-700 mb-2">
        Flying into {a.airport} ({a.code}) and renting a car? {a.intro}
      </p>
      <p className="text-gray-700 mb-6">
        Below are drive times and gas costs for {trips.length} road trips from {a.city}, worked out with this week&apos;s EIA gas prices for every state on the route.
      </p>

      <Cta />

      <section className="mt-10">
        <h2 className="text-2xl font-heading font-bold text-gray-900 mb-2">Road trips from {a.city} airport</h2>
        <p className="text-gray-600 mb-4">Round-trip gas cost in a rental, at this week&apos;s prices. Tap a trip for the full breakdown, overnight stops and hotels.</p>
        <div className="overflow-x-auto bg-white rounded-xl border border-blue-100 shadow-sm">
          <table className="w-full text-[13px] sm:text-sm">
            <thead className="bg-blue-50 text-gray-700">
              <tr><th className="text-left px-2 py-3 sm:p-3">Drive to</th><th className="text-right px-2 py-3 sm:p-3">Distance</th><th className="text-right px-2 py-3 sm:p-3 hidden sm:table-cell">Drive time</th><th className="text-right px-2 py-3 sm:p-3">Compact</th><th className="text-right px-2 py-3 sm:p-3">Small SUV</th></tr>
            </thead>
            <tbody>
              {trips.map((t) => (
                <tr key={t.r.slug} className={`border-t border-blue-50 ${t.featured ? '' : 'text-gray-700'}`}>
                  <td className="px-2 py-3 sm:p-3"><Link href={`/road-trip-cost/${t.r.slug}`} className="text-blue-800 font-medium hover:underline">{t.dest.name}, {t.dest.state}</Link></td>
                  <td className="px-2 py-3 sm:p-3 text-right">{miles(t.r.distanceMi)}</td>
                  <td className="px-2 py-3 sm:p-3 text-right hidden sm:table-cell">{hm(t.r.durationH)}</td>
                  <td className="px-2 py-3 sm:p-3 text-right">{usd(t.compactRoundTrip)}</td>
                  <td className="px-2 py-3 sm:p-3 text-right font-semibold">{usd(t.suvRoundTrip)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 mt-2">Round trip gas only, using EPA averages for 2024 and 2025 models ({compact.mpg} MPG compact, {suv.mpg} MPG small SUV). Rental rates, tolls and parking are extra.</p>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-heading font-bold text-gray-900 mb-2">Gas for your rental</h2>
        <p className="text-gray-700">
          Regular gas in {STATE_NAMES[a.state]} averages <strong>{usd2(gas.price)} a gallon</strong> this week ({gas.basis}, EIA week of {prettyDate(gas.weekOf)}).
          That works out to about {usd((100 / compact.mpg) * gas.price)} per 100 miles in a compact and {usd((100 / suv.mpg) * gas.price)} in a small SUV.{' '}
          {stateSlug && <Link href={`/gas-prices/${stateSlug}`} className="text-blue-700 underline">{STATE_NAMES[a.state]} gas prices this week</Link>}
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-heading font-bold text-gray-900 mb-3">Tips for renting a car for a road trip</h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-800">
          <li><strong>Check the mileage policy.</strong> Most airport rentals include unlimited miles, but some deals cap them. A capped rental can get expensive on a long road trip.</li>
          <li><strong>Price one-way trips both ways.</strong> Dropping the car at a different airport usually adds a fee. Sometimes a round trip plus a short flight is cheaper.</li>
          <li><strong>Return it full.</strong> Prepaid fuel and refueling charges usually cost more than filling up yourself near the airport.</li>
          <li><strong>Book early for holidays and peak season.</strong> Airport rental prices rise as cars sell out, and free cancellation lets you rebook if prices drop.</li>
          <li><strong>Pick the car for the route.</strong> A compact saves gas on paved highway trips. For mountain passes, dirt roads or winter driving, a small SUV or all-wheel drive is worth the extra fuel.</li>
          <li><strong>Add drivers at the counter.</strong> Sharing a long drive is safer, but only drivers on the contract are covered.</li>
        </ul>
      </section>

      <div className="mt-8"><Cta compactStyle /></div>

      <section className="mt-10">
        <h2 className="text-2xl font-heading font-bold text-gray-900 mb-3">{a.city} airport rental questions</h2>
        <div className="space-y-3">
          {faqs.map((f) => (
            <details key={f.q} className="bg-white rounded-xl border border-blue-100 p-4 shadow-sm" open>
              <summary className="font-semibold text-gray-900 cursor-pointer">{f.q}</summary>
              <p className="text-gray-700 mt-2">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <GasAlertBox defaultState={a.state} source="airport-guide" heading={`Get ${STATE_NAMES[a.state]} gas prices and your driving cost every week`} />
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-heading font-bold text-gray-900 mb-3">More fly-and-drive airports</h2>
        <div className="grid sm:grid-cols-2 gap-2">
          {AIRPORTS.filter((o) => o.slug !== a.slug).map((o) => (
            <Link key={o.slug} href={`/car-rental-road-trips/${o.slug}`} className="bg-white rounded-lg border border-blue-100 px-4 py-3 hover:border-blue-400 text-blue-800 font-medium">{o.city} airport ({o.code}) road trips</Link>
          ))}
        </div>
      </section>

      <p className="text-xs text-gray-500 mt-8">
        Rental links are partner links. We may earn a commission at no cost to you. Routes from OpenRouteService (OpenStreetMap data); gas prices from the U.S. Energy
        Information Administration. Planning a different trip? Use the <Link href="/road-trip-cost-calculator" className="underline">Road Trip Cost Calculator</Link>.
      </p>
    </div>
  )
}
