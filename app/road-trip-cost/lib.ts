import { readFileSync } from 'fs'
import path from 'path'
import routesData from '../../data/road-trips/routes.json'

// ---------- types ----------
export interface Place { name: string; state: string; lng: number; lat: number; label?: string }
export interface Stop extends Place { mileMark: number }
export interface RouteRec {
  slug: string
  region: string
  from: Place
  to: Place
  distanceMi: number
  durationH: number
  days: number
  states: { state: string; miles: number }[]
  stops: Stop[]
  path: [number, number][]
  computedAt: string
}
export interface GasPrices {
  source: string
  sourceUrl: string
  weekOf: string
  weeks: string[]
  prices: Record<string, number>
  history: Record<string, number[]>
}

export const SITE = 'https://mpgcalculator.net'
export const ROUTES: RouteRec[] = (routesData as unknown as { routes: RouteRec[] }).routes

export function getRoute(slug: string) {
  return ROUTES.find((r) => r.slug === slug)
}

// ---------- gas prices (read at render time so the weekly cron update shows without a rebuild) ----------
const FALLBACK_GAS: GasPrices = {
  source: 'U.S. Energy Information Administration (EIA), weekly retail regular gasoline prices',
  sourceUrl: 'https://www.eia.gov/dnav/pet/pet_pri_gnd_a_epmr_pte_dpgal_w.htm',
  weekOf: '2026-11-23',
  weeks: ['2026-11-23'],
  prices: { US: 3.642, PADD1A: 3.778, PADD1B: 3.95, PADD1C: 3.305, PADD2: 3.38, PADD3: 3.125, PADD4: 3.502, PADD5: 4.805, PADD5XCA: 4.272 },
  history: {},
}
// data/gas-prices.live.json = weekly cron output (git-ignored); data/gas-prices.json = committed baseline.
export function getGasPrices(): GasPrices {
  for (const file of ['gas-prices.live.json', 'gas-prices.json']) {
    try {
      return JSON.parse(readFileSync(path.join(process.cwd(), 'data', file), 'utf8'))
    } catch {
      // try the next file
    }
  }
  return FALLBACK_GAS
}

// EIA reporting regions (PADDs). States with their own EIA series use that price directly.
const PADD: Record<string, string> = {
  CT: 'PADD1A', ME: 'PADD1A', MA: 'PADD1A', NH: 'PADD1A', RI: 'PADD1A', VT: 'PADD1A',
  DE: 'PADD1B', DC: 'PADD1B', MD: 'PADD1B', NJ: 'PADD1B', NY: 'PADD1B', PA: 'PADD1B',
  FL: 'PADD1C', GA: 'PADD1C', NC: 'PADD1C', SC: 'PADD1C', VA: 'PADD1C', WV: 'PADD1C',
  IL: 'PADD2', IN: 'PADD2', IA: 'PADD2', KS: 'PADD2', KY: 'PADD2', MI: 'PADD2', MN: 'PADD2', MO: 'PADD2', NE: 'PADD2', ND: 'PADD2', SD: 'PADD2', OH: 'PADD2', OK: 'PADD2', TN: 'PADD2', WI: 'PADD2',
  AL: 'PADD3', AR: 'PADD3', LA: 'PADD3', MS: 'PADD3', NM: 'PADD3', TX: 'PADD3',
  CO: 'PADD4', ID: 'PADD4', MT: 'PADD4', UT: 'PADD4', WY: 'PADD4',
  AK: 'PADD5XCA', AZ: 'PADD5XCA', CA: 'PADD5', HI: 'PADD5XCA', NV: 'PADD5XCA', OR: 'PADD5XCA', WA: 'PADD5XCA',
}
const REGION_NAME: Record<string, string> = {
  PADD1A: 'New England average', PADD1B: 'Central Atlantic average', PADD1C: 'Lower Atlantic average',
  PADD2: 'Midwest average', PADD3: 'Gulf Coast average', PADD4: 'Rocky Mountain average',
  PADD5: 'West Coast average', PADD5XCA: 'West Coast (excl. CA) average', US: 'U.S. average',
}
export function statePrice(gas: GasPrices, st: string): { price: number; basis: string; key: string } {
  if (gas.prices[st]) return { price: gas.prices[st], basis: `${STATE_NAMES[st] ?? st} average`, key: st }
  const r = PADD[st]
  if (r && gas.prices[r]) return { price: gas.prices[r], basis: REGION_NAME[r], key: r }
  return { price: gas.prices.US, basis: REGION_NAME.US, key: 'US' }
}

// ---------- vehicles: EPA combined MPG averages of 2024–2025 gasoline models (from our EPA database) ----------
export const VEHICLE_TYPES = [
  { key: 'hybrid', label: 'Hybrid car', mpg: 46.5, example: 'e.g. Camry Hybrid, Prius' },
  { key: 'midsize', label: 'Midsize sedan', mpg: 28.2, example: 'e.g. Accord, Camry' },
  { key: 'compact', label: 'Compact car', mpg: 27.5, example: 'e.g. Civic, Corolla' },
  { key: 'smallsuv', label: 'Small SUV / crossover', mpg: 25.4, example: 'e.g. RAV4, CR-V' },
  { key: 'minivan', label: 'Minivan', mpg: 25.3, example: 'e.g. Odyssey, Pacifica' },
  { key: 'largesuv', label: 'Large SUV', mpg: 19.0, example: 'e.g. Tahoe, Expedition' },
  { key: 'pickup', label: 'Full-size pickup', mpg: 18.1, example: 'e.g. F-150, Silverado' },
] as const
export const DEFAULT_VEHICLE = VEHICLE_TYPES[1] // midsize sedan

// ---------- costs ----------
export function routeCost(route: RouteRec, gas: GasPrices) {
  const byState = route.states.map((s) => {
    const { price, basis } = statePrice(gas, s.state)
    return { ...s, price, basis, name: STATE_NAMES[s.state] ?? s.state }
  })
  const stateMiles = byState.reduce((t, s) => t + s.miles, 0) || route.distanceMi
  // Distance-weighted average price along the route
  const avgPrice = byState.reduce((t, s) => t + s.price * s.miles, 0) / stateMiles || gas.prices.US
  const vehicles = VEHICLE_TYPES.map((v) => {
    const gallons = route.distanceMi / v.mpg
    const oneWay = gallons * avgPrice
    return { ...v, gallons, oneWay, roundTrip: oneWay * 2 }
  })
  return { byState, avgPrice, vehicles }
}

// ---------- formatting ----------
// Whole dollars for trip-sized amounts, cents for small ones
export const usd = (n: number) => (n >= 10 ? `$${Math.round(n).toLocaleString('en-US')}` : `$${n.toFixed(2)}`)
export const usd2 = (n: number) => `$${n.toFixed(2)}`
export const miles = (n: number) => `${Math.round(n).toLocaleString('en-US')} mi`
export function hm(h: number) {
  const hrs = Math.floor(h)
  const mins = Math.round((h - hrs) * 60)
  if (mins === 60) return `${hrs + 1}h`
  if (hrs === 0) return `${mins}m`
  return mins === 0 ? `${hrs}h` : `${hrs}h ${mins}m`
}
export const cityName = (p: Place) => `${p.name}, ${p.state}`
export function prettyDate(iso: string) {
  return new Date(iso + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
}

export function relatedRoutes(route: RouteRec, limit = 8) {
  const score = (r: RouteRec) =>
    (r.from.name === route.from.name || r.to.name === route.from.name ? 2 : 0) +
    (r.to.name === route.to.name || r.from.name === route.to.name ? 2 : 0) +
    (r.region === route.region ? 1 : 0)
  return ROUTES.filter((r) => r.slug !== route.slug)
    .map((r) => ({ r, s: score(r) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s || a.r.distanceMi - b.r.distanceMi)
    .slice(0, limit)
    .map((x) => x.r)
}

export const STATE_NAMES: Record<string, string> = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California', CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', DC: 'District of Columbia', FL: 'Florida', GA: 'Georgia', HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa', KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland', MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina', SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont', VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
}
