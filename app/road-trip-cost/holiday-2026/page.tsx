import { Metadata } from 'next'
import Link from 'next/link'
import { SITE, DEFAULT_VEHICLE, VEHICLE_TYPES, getGasPrices, usd, usd2, miles, hm, prettyDate, STATE_NAMES } from '../lib'
import GasAlertBox from '../../components/GasAlertBox'
import { REPORT, reportStats, chartSeries, holidayRoutes, medianRouteCost } from './data'

export const revalidate = 86400
const URL_ = `${SITE}/road-trip-cost/${REPORT.slug}`

export async function generateMetadata(): Promise<Metadata> {
  const s = reportStats()
  const title = `Thanksgiving 2026 Gas Prices ${s.yoyPct >= 0 ? 'Up' : 'Down'} ${Math.abs(s.yoyPct).toFixed(0)}% vs 2025 | Holiday Road Trip Report`
  const description = `Regular gas averaged ${usd2(s.now.price)} Thanksgiving week 2026, ${s.yoyPct >= 0 ? 'up' : 'down'} ${Math.abs(s.yoyPct).toFixed(0)}% from ${usd2(s.last.price)} in 2025, #${s.rank} of ${s.years} years on record. Costs for 20 popular holiday drives.`
  return {
    title,
    description,
    alternates: { canonical: URL_ },
    openGraph: { title, description, url: URL_, type: 'article', siteName: 'MPGCalculator.net', publishedTime: REPORT.published },
    twitter: { card: 'summary_large_image', title, description },
  }
}

const ord = (n: number) => `${n}${['th', 'st', 'nd', 'rd'][(n % 100 >> 3) ^ 1 && n % 10] || 'th'}`
const pct = (n: number) => `${Math.abs(n).toFixed(0)}%`

function PriceChart({ series, marks }: { series: [string, number][]; marks: { date: string; label: string }[] }) {
  const W = 760, H = 270, P = { l: 44, r: 12, t: 30, b: 28 }
  const ys = series.map((s) => s[1])
  const min = Math.floor(Math.min(...ys) * 4) / 4, max = Math.ceil(Math.max(...ys) * 4) / 4
  const x = (i: number) => P.l + (i / (series.length - 1)) * (W - P.l - P.r)
  const y = (v: number) => P.t + ((max - v) / (max - min)) * (H - P.t - P.b)
  const path = series.map((s, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(s[1]).toFixed(1)}`).join(' ')
  const ticks: number[] = []
  for (let v = min; v <= max + 1e-9; v += 0.5) ticks.push(v)
  const years = series.map((s, i) => ({ i, d: s[0] })).filter((s, k, a) => k === 0 || s.d.slice(0, 4) !== a[k - 1].d.slice(0, 4))
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Weekly U.S. regular gasoline price">
      {ticks.map((v) => (
        <g key={v}>
          <line x1={P.l} x2={W - P.r} y1={y(v)} y2={y(v)} stroke="#e5e7eb" />
          <text x={P.l - 6} y={y(v) + 4} fontSize="11" textAnchor="end" fill="#6b7280">${v.toFixed(2)}</text>
        </g>
      ))}
      {years.map((yr) => (
        <text key={yr.d} x={x(yr.i)} y={H - 8} fontSize="11" fill="#6b7280">{yr.d.slice(0, 4)}</text>
      ))}
      <path d={path} fill="none" stroke="#2563eb" strokeWidth="2.5" />
      {marks.map((m) => {
        const i = series.findIndex((s) => s[0] === m.date)
        if (i < 0) return null
        return (
          <g key={m.date}>
            <circle cx={x(i)} cy={y(series[i][1])} r="5" fill="#f59e0b" stroke="#fff" strokeWidth="2" />
            <text x={x(i) > W - 90 ? x(i) - 8 : x(i)} y={y(series[i][1]) - 10} fontSize="11" textAnchor={x(i) > W - 90 ? 'end' : 'middle'} fill="#92400e" fontWeight="600">{m.label}</text>
          </g>
        )
      })}
    </svg>
  )
}

export default function HolidayReport() {
  const s = reportStats()
  const gas = getGasPrices()
  const routes = holidayRoutes()
  const median = medianRouteCost()
  const states = Object.entries(gas.prices).filter(([k]) => STATE_NAMES[k]).map(([k, v]) => ({ name: STATE_NAMES[k], price: v })).sort((a, b) => a.price - b.price)
  const cheap = states[0], dear = states[states.length - 1]
  const hybrid = VEHICLE_TYPES.find((v) => v.key === 'hybrid')!, pickup = VEHICLE_TYPES.find((v) => v.key === 'pickup')!
  const up = s.yoyPct >= 0
  const higher = s.higherYears.map((t) => `${t.year} (${usd2(t.price)})`).join(', ')
  const latestDiffers = s.latest[0] !== REPORT.anchorWeek

  const findings = [
    `The U.S. average price of regular gasoline was ${usd2(s.now.price)} a gallon in Thanksgiving week 2026 (week of ${prettyDate(s.now.week)}), ${up ? 'up' : 'down'} ${pct(s.yoyPct)} (${Math.abs((s.now.price - s.last.price) * 100).toFixed(0)}¢) from ${usd2(s.last.price)} in Thanksgiving week 2025.`,
    `That is the ${ord(s.rank)}-highest Thanksgiving-week price in ${s.years} years of EIA weekly data (since ${s.tg[0].year})${s.rank > 1 ? `, behind only ${higher}` : ''}.`,
    `Prices are ${pct(s.fromPeakPct)} below this year's peak of ${usd2(s.peak[1])} (week of ${prettyDate(s.peak[0])}) but well above the 2026 low of ${usd2(s.low[1])} (week of ${prettyDate(s.low[0])}).`,
    `A 500-mile holiday round trip in a midsize car (${DEFAULT_VEHICLE.mpg} MPG) costs about ${usd2(Math.abs(s.extraPer500))} ${up ? 'more' : 'less'} in gas than last Thanksgiving.`,
    `Among states with their own EIA price series, gas is cheapest in ${cheap.name} (${usd2(cheap.price)}) and most expensive in ${dear.name} (${usd2(dear.price)}).`,
    `Across the 159 popular U.S. road trips we track, the median one-way gas cost in a midsize car is ${usd(median)}.`,
  ]

  const faqs = [
    { q: 'How much is gas for Thanksgiving 2026?', a: findings[0] },
    { q: 'Is gas more expensive this Thanksgiving than last year?', a: `${up ? 'Yes' : 'No'}. ${findings[0]} ${findings[1]}` },
    { q: 'How much more will a Thanksgiving road trip cost in gas this year?', a: `${findings[3]} For example, a ${miles(routes[0].r.distanceMi)} ${routes[0].r.from.name}–${routes[0].r.to.name} round trip costs about ${usd(routes[0].roundTrip)} in gas this week.` },
  ]

  const jsonLd = [
    {
      '@context': 'https://schema.org', '@type': 'Article',
      headline: `Thanksgiving gas ${up ? 'up' : 'down'} ${pct(s.yoyPct)} vs 2025 in the ${REPORT.title}`,
      datePublished: REPORT.published, dateModified: gas.weekOf > REPORT.published ? gas.weekOf : REPORT.published,
      author: { '@type': 'Organization', name: 'MPGCalculator.net', url: SITE },
      publisher: { '@type': 'Organization', name: 'MPGCalculator.net', url: SITE, logo: { '@type': 'ImageObject', url: `${SITE}/Website-Logo.png` } },
      mainEntityOfPage: URL_,
      about: ['Thanksgiving travel', 'gasoline prices', 'road trip costs'],
    },
    {
      '@context': 'https://schema.org', '@type': 'Dataset',
      name: 'Thanksgiving-week U.S. regular gasoline prices, 1990–2026, and holiday road trip gas costs',
      description: `U.S. average regular gasoline price for the week of Thanksgiving in every year since ${s.tg[0].year} (EIA weekly series EMM_EPMR_PTE_NUS_DPG), plus one-way and round-trip gas costs for 20 popular holiday drives at current EIA state prices.`,
      url: URL_, license: 'https://creativecommons.org/licenses/by/4.0/', isAccessibleForFree: true,
      creator: { '@type': 'Organization', name: 'MPGCalculator.net', url: SITE },
      temporalCoverage: `${s.tg[0].year}/${REPORT.year}`, spatialCoverage: 'United States', datePublished: REPORT.published,
      variableMeasured: ['regular gasoline price (USD per gallon)', 'road trip gas cost (USD)'],
      distribution: [
        { '@type': 'DataDownload', encodingFormat: 'text/csv', contentUrl: `${URL_}/thanksgiving-gas-prices.csv` },
        { '@type': 'DataDownload', encodingFormat: 'text/csv', contentUrl: `${SITE}/road-trip-cost/data.csv` },
      ],
    },
    {
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    },
    {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
        { '@type': 'ListItem', position: 2, name: 'Road Trip Costs', item: `${SITE}/road-trip-cost` },
        { '@type': 'ListItem', position: 3, name: REPORT.title, item: URL_ },
      ],
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="text-sm text-gray-500 mb-3" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-blue-700">Home</Link> › <Link href="/road-trip-cost" className="hover:text-blue-700">Road Trip Costs</Link> › <span className="text-gray-700">{REPORT.title}</span>
      </nav>
      <div className="text-sm font-semibold text-amber-700 uppercase tracking-wide mb-1">Data report · Published {prettyDate(REPORT.published)}</div>
      <h1 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-3">
        Thanksgiving Gas Is {up ? 'Up' : 'Down'} {pct(s.yoyPct)} From Last Year, the {ord(s.rank)}-Highest Since {s.tg[0].year}
      </h1>
      <p className="text-lg text-gray-700 mb-6">
        Our {REPORT.title.toLowerCase()} uses U.S. Energy Information Administration (EIA) weekly prices and the actual routes of 159
        popular American drives to show what holiday travelers are paying at the pump this year.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          ['Thanksgiving week 2026', usd2(s.now.price)],
          ['Thanksgiving week 2025', usd2(s.last.price)],
          ['Change vs 2025', `${up ? '+' : '−'}${pct(s.yoyPct)}`],
          [`Rank of ${s.years} years`, ord(s.rank)],
        ].map(([k, v]) => (
          <div key={k} className="bg-white rounded-xl border border-blue-100 shadow-sm p-4">
            <div className="text-xs uppercase tracking-wide text-gray-500">{k}</div>
            <div className="text-2xl font-bold text-blue-800">{v}</div>
          </div>
        ))}
      </div>

      <section className="mb-10">
        <h2 className="text-2xl font-heading font-bold text-gray-900 mb-3">Key findings</h2>
        <ul className="space-y-2 list-disc pl-5 text-gray-800">
          {findings.map((f) => <li key={f}>{f}</li>)}
        </ul>
      </section>

      <section className="mb-10 bg-white rounded-xl border border-blue-100 shadow-sm p-4">
        <h2 className="text-xl font-heading font-bold text-gray-900 mb-1">Weekly U.S. regular gas price, {REPORT.year - 1}–{REPORT.year}</h2>
        <p className="text-sm text-gray-600 mb-3">Orange dots mark Thanksgiving week and this year&apos;s peak.</p>
        <PriceChart
          series={chartSeries()}
          marks={[
            { date: s.last.week, label: `TG ${s.last.year}: ${usd2(s.last.price)}` },
            { date: s.peak[0], label: `Peak ${usd2(s.peak[1])}` },
            { date: s.now.week, label: `TG ${s.now.year}: ${usd2(s.now.price)}` },
          ]}
        />
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-heading font-bold text-gray-900 mb-2">What 20 popular holiday drives cost in gas</h2>
        <p className="text-gray-600 mb-4">
          Round-trip gas cost in a midsize car ({DEFAULT_VEHICLE.mpg} MPG) at this week&apos;s EIA prices for each state on the route, and how much more
          the same gallons cost than at last Thanksgiving&apos;s national average.
        </p>
        <div className="overflow-x-auto bg-white rounded-xl border border-blue-100 shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-blue-50 text-gray-700">
              <tr>
                <th className="text-left p-3">Drive</th>
                <th className="text-right p-3">Distance</th>
                <th className="text-right p-3 hidden sm:table-cell">Drive time</th>
                <th className="text-right p-3">Round trip</th>
                <th className="text-right p-3">vs 2025</th>
              </tr>
            </thead>
            <tbody>
              {routes.map((x) => (
                <tr key={x.r.slug} className="border-t border-blue-50">
                  <td className="p-3"><Link href={`/road-trip-cost/${x.r.slug}`} className="text-blue-800 font-medium hover:underline">{x.r.from.name} ↔ {x.r.to.name}</Link></td>
                  <td className="p-3 text-right">{miles(x.r.distanceMi)}</td>
                  <td className="p-3 text-right hidden sm:table-cell">{hm(x.r.durationH)}</td>
                  <td className="p-3 text-right font-semibold">{usd(x.roundTrip)}</td>
                  <td className={`p-3 text-right ${x.extraRoundTrip >= 0 ? 'text-red-700' : 'text-green-700'}`}>{x.extraRoundTrip >= 0 ? '+' : '−'}{usd2(Math.abs(x.extraRoundTrip))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-gray-600 mt-3">
          Vehicle choice matters more than the year-over-year jump: a {hybrid.label.toLowerCase()} ({hybrid.mpg} MPG) uses about {((1 - DEFAULT_VEHICLE.mpg / hybrid.mpg) * 100).toFixed(0)}% less gas than a midsize sedan,
          while a {pickup.label.toLowerCase()} ({pickup.mpg} MPG) uses about {((DEFAULT_VEHICLE.mpg / pickup.mpg - 1) * 100).toFixed(0)}% more.{' '}
          <Link href="/road-trip-cost" className="text-blue-700 underline">See all 159 routes →</Link>
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-heading font-bold text-gray-900 mb-2">Thanksgiving-week gas prices since {s.tg[0].year}</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {[...s.tg].reverse().map((t) => (
            <div key={t.year} className={`rounded-lg border px-3 py-2 text-center ${t.year === REPORT.year ? 'bg-amber-50 border-amber-300' : 'bg-white border-blue-100'}`}>
              <div className="text-xs text-gray-500">{t.year}</div>
              <div className="font-semibold text-gray-900">{usd2(t.price)}</div>
            </div>
          ))}
        </div>
      </section>

      {latestDiffers && (
        <section className="mb-10 bg-blue-50 border border-blue-200 rounded-xl p-4 text-gray-800">
          <strong>Latest week:</strong> regular gas averaged {usd2(s.latest[1])} for the week of {prettyDate(s.latest[0])}. Headline numbers above stay fixed to Thanksgiving week so they can be cited; route costs update weekly.
        </section>
      )}

      <section className="mb-10">
        <GasAlertBox source="holiday-report" heading="Track gas prices through the holidays" />
      </section>

      <section className="mb-10 bg-white rounded-xl border border-blue-100 shadow-sm p-5">
        <h2 className="text-2xl font-heading font-bold text-gray-900 mb-2">For journalists: use and cite this data</h2>
        <p className="text-gray-700 mb-3">
          Free to use under <a href="https://creativecommons.org/licenses/by/4.0/" className="underline" rel="license noopener" target="_blank">CC BY 4.0</a> with credit and a link to this page. Downloads:{' '}
          <a href={`/road-trip-cost/${REPORT.slug}/thanksgiving-gas-prices.csv`} className="text-blue-700 underline font-medium">Thanksgiving-week prices {s.tg[0].year}–{REPORT.year} (CSV)</a> ·{' '}
          <a href="/road-trip-cost/data.csv" className="text-blue-700 underline font-medium">Gas cost for 159 routes (CSV)</a>.
          Questions or a custom route? <Link href="/feedback" className="text-blue-700 underline">Contact us</Link>.
        </p>
        <div className="bg-blue-50 rounded-lg p-3 text-sm text-gray-800 font-mono break-words">
          Cite as: MPGCalculator.net, &quot;{REPORT.title},&quot; {prettyDate(REPORT.published)}, {URL_}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-heading font-bold text-gray-900 mb-3">Common questions</h2>
        <div className="space-y-3">
          {faqs.map((f) => (
            <details key={f.q} className="bg-white rounded-xl border border-blue-100 p-4 shadow-sm" open>
              <summary className="font-semibold text-gray-900 cursor-pointer">{f.q}</summary>
              <p className="text-gray-700 mt-2">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mb-8 text-sm text-gray-600">
        <h2 className="text-lg font-heading font-bold text-gray-900 mb-1">Methodology</h2>
        <p>
          Gas prices: EIA weekly U.S. average retail price of regular gasoline (series EMM_EPMR_PTE_NUS_DPG) and EIA weekly state/regional series.
          &quot;Thanksgiving week&quot; is the EIA week (dated Monday) containing Thanksgiving Day. Route distances and times: OpenRouteService on
          OpenStreetMap data; gas cost uses the EIA price for each state the route passes through and the EPA combined MPG average of 2024–2025
          midsize sedans ({DEFAULT_VEHICLE.mpg} MPG). The &quot;vs 2025&quot; column applies the change in the national average to the same number of gallons.
          Tolls, parking and lodging are not included.
        </p>
      </section>

      <div className="bg-gradient-to-r from-blue-700 to-indigo-700 rounded-xl p-5 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <div className="font-bold text-lg">Driving somewhere for the holidays?</div>
          <div className="text-blue-100 text-sm">Get the gas cost, stops and hotels for your exact trip and car.</div>
        </div>
        <Link href="/road-trip-cost-calculator" className="shrink-0 bg-white text-blue-800 font-semibold px-5 py-2.5 rounded-lg hover:bg-blue-50 text-center">Open the Road Trip Calculator →</Link>
      </div>
    </div>
  )
}
