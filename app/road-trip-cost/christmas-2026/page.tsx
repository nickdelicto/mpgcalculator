import { Metadata } from 'next'
import Link from 'next/link'
import GasAlertBox from '../../components/GasAlertBox'
import PriceChart from '../PriceChart'
import { SITE, DEFAULT_VEHICLE, usd, usd2, miles, hm, prettyDate } from '../lib'
import { XMAS, xmasStats, xmasRoutes, chartWeeks } from './data'

export const revalidate = 86400
const URL_ = `${SITE}/road-trip-cost/${XMAS.slug}`
const pct = (n: number) => `${Math.abs(n).toFixed(0)}%`
const ord = (n: number) => `${n}${['th', 'st', 'nd', 'rd'][(n % 100 >> 3) ^ 1 && n % 10] || 'th'}`

export async function generateMetadata(): Promise<Metadata> {
  const s = xmasStats()
  const up = s.yoyPct >= 0
  const title = s.locked
    ? `Christmas 2026 Gas Prices ${up ? 'Up' : 'Down'} ${pct(s.yoyPct)} vs 2025 | Christmas Road Trip Gas Costs`
    : `Christmas 2026 Gas Prices vs Last Christmas | Holiday Road Trip Gas Costs`
  const description = s.locked
    ? `Regular gas averaged ${usd2(s.current.price)} in Christmas week 2026, ${up ? 'up' : 'down'} ${pct(s.yoyPct)} from ${usd2(s.last.price)} in 2025. Gas costs for 20 popular Christmas drives.`
    : `Gas is ${usd2(s.current.price)} a gallon heading into Christmas, ${up ? 'up' : 'down'} ${pct(s.yoyPct)} from ${usd2(s.last.price)} in Christmas week 2025. Updated weekly with EIA prices, plus gas costs for 20 Christmas drives.`
  return {
    title, description, alternates: { canonical: URL_ },
    openGraph: { title, description, url: URL_, type: 'article', siteName: 'MPGCalculator.net', publishedTime: XMAS.published },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export default function ChristmasReport() {
  const s = xmasStats()
  const routes = xmasRoutes()
  const up = s.yoyPct >= 0
  const record = s.rank === 1
  const hist = s.past.slice().sort((a, b) => b.price - a.price)
  const prevHigh = hist[0]
  const lastWeeks = chartWeeks().slice(-6)
  const falling = lastWeeks.length > 2 && lastWeeks.every((w, i) => i === 0 || w[1] <= lastWeeks[i - 1][1])

  const headline = s.locked
    ? `Christmas Gas Is ${up ? 'Up' : 'Down'} ${pct(s.yoyPct)} From Last Year, the ${ord(s.rank)}-Highest Since ${s.series[0].year}`
    : `Gas Is ${pct(s.yoyPct)} ${up ? 'Higher' : 'Lower'} Than Last Christmas Heading Into the Holidays`

  const findings = [
    s.locked
      ? `The U.S. average price of regular gas was ${usd2(s.current.price)} a gallon in Christmas week 2026 (week of ${prettyDate(s.current.week)}), ${up ? 'up' : 'down'} ${pct(s.yoyPct)} from ${usd2(s.last.price)} in Christmas week 2025.`
      : `Regular gas averages ${usd2(s.current.price)} a gallon nationally (EIA week of ${prettyDate(s.current.week)}), ${up ? 'up' : 'down'} ${pct(s.yoyPct)} (${Math.abs((s.current.price - s.last.price) * 100).toFixed(0)}¢) from ${usd2(s.last.price)} in Christmas week 2025.`,
    record
      ? `That is higher than any Christmas-week price in ${s.past.length} years of EIA weekly data. The previous high was ${usd2(prevHigh.price)} in ${prevHigh.year}.`
      : `That would rank ${ord(s.rank)} among Christmas-week prices since ${s.series[0].year}, behind ${hist.slice(0, s.rank - 1).map((h) => `${h.year} (${usd2(h.price)})`).join(', ')}.`,
    ...(falling && !s.locked ? [`Prices have fallen for ${lastWeeks.length - 1} straight weeks, from ${usd2(lastWeeks[0][1])} to ${usd2(lastWeeks[lastWeeks.length - 1][1])}, so Christmas week could land lower. We update this page every week.`] : []),
    ...(s.tg ? [`At Thanksgiving 2026 the national average was ${usd2(s.tg.price)}.`] : []),
    `A 500-mile Christmas round trip in a midsize car (${DEFAULT_VEHICLE.mpg} MPG) costs about ${usd2(Math.abs(s.extraPer500))} ${up ? 'more' : 'less'} in gas than last Christmas at today's prices.`,
  ]

  const faqs = [
    { q: 'How much is gas for Christmas 2026?', a: findings[0] },
    { q: 'Is gas more expensive this Christmas than last year?', a: `${up ? 'Yes' : 'No'}. ${findings[0]} ${findings[1]}` },
    { q: 'How much will a Christmas road trip cost in gas?', a: `${findings[findings.length - 1]} For example, ${routes[0].r.from.name} to ${routes[0].r.to.name} and back (${miles(routes[0].r.distanceMi * 2)}) costs about ${usd(routes[0].roundTrip)} in gas.` },
  ]

  const jsonLd = [
    {
      '@context': 'https://schema.org', '@type': 'Article', headline,
      datePublished: XMAS.published, dateModified: s.current.week > XMAS.published ? s.current.week : XMAS.published,
      author: { '@type': 'Organization', name: 'MPGCalculator.net', url: SITE },
      publisher: { '@type': 'Organization', name: 'MPGCalculator.net', url: SITE, logo: { '@type': 'ImageObject', url: `${SITE}/Website-Logo.png` } },
      mainEntityOfPage: URL_, about: ['Christmas travel', 'gasoline prices', 'road trip costs'],
    },
    {
      '@context': 'https://schema.org', '@type': 'Dataset',
      name: `Christmas-week U.S. regular gasoline prices, ${s.series[0].year} to ${XMAS.year}`,
      description: 'U.S. average regular gasoline price for the EIA week containing Christmas Day in every year since 1990 (EIA series EMM_EPMR_PTE_NUS_DPG), plus gas costs for 20 popular Christmas drives at current EIA state prices.',
      url: URL_, license: 'https://creativecommons.org/licenses/by/4.0/', isAccessibleForFree: true,
      creator: { '@type': 'Organization', name: 'MPGCalculator.net', url: SITE },
      temporalCoverage: `${s.series[0].year}/${XMAS.year}`, spatialCoverage: 'United States', datePublished: XMAS.published,
      distribution: [{ '@type': 'DataDownload', encodingFormat: 'text/csv', contentUrl: `${URL_}/christmas-gas-prices.csv` }],
    },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
      { '@type': 'ListItem', position: 2, name: 'Road Trip Costs', item: `${SITE}/road-trip-cost` },
      { '@type': 'ListItem', position: 3, name: XMAS.title, item: URL_ },
    ] },
  ]

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="text-sm text-gray-500 mb-3" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-blue-700">Home</Link> › <Link href="/road-trip-cost" className="hover:text-blue-700">Road Trip Costs</Link> › <span className="text-gray-700">{XMAS.title}</span>
      </nav>
      <div className="text-sm font-semibold text-red-700 uppercase tracking-wide mb-1">
        Data report · {s.locked ? `Christmas week prices are in` : `Updated weekly until Christmas · ${s.daysToXmasWeek > 0 ? `${s.daysToXmasWeek} days to Christmas week` : 'Christmas week'}`}
      </div>
      <h1 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-3">{headline}</h1>
      <p className="text-lg text-gray-700 mb-6">
        Our Christmas road trip gas report tracks U.S. Energy Information Administration weekly gas prices against every Christmas since {s.series[0].year} and shows
        what 20 popular Christmas drives cost, from family trips like New York to Washington to ski runs like Denver to Aspen.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          [s.locked ? 'Christmas week 2026' : 'This week', usd2(s.current.price)],
          ['Christmas week 2025', usd2(s.last.price)],
          ['Change vs last Christmas', `${up ? '+' : '−'}${pct(s.yoyPct)}`],
          [s.locked ? `Rank of ${s.series.length} years` : 'Christmas record', record ? `${usd2(prevHigh.price)} (${prevHigh.year})` : ord(s.rank)],
        ].map(([k, v]) => (
          <div key={k} className="bg-white rounded-xl border border-blue-100 shadow-sm p-4">
            <div className="text-xs uppercase tracking-wide text-gray-500">{k}</div>
            <div className="text-2xl font-bold text-blue-800">{v}</div>
          </div>
        ))}
      </div>

      <section className="mb-10">
        <h2 className="text-2xl font-heading font-bold text-gray-900 mb-3">Key findings</h2>
        <ul className="space-y-2 list-disc pl-5 text-gray-800">{findings.map((f) => <li key={f}>{f}</li>)}</ul>
      </section>

      <section className="mb-10 bg-white rounded-xl border border-blue-100 shadow-sm p-4">
        <h2 className="text-xl font-heading font-bold text-gray-900 mb-1">Weekly U.S. regular gas price since last fall</h2>
        <p className="text-sm text-gray-600 mb-3">Orange dots mark Christmas week 2025, Thanksgiving 2026 and the latest week.</p>
        <PriceChart
          series={chartWeeks()}
          marks={[
            { date: s.last.week, label: `Xmas ${s.last.year}: ${usd2(s.last.price)}` },
            ...(s.tg ? [{ date: s.tg.week, label: `TG ${s.tg.year}` }] : []),
            ...(s.tg?.week !== s.current.week ? [{ date: s.current.week, label: `${s.locked ? 'Xmas' : 'Now'}: ${usd2(s.current.price)}` }] : []),
          ]}
        />
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-heading font-bold text-gray-900 mb-2">What 20 Christmas drives cost in gas</h2>
        <p className="text-gray-600 mb-4">Round trip in a midsize car ({DEFAULT_VEHICLE.mpg} MPG) at this week&apos;s EIA prices for each state on the route, and the difference from last Christmas&apos;s national average.</p>
        <div className="overflow-x-auto bg-white rounded-xl border border-blue-100 shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-blue-50 text-gray-700">
              <tr><th className="text-left p-3">Drive</th><th className="text-right p-3">Distance</th><th className="text-right p-3 hidden sm:table-cell">Drive time</th><th className="text-right p-3">Round trip</th><th className="text-right p-3">vs 2025</th></tr>
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
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-heading font-bold text-gray-900 mb-2">Christmas-week gas prices since {s.series[0].year}</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {[...s.series].reverse().map((t) => (
            <div key={t.year} className={`rounded-lg border px-3 py-2 text-center ${t.year === s.last.year ? 'bg-red-50 border-red-200' : 'bg-white border-blue-100'}`}>
              <div className="text-xs text-gray-500">{t.year}</div>
              <div className="font-semibold text-gray-900">{usd2(t.price)}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <GasAlertBox source="christmas-report" heading="Get gas prices and your driving cost every week through the holidays" />
      </section>

      <section className="mb-10 bg-white rounded-xl border border-blue-100 shadow-sm p-5">
        <h2 className="text-2xl font-heading font-bold text-gray-900 mb-2">For journalists</h2>
        <p className="text-gray-700 mb-3">
          Free to use under <a href="https://creativecommons.org/licenses/by/4.0/" className="underline" rel="license noopener" target="_blank">CC BY 4.0</a> with credit and a link to this page.
          Download <a href={`/road-trip-cost/${XMAS.slug}/christmas-gas-prices.csv`} className="text-blue-700 underline font-medium">Christmas-week prices since {s.series[0].year} (CSV)</a> or
          the <a href="/road-trip-cost/data.csv" className="text-blue-700 underline font-medium">gas cost of 159 routes (CSV)</a>. Need a route for your area? <Link href="/feedback" className="text-blue-700 underline">Contact us</Link>.
        </p>
        <div className="bg-blue-50 rounded-lg p-3 text-sm text-gray-800 font-mono break-words">Cite as: MPGCalculator.net, &quot;{XMAS.title},&quot; {URL_}</div>
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
          Gas prices are the EIA weekly U.S. average retail price of regular gasoline (series EMM_EPMR_PTE_NUS_DPG). &quot;Christmas week&quot; is the EIA
          week (dated Monday) containing December 25. Until EIA publishes Christmas week 2026, the page compares the latest week instead. Route costs use
          OpenRouteService routes on OpenStreetMap data, EIA state or regional prices for each state on the route, and the EPA average for 2024 and 2025
          midsize sedans ({DEFAULT_VEHICLE.mpg} MPG). Tolls, parking and lodging are not included. See also our{' '}
          <Link href="/road-trip-cost/holiday-2026" className="text-blue-700 underline">Thanksgiving 2026 report</Link> and{' '}
          <Link href="/gas-prices" className="text-blue-700 underline">gas prices by state</Link>.
        </p>
      </section>

      <div className="bg-gradient-to-r from-red-700 to-green-800 rounded-xl p-5 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <div className="font-bold text-lg">Driving home for Christmas?</div>
          <div className="text-red-50 text-sm">Get the gas cost, stops and hotels for your exact trip and car.</div>
        </div>
        <Link href="/road-trip-cost-calculator" className="shrink-0 bg-white text-red-800 font-semibold px-5 py-2.5 rounded-lg hover:bg-red-50 text-center">Open the Road Trip Calculator →</Link>
      </div>
    </div>
  )
}
