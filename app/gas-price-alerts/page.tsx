import { Metadata } from 'next'
import Link from 'next/link'
import GasAlertBox from '../components/GasAlertBox'
import { getPriceSnapshot } from '../lib/energyPrices'

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Free Weekly Gas Price Alerts by Email — Your Own Driving Cost',
  description: 'Get a free weekly email with what driving costs you: your car, your miles, your state’s latest EIA gas price. Electric vehicle? We track home electricity prices too.',
  alternates: { canonical: 'https://mpgcalculator.net/gas-price-alerts' },
}

const prettyDate = (iso: string) => new Date(iso + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })

export default function GasPriceAlertsPage() {
  const snap = getPriceSnapshot()
  const rows = Object.entries(snap.states).map(([ab, s]) => ({ ab, ...s })).sort((a, b) => a.gas - b.gas || a.name.localeCompare(b.name))
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-3">Weekly gas price alerts — for your car, not just the pump</h1>
      <p className="text-lg text-gray-700 mb-6">
        Gas apps tell you the price per gallon. We tell you what it means for <strong>you</strong>: every week, one short email with your
        driving cost based on your car&apos;s MPG, how far you drive and the latest U.S. Energy Information Administration price for your state.
        Driving electric? We use your state&apos;s home electricity price instead.
      </p>

      <GasAlertBox source="alerts-page" />

      <section className="mt-10">
        <h2 className="text-2xl font-heading font-bold text-gray-900 mb-3">What you get each week</h2>
        <ul className="list-disc pl-5 space-y-1 text-gray-800">
          <li>Your cost to drive this week, this month and this year</li>
          <li>Your state&apos;s gas price and whether it went up or down</li>
          <li>What the same miles would cost in an EV (or a gas car, if you drive electric)</li>
          <li>Road trip gas costs when you&apos;re planning a drive</li>
        </ul>
        <p className="text-sm text-gray-600 mt-3">One email a week. Unsubscribe with one click. We never sell your email.</p>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-heading font-bold text-gray-900 mb-2">Gas and electricity prices by state</h2>
        <p className="text-gray-600 mb-3">
          Regular gas: EIA week of {prettyDate(snap.gasWeekOf)} (states without their own EIA series use their region&apos;s average).
          Electricity: EIA average residential price, {snap.elecPeriod}.
        </p>
        <div className="overflow-x-auto bg-white rounded-xl border border-blue-100 shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-blue-50 text-gray-700">
              <tr><th className="text-left p-3">State</th><th className="text-right p-3">Regular gas</th><th className="text-right p-3">Home electricity</th></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.ab} className="border-t border-blue-50">
                  <td className="p-3 font-medium text-gray-900">{r.name}</td>
                  <td className="p-3 text-right">${r.gas.toFixed(2)}<div className="text-xs text-gray-500">{r.gasBasis}</div></td>
                  <td className="p-3 text-right">{r.elecCents.toFixed(1)}¢/kWh</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-gray-600 mt-3">
          Planning a drive? See <Link href="/road-trip-cost" className="text-blue-700 underline">gas costs for 159 popular road trips</Link> or
          compare cars in the <Link href="/fuel-savings-calculator" className="text-blue-700 underline">Fuel Savings Calculator</Link>.
        </p>
      </section>
    </div>
  )
}
