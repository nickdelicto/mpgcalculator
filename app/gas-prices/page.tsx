import { Metadata } from 'next'
import Link from 'next/link'
import GasAlertBox from '../components/GasAlertBox'
import { SITE, usd2, prettyDate } from '../road-trip-cost/lib'
import { STATE_LIST, stateData } from './lib'

export const revalidate = 86400

export async function generateMetadata(): Promise<Metadata> {
  const oh = stateData('OH')
  const title = `Gas Prices by State This Week and Cost to Charge an EV`
  const description = `Weekly regular gas prices for all 50 states and DC from the EIA (week of ${prettyDate(oh.weekOf)}), with what it costs to charge an electric car at home in each state.`
  return { title, description, alternates: { canonical: `${SITE}/gas-prices` }, openGraph: { title, description, url: `${SITE}/gas-prices`, type: 'website', siteName: 'MPGCalculator.net' } }
}

export default function GasPricesHub() {
  const rows = STATE_LIST.map((s) => ({ ...s, d: stateData(s.ab) }))
  const byGas = [...rows].sort((a, b) => a.d.gas - b.d.gas)
  const byElec = [...rows].sort((a, b) => a.d.elecCents - b.d.elecCents)
  const weekOf = rows[0].d.weekOf
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-3">Gas prices by state this week</h1>
      <p className="text-lg text-gray-700 mb-6">
        Average regular gas price and home EV charging cost for every state, from U.S. Energy Information Administration data
        (gas: week of {prettyDate(weekOf)}). Cheapest gas this week: <strong>{byGas[0].name} ({usd2(byGas[0].d.gas)})</strong>. Most expensive:{' '}
        <strong>{byGas[byGas.length - 1].name} ({usd2(byGas[byGas.length - 1].d.gas)})</strong>. Cheapest electricity: <strong>{byElec[0].name} ({byElec[0].d.elecCents.toFixed(1)}¢/kWh)</strong>.
      </p>

      <div className="mb-10"><GasAlertBox source="gas-prices-hub" /></div>

      <div className="overflow-x-auto bg-white rounded-xl border border-blue-100 shadow-sm mb-8">
        <table className="w-full text-sm">
          <thead className="bg-blue-50 text-gray-700">
            <tr><th className="text-left p-3">State</th><th className="text-right p-3">Regular gas</th><th className="text-right p-3">vs last week</th><th className="text-right p-3 hidden sm:table-cell">Electricity</th><th className="text-right p-3">Full EV charge</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.ab} className="border-t border-blue-50">
                <td className="p-3"><Link href={`/gas-prices/${r.slug}`} className="text-blue-800 font-medium hover:underline">{r.name}</Link></td>
                <td className="p-3 text-right font-semibold">{usd2(r.d.gas)}</td>
                <td className={`p-3 text-right ${r.d.change !== null && r.d.change < -0.005 ? 'text-green-700' : r.d.change !== null && r.d.change > 0.005 ? 'text-red-700' : 'text-gray-600'}`}>
                  {r.d.change === null ? 'n/a' : `${r.d.change > 0.005 ? '+' : r.d.change < -0.005 ? '−' : ''}${Math.abs(r.d.change * 100).toFixed(0)}¢`}
                </td>
                <td className="p-3 text-right hidden sm:table-cell">{r.d.elecCents.toFixed(1)}¢</td>
                <td className="p-3 text-right">{usd2(r.d.fullCharge)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-500">
        Gas: EIA weekly retail regular gasoline. States without their own EIA series show their EIA region average. Electricity: EIA average residential price
        ({rows[0].d.elecPeriod}). Full charge assumes a 75 kWh battery charged at home.
      </p>
    </div>
  )
}
