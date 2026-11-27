import { getGasPrices, statePrice, STATE_NAMES, ROUTES } from '../road-trip-cost/lib'
import { getPriceSnapshot } from '../lib/energyPrices'

export const STATE_LIST = Object.entries(STATE_NAMES).map(([ab, name]) => ({ ab, name, slug: name.toLowerCase().replace(/[^a-z]+/g, '-') }))
export const stateBySlug = (slug: string) => STATE_LIST.find((s) => s.slug === slug)

// Typical numbers used for the gas vs EV comparison (stated on the page)
export const TYPICAL = { gasMpg: 28, evMiPerKwh: 3.5, batteryKwh: 75, monthlyMiles: 1000 }

export function stateData(ab: string) {
  const gas = getGasPrices()
  const snap = getPriceSnapshot()
  const sp = statePrice(gas, ab)
  const hist = gas.history?.[sp.key] ?? []
  const weeks = gas.weeks ?? []
  const prev = hist.length > 1 ? hist[hist.length - 2] : null
  const first = hist.length ? hist[0] : null
  const s = snap.states[ab]
  const elecDollars = s.elecCents / 100
  const gasPerMile = s.gas / TYPICAL.gasMpg
  const evPerMile = elecDollars / TYPICAL.evMiPerKwh
  const routes = ROUTES.filter((r) => r.from.state === ab || r.to.state === ab).sort((a, b) => a.distanceMi - b.distanceMi)
  const sharesRegion = sp.key !== ab
  const peers = sharesRegion ? STATE_LIST.filter((o) => o.ab !== ab && statePrice(gas, o.ab).key === sp.key).map((o) => o.name) : []
  return {
    name: STATE_NAMES[ab], ab, gas: s.gas, basis: sp.basis, seriesKey: sp.key, sharesRegion, peers,
    weekOf: gas.weekOf, history: hist.map((p, i) => ({ week: weeks[i] ?? '', price: p })),
    change: prev !== null ? s.gas - prev : null,
    trend: first !== null ? s.gas - first : null,
    elecCents: s.elecCents, elecBasis: s.elecBasis, elecPeriod: snap.elecPeriod,
    fullCharge: TYPICAL.batteryKwh * elecDollars,
    elecCentsPrevYear: s.elecCentsPrevYear, elecPrevPeriod: snap.elecPrevPeriod,
    fullChargePrevYear: s.elecCentsPrevYear !== null ? (TYPICAL.batteryKwh * s.elecCentsPrevYear) / 100 : null,
    gasPerMile, evPerMile,
    gasMonthly: gasPerMile * TYPICAL.monthlyMiles, evMonthly: evPerMile * TYPICAL.monthlyMiles,
    routes,
  }
}
