import { getHistory, holidayWeek, holidaySeries } from '../holidays'
import { ROUTES, getGasPrices, routeCost, DEFAULT_VEHICLE, type RouteRec } from '../lib'

// 2026 Holiday Road Trip Gas Report — every number is computed from EIA data + our route data.
export const REPORT = {
  slug: 'holiday-2026',
  title: '2026 Holiday Road Trip Gas Report',
  published: '2026-11-26',
  anchorWeek: '2026-11-23', // EIA week of Thanksgiving 2026 (headline numbers are frozen to this week)
  year: 2026,
}

// Popular holiday drives (family visits between nearby metros + classic getaways)
export const HOLIDAY_ROUTE_SLUGS = [
  'new-york-to-washington', 'new-york-to-boston', 'new-york-to-philadelphia', 'los-angeles-to-las-vegas',
  'los-angeles-to-san-francisco', 'los-angeles-to-san-diego', 'chicago-to-detroit', 'chicago-to-indianapolis',
  'chicago-to-st-louis', 'chicago-to-minneapolis', 'dallas-to-houston', 'houston-to-austin', 'atlanta-to-orlando',
  'atlanta-to-nashville', 'miami-to-orlando', 'charlotte-to-raleigh', 'philadelphia-to-pittsburgh',
  'seattle-to-portland-or', 'washington-to-charlotte', 'boston-to-portland-me',
]

// Read at render time so the weekly cron's history refresh shows without a rebuild
const weeksNow = () => getHistory()

/** Monday of the EIA week containing Thanksgiving (4th Thursday of November). */
export const thanksgivingWeek = (year: number) => holidayWeek('thanksgiving', year)

export function thanksgivingSeries() {
  return holidaySeries('thanksgiving', REPORT.year)
}

export function reportStats() {
  const tg = thanksgivingSeries()
  const now = tg.find((t) => t.year === REPORT.year)!
  const last = tg.find((t) => t.year === REPORT.year - 1)!
  const ranked = [...tg].sort((a, b) => b.price - a.price)
  const rank = ranked.findIndex((t) => t.year === REPORT.year) + 1
  const higherYears = ranked.slice(0, rank - 1)
  const WEEKS = weeksNow()
  const yearWeeks = WEEKS.filter(([d]) => d.startsWith(`${REPORT.year}-`) && d <= REPORT.anchorWeek)
  const peak = yearWeeks.reduce((a, b) => (b[1] > a[1] ? b : a))
  const low = yearWeeks.reduce((a, b) => (b[1] < a[1] ? b : a))
  const latest = WEEKS[WEEKS.length - 1]
  const yoyPct = ((now.price - last.price) / last.price) * 100
  const fromPeakPct = ((now.price - peak[1]) / peak[1]) * 100
  // Extra fuel cost vs last Thanksgiving for a 500-mile round trip in a midsize car
  const extraPer500 = (500 / DEFAULT_VEHICLE.mpg) * (now.price - last.price)
  return { tg, now, last, rank, years: tg.length, higherYears, peak, low, latest, yoyPct, fromPeakPct, extraPer500 }
}

export function chartSeries(fromDate = `${REPORT.year - 1}-01-01`) {
  return weeksNow().filter(([d]) => d >= fromDate)
}

export function holidayRoutes() {
  const gas = getGasPrices()
  const { now, last } = reportStats()
  return HOLIDAY_ROUTE_SLUGS.map((s) => ROUTES.find((r) => r.slug === s))
    .filter((r): r is RouteRec => Boolean(r))
    .map((r) => {
      const c = routeCost(r, gas)
      const mid = c.vehicles.find((v) => v.key === DEFAULT_VEHICLE.key)!
      // Same gallons at the national price change since last Thanksgiving (apples-to-apples)
      const extraRoundTrip = mid.gallons * 2 * (now.price - last.price)
      return { r, oneWay: mid.oneWay, roundTrip: mid.roundTrip, avgPrice: c.avgPrice, extraRoundTrip, hybridRoundTrip: c.vehicles.find((v) => v.key === 'hybrid')!.roundTrip, pickupRoundTrip: c.vehicles.find((v) => v.key === 'pickup')!.roundTrip }
    })
}

export function medianRouteCost() {
  const gas = getGasPrices()
  const costs = ROUTES.map((r) => routeCost(r, gas).vehicles.find((v) => v.key === DEFAULT_VEHICLE.key)!.oneWay).sort((a, b) => a - b)
  return costs[Math.floor(costs.length / 2)]
}
