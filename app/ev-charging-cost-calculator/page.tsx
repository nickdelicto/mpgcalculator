import { Metadata } from 'next'
import Link from 'next/link'
import EvChargeCalculator from '../components/EvChargeCalculator'
import GasAlertBox from '../components/GasAlertBox'
import { getPriceSnapshot } from '../lib/energyPrices'
import { STATE_LIST } from '../gas-prices/lib'

export const revalidate = 86400
const URL_ = 'https://mpgcalculator.net/ev-charging-cost-calculator'

export const metadata: Metadata = {
  title: 'EV Charging Cost Calculator - Cost to Charge an Electric Car by State',
  description: 'See what it costs to charge an electric car at home in your state, per full charge, per mile and per month, and how it compares with gas. Uses EIA electricity prices.',
  alternates: { canonical: URL_ },
  openGraph: { title: 'EV Charging Cost Calculator', description: 'Cost to charge an electric car at home in every state, with a gas comparison.', url: URL_, type: 'website', siteName: 'MPGCalculator.net' },
}

export default function EvChargingPage() {
  const snap = getPriceSnapshot()
  const rows = STATE_LIST.map((s) => ({ ...s, ...snap.states[s.ab] })).sort((a, b) => a.elecCents - b.elecCents)
  const cheap = rows[0], dear = rows[rows.length - 1]
  const exState = snap.states.OH

  const faqs = [
    { q: 'How much does it cost to charge an electric car at home?', a: `Multiply your battery size in kWh by your electricity price. A 75 kWh battery at ${exState.elecCents.toFixed(1)}¢ per kWh (the Ohio average, EIA ${snap.elecPeriod}) costs about $${((75 * exState.elecCents) / 100).toFixed(2)} for a full charge from empty. Most days you only top up part of the battery, so a typical charge costs less.` },
    { q: 'Which state has the cheapest electricity for charging an EV?', a: `Among EIA average residential prices for ${snap.elecPeriod}, ${cheap.name} is cheapest at ${cheap.elecCents.toFixed(1)}¢ per kWh and ${dear.name} is the most expensive at ${dear.elecCents.toFixed(1)}¢ per kWh.` },
    { q: 'Is it cheaper to charge an EV than to buy gas?', a: 'Charging at home usually costs much less per mile than gas in most states. Public fast charging can cost two to three times more than home charging, which narrows or removes the gap. Use the calculator above with your own prices to compare.' },
    { q: 'How many miles per kWh does an electric car get?', a: 'Most electric cars get about 3 to 4 miles per kWh in mixed driving. Large SUVs and pickups get less, small efficient cars get more, and cold weather lowers it.' },
  ]
  const jsonLd = [
    { '@context': 'https://schema.org', '@type': 'WebApplication', name: 'EV Charging Cost Calculator', url: URL_, applicationCategory: 'UtilitiesApplication', operatingSystem: 'Any', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
  ]

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <h1 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-3">EV Charging Cost Calculator</h1>
      <p className="text-lg text-gray-700 mb-6">
        Find out what it costs to charge an electric car in your state, per full charge, per mile and per month, and how that compares with
        filling up a gas car. Home charging uses each state&apos;s average residential electricity price from the U.S. Energy Information Administration.
      </p>

      <EvChargeCalculator snapshot={snap} />

      <section className="mt-10 leading-relaxed text-gray-900">
        <h2 className="text-2xl font-heading font-bold mb-2">How to calculate EV charging cost</h2>
        <p className="mb-2"><strong>Cost of a full charge = battery size (kWh) × price per kWh.</strong> <strong>Cost per mile = price per kWh ÷ miles per kWh.</strong></p>
        <p>
          For example, a 75 kWh battery charged at home in Ohio at {exState.elecCents.toFixed(1)}¢ per kWh costs about ${((75 * exState.elecCents) / 100).toFixed(2)} from empty to full.
          At 3.5 miles per kWh that&apos;s {(exState.elecCents / 3.5).toFixed(1)}¢ a mile, against {((exState.gas / 28) * 100).toFixed(1)}¢ a mile for a 28 MPG car at Ohio&apos;s
          ${exState.gas.toFixed(2)} gas. Your electricity bill shows your actual rate, which may be higher or lower than the state average.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-heading font-bold text-gray-900 mb-2">Cost to charge an electric car by state</h2>
        <p className="text-gray-600 mb-3">Home charging, cheapest first. EIA average residential electricity price, {snap.elecPeriod}. Full charge assumes a 75 kWh battery.</p>
        <div className="overflow-x-auto bg-white rounded-xl border border-blue-100 shadow-sm">
          <table className="w-full text-[13px] sm:text-sm">
            <thead className="bg-blue-50 text-gray-700">
              <tr><th className="text-left px-2 py-3 sm:p-3">State</th><th className="text-right px-2 py-3 sm:p-3">Electricity</th><th className="text-right px-2 py-3 sm:p-3">Full charge</th><th className="text-right px-2 py-3 sm:p-3">Per 100 miles</th></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.ab} className="border-t border-blue-50">
                  <td className="px-2 py-3 sm:p-3"><Link href={`/gas-prices/${r.slug}`} className="text-blue-800 font-medium hover:underline">{r.name}</Link></td>
                  <td className="px-2 py-3 sm:p-3 text-right">{r.elecCents.toFixed(1)}¢/kWh</td>
                  <td className="px-2 py-3 sm:p-3 text-right font-semibold">${((75 * r.elecCents) / 100).toFixed(2)}</td>
                  <td className="px-2 py-3 sm:p-3 text-right">${((100 / 3.5) * r.elecCents / 100).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10">
        <GasAlertBox source="ev-charging" heading="Get your weekly EV or gas driving cost by email" />
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-heading font-bold text-gray-900 mb-3">EV charging questions</h2>
        <div className="space-y-3">
          {faqs.map((f) => (
            <details key={f.q} className="bg-white rounded-xl border border-blue-100 p-4 shadow-sm" open>
              <summary className="font-semibold text-gray-900 cursor-pointer">{f.q}</summary>
              <p className="text-gray-700 mt-2">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <p className="mt-8 text-sm text-gray-600">
        Thinking about switching? The <Link href="/fuel-savings-calculator" className="text-blue-700 underline">Fuel Savings Calculator</Link> compares two cars
        over a year, and <Link href="/gas-prices" className="text-blue-700 underline">gas prices by state</Link> shows gas and EV costs side by side.
      </p>
    </div>
  )
}
