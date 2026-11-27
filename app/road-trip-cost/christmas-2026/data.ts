import { ROUTES, getGasPrices, routeCost, DEFAULT_VEHICLE, type RouteRec } from '../lib'
import { getHistory, holidayWeek, holidaySeries, rankOf } from '../holidays'

// 2026 Christmas Road Trip Gas Report. Before Christmas week it compares the latest EIA week
// with last Christmas; once EIA publishes the Christmas-week price it locks to that week.
export const XMAS = {
  slug: 'christmas-2026',
  title: '2026 Christmas Road Trip Gas Report',
  published: '2026-11-27',
  year: 2026,
}

// Christmas drives: family visits between nearby metros, plus ski and warm-weather getaways
export const XMAS_ROUTE_SLUGS = [
  'new-york-to-washington', 'new-york-to-boston', 'new-york-to-philadelphia', 'chicago-to-detroit',
  'chicago-to-minneapolis', 'chicago-to-indianapolis', 'dallas-to-houston', 'atlanta-to-orlando',
  'los-angeles-to-las-vegas', 'los-angeles-to-san-francisco', 'philadelphia-to-pittsburgh', 'washington-to-charlotte',
  'denver-to-aspen', 'salt-lake-city-to-jackson', 'boston-to-north-conway', 'new-york-to-burlington',
  'miami-to-key-west', 'orlando-to-tampa', 'phoenix-to-sedona', 'seattle-to-portland-or',
]

export function xmasStats() {
  const weeks = getHistory()
  const series = holidaySeries('christmas', XMAS.year, weeks)
  const thisWeek = holidayWeek('christmas', XMAS.year)
  const locked = series.find((s) => s.year === XMAS.year) ?? null
  const last = series.find((s) => s.year === XMAS.year - 1)!
  const latest = weeks[weeks.length - 1]
  const current = locked ? { week: locked.week, price: locked.price } : { week: latest[0], price: latest[1] }
  const past = series.filter((s) => s.year < XMAS.year)
  const rank = rankOf(current.price, past) // rank vs all previous Christmas weeks (1 = highest)
  const tg = holidaySeries('thanksgiving', XMAS.year, weeks).find((s) => s.year === XMAS.year) ?? null
  const yoyPct = ((current.price - last.price) / last.price) * 100
  const extraPer500 = (500 / DEFAULT_VEHICLE.mpg) * (current.price - last.price)
  const daysToXmasWeek = Math.ceil((Date.parse(thisWeek + 'T00:00:00Z') - Date.now()) / 86_400_000)
  return { series, past, locked: Boolean(locked), thisWeek, last, latest, current, rank, tg, yoyPct, extraPer500, daysToXmasWeek }
}

export function xmasRoutes() {
  const gas = getGasPrices()
  const { current, last } = xmasStats()
  return XMAS_ROUTE_SLUGS.map((s) => ROUTES.find((r) => r.slug === s))
    .filter((r): r is RouteRec => Boolean(r))
    .map((r) => {
      const mid = routeCost(r, gas).vehicles.find((v) => v.key === DEFAULT_VEHICLE.key)!
      return { r, roundTrip: mid.roundTrip, extraRoundTrip: mid.gallons * 2 * (current.price - last.price) }
    })
}

export function chartWeeks(from = `${XMAS.year - 1}-10-01`) {
  return getHistory().filter(([d]) => d >= from)
}
