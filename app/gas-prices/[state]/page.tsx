import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import GasAlertBox from '../../components/GasAlertBox'
import { SITE, usd, usd2, miles, prettyDate } from '../../road-trip-cost/lib'
import { STATE_LIST, stateBySlug, stateData, TYPICAL } from '../lib'

export const revalidate = 86400
export const dynamicParams = false
export function generateStaticParams() {
  return STATE_LIST.map((s) => ({ state: s.slug }))
}

interface Props { params: Promise<{ state: string }> }

// 36¢, or $1.02 once the change reaches a dollar
const cents = (d: number) => (Math.abs(d) >= 0.995 ? `$${Math.abs(d).toFixed(2)}` : `${Math.abs(d * 100).toFixed(0)}¢`)
const shortDate = (iso: string) => new Date(iso + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state } = await params
  const st = stateBySlug(state)
  if (!st) return {}
  const d = stateData(st.ab)
  const dir = d.change === null || Math.abs(d.change) < 0.005 ? 'flat' : d.change < 0 ? `down ${cents(d.change)}` : `up ${cents(d.change)}`
  const title = `${d.name} Gas Prices This Week ($${d.gas.toFixed(2)}) and EV Charging Cost`
  const description = `Regular gas in ${d.name} averages ${usd2(d.gas)} a gallon this week, ${dir} from last week (EIA). Charging an EV at home costs about ${usd2(d.fullCharge)} for a full charge at ${d.elecCents.toFixed(1)}¢/kWh.`
  const url = `${SITE}/gas-prices/${st.slug}`
  return { title, description, alternates: { canonical: url }, openGraph: { title, description, url, type: 'article', siteName: 'MPGCalculator.net' } }
}

function Bars({ data }: { data: { week: string; price: number }[] }) {
  if (data.length < 2) return null
  const max = Math.max(...data.map((d) => d.price)), min = Math.min(...data.map((d) => d.price))
  const lo = Math.max(0, min - (max - min) * 0.6 - 0.1)
  return (
    <div className="flex items-end gap-2 h-40" role="img" aria-label="Weekly regular gas price, last 6 weeks">
      {data.map((d, i) => (
        <div key={d.week} className="flex-1 flex flex-col items-center justify-end h-full">
          <div className="text-xs font-semibold text-gray-800 mb-1">${d.price.toFixed(2)}</div>
          <div className={`w-full rounded-t ${i === data.length - 1 ? 'bg-blue-600' : 'bg-blue-200'}`} style={{ height: `${((d.price - lo) / (max - lo)) * 100}%` }} />
          <div className="text-xs text-gray-500 mt-1">{shortDate(d.week)}</div>
        </div>
      ))}
    </div>
  )
}

export default async function StateGasPage({ params }: Props) {
  const { state } = await params
  const st = stateBySlug(state)
  if (!st) notFound()
  const d = stateData(st.ab)
  const up = (d.change ?? 0) > 0.005, down = (d.change ?? 0) < -0.005
  const dirText = up ? `up ${cents(d.change!)}` : down ? `down ${cents(d.change!)}` : 'about the same'
  const trendText = d.trend === null ? '' : d.trend < -0.005 ? `down ${cents(d.trend)} over the last ${d.history.length} weeks` : d.trend > 0.005 ? `up ${cents(d.trend)} over the last ${d.history.length} weeks` : `flat over the last ${d.history.length} weeks`
  const evSave = d.gasMonthly - d.evMonthly
  const url = `${SITE}/gas-prices/${st.slug}`
  const basisNote = d.sharesRegion
    ? `The EIA doesn't publish a separate weekly price for ${d.name}, so this is the ${d.basis}${d.peers.length ? `, which also covers ${d.peers.slice(0, 6).join(', ')}${d.peers.length > 6 ? ' and others' : ''}` : ''}.`
    : `${d.name} has its own EIA weekly price series.`

  const faqs = [
    { q: `What is the average gas price in ${d.name} this week?`, a: `Regular gasoline averages ${usd2(d.gas)} a gallon in ${d.name} for the EIA week of ${prettyDate(d.weekOf)}. ${basisNote}` },
    { q: `Are gas prices going up or down in ${d.name}?`, a: `This week's price is ${dirText} from last week${trendText ? ` and ${trendText}` : ''}.` },
    { q: `How much does it cost to charge an electric car at home in ${d.name}?`, a: `Homes in ${d.name} pay about ${d.elecCents.toFixed(1)}¢ per kWh (EIA, ${d.elecPeriod}). A full ${TYPICAL.batteryKwh} kWh charge costs about ${usd2(d.fullCharge)}, or roughly ${(d.evPerMile * 100).toFixed(1)}¢ a mile at ${TYPICAL.evMiPerKwh} miles per kWh.` },
    { q: `Is it cheaper to drive an EV or a gas car in ${d.name}?`, a: `At this week's prices, ${TYPICAL.monthlyMiles.toLocaleString()} miles a month costs about ${usd(d.gasMonthly)} in a ${TYPICAL.gasMpg} MPG gas car and ${usd(d.evMonthly)} in an EV charged at home${evSave > 0 ? `, so the EV saves about ${usd(evSave)} a month` : ''}. Public fast charging usually costs 2 to 3 times more than home charging.` },
  ]
  const jsonLd = [
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
      { '@type': 'ListItem', position: 2, name: 'Gas Prices by State', item: `${SITE}/gas-prices` },
      { '@type': 'ListItem', position: 3, name: `${d.name} Gas Prices`, item: url },
    ] },
  ]

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="text-sm text-gray-500 mb-3" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-blue-700">Home</Link> › <Link href="/gas-prices" className="hover:text-blue-700">Gas Prices by State</Link> › <span className="text-gray-700">{d.name}</span>
      </nav>
      <h1 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-3">{d.name} Gas Prices This Week</h1>
      <p className="text-lg text-gray-700 mb-6">
        Regular gas in {d.name} averages <strong>{usd2(d.gas)} a gallon</strong> for the week of {prettyDate(d.weekOf)}, {dirText} from last week
        {trendText ? <> and {trendText}</> : null}. Charging an EV at home costs about <strong>{usd2(d.fullCharge)}</strong> for a full charge.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          ['Regular gas', usd2(d.gas)],
          ['vs last week', d.change === null ? 'n/a' : `${up ? '+' : down ? '−' : ''}${cents(d.change)}`],
          ['Home electricity', `${d.elecCents.toFixed(1)}¢/kWh`],
          ['Full EV charge', usd2(d.fullCharge)],
        ].map(([k, v]) => (
          <div key={k} className="bg-white rounded-xl border border-blue-100 shadow-sm p-4">
            <div className="text-xs uppercase tracking-wide text-gray-500">{k}</div>
            <div className={`text-2xl font-bold ${k === 'vs last week' ? (up ? 'text-red-700' : down ? 'text-green-700' : 'text-gray-800') : 'text-blue-800'}`}>{v}</div>
          </div>
        ))}
      </div>

      <section className="mb-10 bg-white rounded-xl border border-blue-100 shadow-sm p-5">
        <h2 className="text-xl font-heading font-bold text-gray-900 mb-1">Is gas going up or down in {d.name}?</h2>
        <p className="text-gray-600 mb-4 text-sm">Weekly average regular gas price ({d.basis}), last {d.history.length} weeks.</p>
        <Bars data={d.history} />
        <p className="text-xs text-gray-500 mt-3">{basisNote} Source: U.S. Energy Information Administration.</p>
      </section>

      <section className="mb-10">
        <GasAlertBox defaultState={d.ab} source="state-page" heading={`Get ${d.name} gas prices and your driving cost every week`} />
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-heading font-bold text-gray-900 mb-2">Gas vs electric in {d.name}</h2>
        <p className="text-gray-600 mb-4">What {TYPICAL.monthlyMiles.toLocaleString()} miles a month costs at this week&apos;s {d.name} prices.</p>
        <div className="overflow-x-auto bg-white rounded-xl border border-blue-100 shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-blue-50 text-gray-700"><tr><th className="text-left p-3">Car</th><th className="text-right p-3">Per mile</th><th className="text-right p-3">Per month</th><th className="text-right p-3">Per year</th></tr></thead>
            <tbody>
              <tr className="border-t border-blue-50"><td className="p-3">Gas car, {TYPICAL.gasMpg} MPG</td><td className="p-3 text-right">{(d.gasPerMile * 100).toFixed(1)}¢</td><td className="p-3 text-right">{usd(d.gasMonthly)}</td><td className="p-3 text-right">{usd(d.gasMonthly * 12)}</td></tr>
              <tr className="border-t border-blue-50"><td className="p-3">EV charged at home, {TYPICAL.evMiPerKwh} mi/kWh</td><td className="p-3 text-right">{(d.evPerMile * 100).toFixed(1)}¢</td><td className="p-3 text-right">{usd(d.evMonthly)}</td><td className="p-3 text-right">{usd(d.evMonthly * 12)}</td></tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm text-gray-600 mt-3">
          {evSave > 0 ? <>In {d.name} an EV charged at home saves about <strong>{usd(evSave * 12)} a year</strong> on fuel at these prices. </> : null}
          Electricity: EIA average residential price, {d.elecPeriod}. <Link href="/fuel-savings-calculator" className="text-blue-700 underline">Compare your exact cars</Link>
        </p>
      </section>

      {d.routes.length > 0 && (
        <section className="mb-10">
          <h2 className="text-2xl font-heading font-bold text-gray-900 mb-3">Road trips from and to {d.name}</h2>
          <div className="grid sm:grid-cols-2 gap-2">
            {d.routes.slice(0, 12).map((r) => (
              <Link key={r.slug} href={`/road-trip-cost/${r.slug}`} className="bg-white rounded-lg border border-blue-100 px-4 py-3 hover:border-blue-400 flex justify-between">
                <span className="text-blue-800 font-medium">{r.from.name} → {r.to.name}</span>
                <span className="text-gray-500 text-sm">{miles(r.distanceMi)}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mb-10">
        <h2 className="text-2xl font-heading font-bold text-gray-900 mb-3">{d.name} gas and charging questions</h2>
        <div className="space-y-3">
          {faqs.map((f) => (
            <details key={f.q} className="bg-white rounded-xl border border-blue-100 p-4 shadow-sm" open>
              <summary className="font-semibold text-gray-900 cursor-pointer">{f.q}</summary>
              <p className="text-gray-700 mt-2">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <p className="text-sm text-gray-600">
        <Link href="/gas-prices" className="text-blue-700 underline">Gas prices in every state</Link> ·{' '}
        <Link href="/road-trip-cost" className="text-blue-700 underline">Road trip gas costs</Link>
      </p>
    </div>
  )
}
