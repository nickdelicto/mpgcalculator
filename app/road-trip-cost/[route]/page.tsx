import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import RouteMap from '../RouteMapLoader'
import GasAlertBox from '../../components/GasAlertBox'
import RentalOffers from '../../components/RentalOffers'
import { generateStay22AllezLink } from '../../utils/stay22'
import {
  ROUTES, SITE, getRoute, getGasPrices, routeCost, relatedRoutes, DEFAULT_VEHICLE,
  usd, usd2, miles, hm, cityName, prettyDate, type RouteRec, type Place,
} from '../lib'

export const revalidate = 86400 // gas prices refresh weekly; re-render daily
export const dynamicParams = false

export function generateStaticParams() {
  return ROUTES.map((r) => ({ route: r.slug }))
}

interface Props { params: Promise<{ route: string }> }

function titleFor(r: RouteRec) {
  return `${r.from.name} to ${r.to.name} Road Trip Cost`
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { route: slug } = await params
  const r = getRoute(slug)
  if (!r) return {}
  const gas = getGasPrices()
  const { vehicles } = routeCost(r, gas)
  const mid = vehicles.find((v) => v.key === DEFAULT_VEHICLE.key)!
  const year = gas.weekOf.slice(0, 4)
  const title = `${titleFor(r)} ${year} - Gas, Miles and Stops`
  const description = `${r.from.name} to ${r.to.name} is ${miles(r.distanceMi)}, a ${hm(r.durationH)} drive. Gas ≈ ${usd(mid.oneWay)} one way at this week's prices. Costs for SUVs, trucks, hybrids + where to stop.`
  const url = `${SITE}/road-trip-cost/${r.slug}`
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: 'article', siteName: 'MPGCalculator.net' },
    twitter: { card: 'summary', title, description },
  }
}

function Leg({ from, to, mi, h }: { from: string; to: string; mi: number; h: number }) {
  return (
    <span>
      <strong>{from}</strong> → <strong>{to}</strong>
      <span className="text-gray-500"> · {miles(mi)} · ~{hm(h)}</span>
    </span>
  )
}

export default async function RouteCostPage({ params }: Props) {
  const { route: slug } = await params
  const r = getRoute(slug)
  if (!r) notFound()

  const gas = getGasPrices()
  const { byState, avgPrice, vehicles } = routeCost(r, gas)
  const mid = vehicles.find((v) => v.key === DEFAULT_VEHICLE.key)!
  const cheapest = vehicles.reduce((a, b) => (a.oneWay < b.oneWay ? a : b))
  const priciest = vehicles.reduce((a, b) => (a.oneWay > b.oneWay ? a : b))
  const weekOf = prettyDate(gas.weekOf)
  const usHist = gas.history?.US ?? []
  const trendPct = usHist.length > 1 ? ((usHist[usHist.length - 1] - usHist[0]) / usHist[0]) * 100 : 0
  const sortedStates = [...byState].sort((a, b) => a.price - b.price)
  const cheapState = sortedStates[0]
  const dearState = sortedStates[sortedStates.length - 1]
  const priceGap = byState.length > 1 && dearState.price - cheapState.price >= 0.05
  const tankMiles = 14 * DEFAULT_VEHICLE.mpg // typical 14-gal midsize tank
  const fuelStops = Math.max(0, Math.ceil(r.distanceMi / (tankMiles * 0.8)) - 1) // refuel at ~1/5 tank
  const multiDay = r.days > 1

  // Itinerary legs between start → overnight stops → destination
  const points: (Place & { mileMark: number })[] = [{ ...r.from, mileMark: 0 }, ...r.stops, { ...r.to, mileMark: r.distanceMi }]
  const legs = points.slice(1).map((p, i) => {
    const mi = p.mileMark - points[i].mileMark
    return { from: cityName(points[i]), to: cityName(p), mi, h: (r.durationH * mi) / r.distanceMi }
  })
  // Hotel links use the town name (Stay22 rejects some raw coordinates)
  const hotelPlaces = [...r.stops, r.to]
  const related = relatedRoutes(r)
  const url = `${SITE}/road-trip-cost/${r.slug}`

  const faqs = [
    {
      q: `How much does it cost to drive from ${r.from.name} to ${r.to.name}?`,
      a: `At this week's gas prices (week of ${weekOf}), the ${miles(r.distanceMi)} drive costs about ${usd(mid.oneWay)} in gas one way in a midsize sedan (${DEFAULT_VEHICLE.mpg} MPG), or ${usd(mid.roundTrip)} round trip. A hybrid would spend about ${usd(cheapest.oneWay)} and a full-size pickup about ${usd(priciest.oneWay)}. Tolls, food and lodging are extra.`,
    },
    {
      q: `How long is the drive from ${r.from.name} to ${r.to.name}?`,
      a: `About ${hm(r.durationH)} of driving time for ${miles(r.distanceMi)}, without stops or traffic.${multiDay ? ` Most people split it into ${r.days} days of roughly ${hm(r.durationH / r.days)} each${r.stops.length ? `, stopping overnight near ${r.stops.map((s) => cityName(s)).join(' and ')}` : ''}.` : ' It is doable in a single day.'}`,
    },
    {
      q: `How many gallons of gas does the trip take?`,
      a: `About ${mid.gallons.toFixed(1)} gallons in a ${DEFAULT_VEHICLE.mpg} MPG midsize car, roughly ${fuelStops === 0 ? 'one tank, so you may not need to refuel' : `${fuelStops} fuel stop${fuelStops > 1 ? 's' : ''} on a 14-gallon tank`}. A ${vehicles.find((v) => v.key === 'pickup')!.mpg} MPG pickup needs about ${vehicles.find((v) => v.key === 'pickup')!.gallons.toFixed(1)} gallons.`,
    },
    ...(priceGap
      ? [{
          q: `Where is gas cheapest on the way from ${r.from.name} to ${r.to.name}?`,
          a: `Based on the latest EIA weekly averages, ${cheapState.name} (${usd2(cheapState.price)}/gal, ${cheapState.basis}) is the cheapest state on this route and ${dearState.name} (${usd2(dearState.price)}/gal) is the most expensive. Where you can, fill the tank in ${cheapState.name} rather than ${dearState.name}. On a 14-gallon tank that saves about ${usd2((dearState.price - cheapState.price) * 14)}.`,
        }]
      : []),
  ]

  const jsonLd = [
    {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
        { '@type': 'ListItem', position: 2, name: 'Road Trip Costs', item: `${SITE}/road-trip-cost` },
        { '@type': 'ListItem', position: 3, name: titleFor(r), item: url },
      ],
    },
    {
      '@context': 'https://schema.org', '@type': 'Trip',
      name: `${r.from.name} to ${r.to.name} road trip`,
      description: `${miles(r.distanceMi)} drive, about ${hm(r.durationH)}; gas ≈ ${usd(mid.oneWay)} one way in a midsize car (EIA prices, week of ${weekOf}).`,
      url,
      itinerary: {
        '@type': 'ItemList',
        itemListElement: points.map((p, i) => ({
          '@type': 'ListItem', position: i + 1,
          item: { '@type': 'City', name: cityName(p), geo: { '@type': 'GeoCoordinates', latitude: p.lat, longitude: p.lng } },
        })),
      },
    },
    {
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className="text-sm text-gray-500 mb-3" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-blue-700">Home</Link> ›{' '}
        <Link href="/road-trip-cost" className="hover:text-blue-700">Road Trip Costs</Link> ›{' '}
        <span className="text-gray-700">{r.from.name} to {r.to.name}</span>
      </nav>

      <h1 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-3">
        {r.from.name} to {r.to.name} Road Trip Cost
      </h1>
      <p className="text-gray-700 text-lg mb-6">
        Driving from <strong>{cityName(r.from)}</strong> to <strong>{cityName(r.to)}</strong> is{' '}
        <strong>{miles(r.distanceMi)}</strong> and about <strong>{hm(r.durationH)}</strong> behind the wheel.
        At this week&apos;s gas prices that&apos;s roughly <strong>{usd(mid.oneWay)}</strong> in fuel one way in a midsize car
        {' '}({usd(mid.roundTrip)} round trip).
      </p>

      {/* Key facts */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          ['Distance', miles(r.distanceMi)],
          ['Driving time', hm(r.durationH)],
          ['Gas, one way', usd(mid.oneWay)],
          [multiDay ? 'Suggested days' : 'Trip length', multiDay ? `${r.days} days` : 'Same day'],
        ].map(([k, v]) => (
          <div key={k} className="bg-white rounded-xl border border-blue-100 shadow-sm p-4">
            <div className="text-xs uppercase tracking-wide text-gray-500">{k}</div>
            <div className="text-2xl font-bold text-blue-800">{v}</div>
          </div>
        ))}
      </div>

      <RouteMap
        path={r.path}
        pins={[
          { name: cityName(r.from), lat: r.from.lat, lng: r.from.lng, kind: 'start' },
          ...r.stops.map((s) => ({ name: `Overnight: ${cityName(s)}`, lat: s.lat, lng: s.lng, kind: 'stop' as const })),
          { name: cityName(r.to), lat: r.to.lat, lng: r.to.lng, kind: 'end' },
        ]}
      />

      <div className="mt-6 bg-gradient-to-r from-blue-700 to-indigo-700 rounded-xl p-5 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <div className="font-bold text-lg">Use your exact car and today&apos;s pump price</div>
          <div className="text-blue-100 text-sm">The Road Trip Calculator adds your car&apos;s real MPG, extra stops, hotels and attractions.</div>
        </div>
        <Link href="/road-trip-cost-calculator" className="shrink-0 bg-white text-blue-800 font-semibold px-5 py-2.5 rounded-lg hover:bg-blue-50 text-center">
          Open the Road Trip Calculator →
        </Link>
      </div>

      {/* Cost by vehicle */}
      <section className="mt-10">
        <h2 className="text-2xl font-heading font-bold text-gray-900 mb-2">Gas cost by vehicle type</h2>
        <p className="text-gray-600 mb-4">
          Using a distance-weighted average of {usd2(avgPrice)}/gal for regular gas along this route and the EPA combined MPG average
          of 2024–2025 models in each class.
        </p>
        <div className="overflow-x-auto bg-white rounded-xl border border-blue-100 shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-blue-50 text-gray-700">
              <tr>
                <th className="text-left p-3">Vehicle</th>
                <th className="text-right p-3">MPG</th>
                <th className="text-right p-3">Gallons</th>
                <th className="text-right p-3">One way</th>
                <th className="text-right p-3">Round trip</th>
                <th className="text-right p-3 hidden sm:table-cell">Per person (4, round trip)</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => (
                <tr key={v.key} className={`border-t border-blue-50 ${v.key === DEFAULT_VEHICLE.key ? 'bg-yellow-50/60' : ''}`}>
                  <td className="p-3"><div className="font-medium text-gray-900">{v.label}</div><div className="text-xs text-gray-500">{v.example}</div></td>
                  <td className="p-3 text-right">{v.mpg}</td>
                  <td className="p-3 text-right">{v.gallons.toFixed(1)}</td>
                  <td className="p-3 text-right font-semibold">{usd(v.oneWay)}</td>
                  <td className="p-3 text-right">{usd(v.roundTrip)}</td>
                  <td className="p-3 text-right hidden sm:table-cell">{usd(v.roundTrip / 4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-gray-600 mt-3 text-sm">
          A hybrid saves about {usd(priciest.roundTrip - cheapest.roundTrip)} on the round trip compared with a full-size pickup.{' '}
          <Link href="/fuel-savings-calculator" className="text-blue-700 underline">See how much a more efficient car saves you over a year →</Link>
        </p>
      </section>

      {/* By state */}
      <section className="mt-10">
        <h2 className="text-2xl font-heading font-bold text-gray-900 mb-2">Miles and gas prices by state</h2>
        <p className="text-gray-600 mb-4">
          {byState.length > 1
            ? priceGap
              ? <>The route crosses {byState.length} states. Gas is cheapest in {cheapState.name} ({usd2(cheapState.price)}) and most expensive in {dearState.name} ({usd2(dearState.price)}), so plan fill-ups accordingly.</>
              : <>The route crosses {byState.length} states, and regular gas costs about the same in all of them this week (around {usd2(avgPrice)}/gal).</>
            : <>The whole drive stays in {byState[0]?.name}, where regular averages {usd2(byState[0]?.price ?? avgPrice)}/gal this week.</>}
        </p>
        <div className="overflow-x-auto bg-white rounded-xl border border-blue-100 shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-blue-50 text-gray-700">
              <tr><th className="text-left p-3">State</th><th className="text-right p-3">Miles</th><th className="text-right p-3">Regular gas</th><th className="text-right p-3">Gas cost (midsize)</th></tr>
            </thead>
            <tbody>
              {byState.map((s) => (
                <tr key={s.state} className="border-t border-blue-50">
                  <td className="p-3 font-medium text-gray-900">{s.name}</td>
                  <td className="p-3 text-right">{Math.round(s.miles).toLocaleString('en-US')}</td>
                  <td className="p-3 text-right">{usd2(s.price)}<div className="text-xs text-gray-500">{s.basis}</div></td>
                  <td className="p-3 text-right">{usd2((s.miles / DEFAULT_VEHICLE.mpg) * s.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Prices: <a href={gas.sourceUrl} className="underline" rel="nofollow noopener" target="_blank">EIA weekly retail regular gasoline</a>, week of {weekOf}.
          {Math.abs(trendPct) >= 1 && <> The U.S. average is {trendPct < 0 ? 'down' : 'up'} {Math.abs(trendPct).toFixed(0)}% over the last {usHist.length} weeks.</>}
          {' '}States without their own EIA series use their EIA region average.
        </p>
      </section>

      {/* Itinerary + hotels */}
      <section className="mt-10">
        <h2 className="text-2xl font-heading font-bold text-gray-900 mb-2">{multiDay ? `Suggested ${r.days}-day plan and where to stay` : 'Where to stay'}</h2>
        <p className="text-gray-600 mb-4">
          {multiDay
            ? <>At about {hm(r.durationH / r.days)} of driving a day, these are natural overnight stops. Stop times are estimates, so adjust for traffic, weather and breaks.</>
            : <>This drive fits in one day, so you only need a place to stay in {r.to.name}.</>}
        </p>
        <ol className="space-y-3 mb-6">
          {legs.map((l, i) => (
            <li key={i} className="bg-white rounded-xl border border-blue-100 p-4 shadow-sm flex gap-3">
              <span className="shrink-0 w-8 h-8 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold">{i + 1}</span>
              <div className="text-gray-800"><div className="text-xs uppercase text-gray-500 mb-0.5">Day {i + 1}</div><Leg {...l} /></div>
            </li>
          ))}
        </ol>
        <div className="grid sm:grid-cols-2 gap-3">
          {hotelPlaces.map((p, i) => (
            <a
              key={`${p.name}-${i}`}
              href={generateStay22AllezLink({ address: cityName(p), adults: 2, campaign: `route-${r.slug}`.slice(0, 60) })}
              target="_blank"
              rel="sponsored noopener"
              className="block bg-white rounded-xl border border-amber-200 p-4 shadow-sm hover:shadow-md hover:border-amber-400 transition"
            >
              <div className="text-xs uppercase text-amber-700 font-semibold">{i < r.stops.length ? `Night ${i + 1} stop` : 'Destination'}</div>
              <div className="font-bold text-gray-900">Hotels in {cityName(p)}</div>
              <div className="text-sm text-blue-700 mt-1">Compare prices →</div>
            </a>
          ))}
        </div>
      </section>

      <RentalOffers routeSlug={r.slug} from={r.from} to={r.to} distanceMi={r.distanceMi} />

      {/* Driving back */}
      <section className="mt-10 bg-white rounded-xl border border-blue-100 p-5 shadow-sm">
        <h2 className="text-xl font-heading font-bold text-gray-900 mb-1">Driving {r.to.name} to {r.from.name} instead?</h2>
        <p className="text-gray-700">
          The return drive is the same {miles(r.distanceMi)} and costs about the same: {usd(mid.oneWay)} in a midsize car.
          {priceGap ? <> though you may want to buy gas in {cheapState.name} on the way back too.</> : null}
        </p>
      </section>

      <section className="mt-10">
        <GasAlertBox defaultState={r.from.state} source="route-page" heading={`Driving from ${r.from.name}? Get your gas cost every week`} />
      </section>

      {/* FAQ */}
      <section className="mt-10">
        <h2 className="text-2xl font-heading font-bold text-gray-900 mb-4">{r.from.name} to {r.to.name} questions</h2>
        <div className="space-y-3">
          {faqs.map((f) => (
            <details key={f.q} className="bg-white rounded-xl border border-blue-100 p-4 shadow-sm" open>
              <summary className="font-semibold text-gray-900 cursor-pointer">{f.q}</summary>
              <p className="text-gray-700 mt-2">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {related.length > 0 && (
        <section className="mt-10">
          <h2 className="text-2xl font-heading font-bold text-gray-900 mb-4">Related road trips</h2>
          <div className="grid sm:grid-cols-2 gap-2">
            {related.map((x) => (
              <Link key={x.slug} href={`/road-trip-cost/${x.slug}`} className="bg-white rounded-lg border border-blue-100 px-4 py-3 hover:border-blue-400 flex justify-between">
                <span className="text-blue-800 font-medium">{x.from.name} → {x.to.name}</span>
                <span className="text-gray-500 text-sm">{miles(x.distanceMi)}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <p className="text-xs text-gray-500 mt-10">
        How we calculate: route distance and driving time from OpenRouteService (OpenStreetMap data), computed {prettyDate(r.computedAt)};
        miles per state measured along the route; fuel cost = miles ÷ MPG × the EIA regular-gas price for each state or region.
        Overnight stops assume about 8 hours of driving per day. Hotel links are partner links, so we may earn a commission at no cost to you.
      </p>
    </div>
  )
}
