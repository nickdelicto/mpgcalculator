import { Metadata } from 'next'
import Link from 'next/link'
import { ROUTES, SITE, getGasPrices, routeCost, DEFAULT_VEHICLE, usd, usd2, miles, hm, prettyDate, STATE_NAMES } from './lib'

export const revalidate = 86400

const REGIONS = ['West', 'Mountain', 'Midwest', 'South Central', 'Southeast', 'Northeast']

export async function generateMetadata(): Promise<Metadata> {
  const gas = getGasPrices()
  const title = `Road Trip Gas Costs for ${ROUTES.length} Popular U.S. Drives (${gas.weekOf.slice(0, 4)})`
  const description = `Distance, driving time and gas cost for ${ROUTES.length} popular American road trips, updated weekly with EIA gas prices (U.S. regular: ${usd2(gas.prices.US)} for the week of ${prettyDate(gas.weekOf)}).`
  return {
    title,
    description,
    alternates: { canonical: `${SITE}/road-trip-cost` },
    openGraph: { title, description, url: `${SITE}/road-trip-cost`, type: 'website', siteName: 'MPGCalculator.net' },
  }
}

export default function RoadTripCostHub() {
  const gas = getGasPrices()
  const rows = ROUTES.map((r) => ({ r, cost: routeCost(r, gas).vehicles.find((v) => v.key === DEFAULT_VEHICLE.key)!.oneWay }))
  const stateRows = Object.entries(gas.prices)
    .filter(([k]) => STATE_NAMES[k])
    .map(([k, v]) => ({ name: STATE_NAMES[k], price: v }))
    .sort((a, b) => a.price - b.price)
  const longest = [...rows].sort((a, b) => b.r.distanceMi - a.r.distanceMi)[0]
  const cheapest = [...rows].sort((a, b) => a.cost - b.cost)[0]

  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'ItemList',
    name: 'Popular U.S. road trip gas costs',
    itemListElement: ROUTES.map((r, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE}/road-trip-cost/${r.slug}`, name: `${r.from.name} to ${r.to.name}` })),
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <h1 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-3">How much does a road trip cost in gas?</h1>
      <p className="text-gray-700 text-lg mb-2">
        Gas cost, distance and driving time for {ROUTES.length} of America&apos;s most popular drives — from a{' '}
        {miles(cheapest.r.distanceMi)} hop like {cheapest.r.from.name} to {cheapest.r.to.name} ({usd(cheapest.cost)}) to the{' '}
        {miles(longest.r.distanceMi)} {longest.r.from.name} to {longest.r.to.name} haul ({usd(longest.cost)}).
      </p>
      <p className="text-gray-600 mb-8">
        Costs are one way in a {DEFAULT_VEHICLE.label.toLowerCase()} ({DEFAULT_VEHICLE.mpg} MPG EPA average) using EIA regular gas prices for
        each state on the route, week of {prettyDate(gas.weekOf)} (U.S. average {usd2(gas.prices.US)}/gal). Each route page has costs for
        SUVs, pickups and hybrids, a state-by-state breakdown and suggested overnight stops.
      </p>

      <div className="bg-gradient-to-r from-blue-700 to-indigo-700 rounded-xl p-5 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-10">
        <div>
          <div className="font-bold text-lg">Planning a different trip?</div>
          <div className="text-blue-100 text-sm">Enter any start, destination and your car in the Road Trip Calculator.</div>
        </div>
        <Link href="/road-trip-cost-calculator" className="shrink-0 bg-white text-blue-800 font-semibold px-5 py-2.5 rounded-lg hover:bg-blue-50 text-center">
          Open the Road Trip Calculator →
        </Link>
      </div>

      {REGIONS.map((region) => {
        const list = rows.filter((x) => x.r.region === region).sort((a, b) => a.r.from.name.localeCompare(b.r.from.name) || a.r.distanceMi - b.r.distanceMi)
        if (!list.length) return null
        return (
          <section key={region} className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">{region} road trips</h2>
            <div className="overflow-x-auto bg-white rounded-xl border border-blue-100 shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-blue-50 text-gray-700">
                  <tr><th className="text-left p-3">Route</th><th className="text-right p-3">Distance</th><th className="text-right p-3 hidden sm:table-cell">Drive time</th><th className="text-right p-3">Gas, one way</th></tr>
                </thead>
                <tbody>
                  {list.map(({ r, cost }) => (
                    <tr key={r.slug} className="border-t border-blue-50">
                      <td className="p-3"><Link href={`/road-trip-cost/${r.slug}`} className="text-blue-800 font-medium hover:underline">{r.from.name} → {r.to.name}</Link></td>
                      <td className="p-3 text-right">{miles(r.distanceMi)}</td>
                      <td className="p-3 text-right hidden sm:table-cell">{hm(r.durationH)}</td>
                      <td className="p-3 text-right font-semibold">{usd(cost)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )
      })}

      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Gas prices this week</h2>
        <p className="text-gray-600 mb-3">Regular gasoline, week of {prettyDate(gas.weekOf)}. States not listed use their EIA region average on route pages.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {stateRows.map((s) => (
            <div key={s.name} className="bg-white rounded-lg border border-blue-100 px-4 py-2 flex justify-between">
              <span className="text-gray-800">{s.name}</span><span className="font-semibold">{usd2(s.price)}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">Source: <a href={gas.sourceUrl} className="underline" rel="nofollow noopener" target="_blank">U.S. Energy Information Administration</a>.</p>
      </section>
    </div>
  )
}
