import Link from 'next/link'
import { getRoute, getGasPrices, routeCost, DEFAULT_VEHICLE, prettyDate } from '../road-trip-cost/lib'

// Road Trip Calculator page: "road trip planner", "trip planner", "gas calculator road trip",
// "gas buddy trip planner", "fuel cost calculator". Numbers come from our route data + EIA prices.
export const PLANNER_FAQS = (us: number, ex: { from: string; to: string; mi: number; gal: number; cost: number }) => [
  {
    q: 'How do I calculate gas cost for a road trip?',
    a: `Divide the distance by your car's MPG to get gallons, then multiply by the gas price. For example, ${ex.from} to ${ex.to} is ${Math.round(ex.mi).toLocaleString()} miles, which is about ${ex.gal.toFixed(1)} gallons in a ${DEFAULT_VEHICLE.mpg} MPG car and roughly $${Math.round(ex.cost)} in gas at this week's prices for the states on that route. This calculator does the math for any route and uses each state's price instead of one national average.`,
  },
  {
    q: 'Is this a road trip planner or just a gas calculator?',
    a: 'Both. Enter a start and destination to get the route, driving time and gas cost, then use the tabs to find hotels near your overnight stops and destination, attractions along the way and turn-by-turn directions.',
  },
  {
    q: 'Is this like the GasBuddy trip planner?',
    a: 'GasBuddy is best known for gas station prices near you. This calculator is built for planning the whole drive: the gas cost of the route with each state’s average price, your car’s real MPG, how many days the drive takes and where to stay. It’s free and needs no account.',
  },
]

export function plannerExample() {
  const r = getRoute('chicago-to-denver')!
  const gas = getGasPrices()
  const mid = routeCost(r, gas).vehicles.find((v) => v.key === DEFAULT_VEHICLE.key)!
  return { from: r.from.name, to: r.to.name, mi: r.distanceMi, gal: mid.gallons, cost: mid.oneWay, us: gas.prices.US, week: gas.weekOf }
}

export default function RoadTripPlannerGuide() {
  const ex = plannerExample()
  const faqs = PLANNER_FAQS(ex.us, ex)
  return (
    <section className="mt-12 bg-white rounded-xl border border-blue-100 shadow-sm p-6 text-gray-900 leading-relaxed">
      <h2 className="text-2xl md:text-3xl font-bold font-heading text-blue-900 mb-3">A road trip planner and gas calculator in one</h2>
      <p className="mb-3">
        Most trip planners give you a route. This one also tells you what the drive will cost. Type where you&apos;re leaving from and where you&apos;re
        going, add your car&apos;s MPG, and you get the distance, driving time and <strong>gas cost for the whole trip</strong>, then hotels near your
        overnight stops, attractions along the way and turn-by-turn directions.
      </p>

      <h3 className="text-xl font-semibold font-heading mt-6 mb-2">How the gas calculator works</h3>
      <p className="mb-3">
        <strong>Gas cost = (miles ÷ MPG) × price per gallon.</strong> Instead of one national average, the calculator uses the latest U.S. Energy
        Information Administration price for the states you drive through (week of {prettyDate(ex.week)}; U.S. average ${ex.us.toFixed(2)}).
      </p>
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-3">
        <div className="font-semibold text-blue-900 mb-1">Example: {ex.from} to {ex.to}</div>
        {Math.round(ex.mi).toLocaleString()} miles ÷ {DEFAULT_VEHICLE.mpg} MPG = {ex.gal.toFixed(1)} gallons, about <strong>${Math.round(ex.cost)}</strong> in gas one way at
        this week&apos;s prices in Illinois, Iowa, Nebraska and Colorado.{' '}
        <Link href="/road-trip-cost/chicago-to-denver" className="text-blue-700 underline">See the full Chicago to Denver breakdown</Link>
      </div>
      <p className="mb-3">
        Planning a popular drive? Browse <Link href="/road-trip-cost" className="text-blue-700 underline">gas costs for 159 road trips</Link> with
        suggested overnight stops, or check <Link href="/gas-prices" className="text-blue-700 underline">gas prices by state this week</Link>.
      </p>

      <h3 className="text-xl font-semibold font-heading mt-6 mb-3">Trip planner questions</h3>
      <div className="space-y-3">
        {faqs.map((f) => (
          <details key={f.q} className="rounded-xl border border-blue-100 p-4" open>
            <summary className="font-semibold cursor-pointer">{f.q}</summary>
            <p className="text-gray-700 mt-2">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
