import { readFileSync } from 'fs'
import path from 'path'
import { getGasPrices, statePrice, STATE_NAMES } from '../road-trip-cost/lib'

// Server-only: builds a compact per-state price snapshot (gas from the weekly EIA
// cron, electricity from the monthly EIA table) that's safe to pass to the client.

export interface PriceSnapshot {
  gasWeekOf: string
  elecPeriod: string
  states: Record<string, { name: string; gas: number; gasBasis: string; elecCents: number; elecBasis: string; gasHistory?: number[] }>
}

function readJson<T>(files: string[]): T | null {
  for (const f of files) {
    try {
      return JSON.parse(readFileSync(path.join(process.cwd(), 'data', f), 'utf8')) as T
    } catch {
      // try next
    }
  }
  return null
}

export function getPriceSnapshot(): PriceSnapshot {
  const gas = getGasPrices()
  const elec = readJson<{ period: string; centsPerKwh: Record<string, number> }>(['electricity-prices.live.json', 'electricity-prices.json'])
  const usCents = elec?.centsPerKwh.US ?? 18
  const states: PriceSnapshot['states'] = {}
  for (const [ab, name] of Object.entries(STATE_NAMES)) {
    const g = statePrice(gas, ab)
    const own = elec?.centsPerKwh[ab]
    states[ab] = {
      name,
      gas: g.price,
      gasBasis: g.basis,
      elecCents: own ?? usCents,
      elecBasis: own ? `${name} average` : 'U.S. average',
    }
  }
  return { gasWeekOf: gas.weekOf, elecPeriod: elec?.period ?? '', states }
}

/** Previous-week gas price for a state's EIA series (state, else its region, else U.S.). */
export function previousWeekGas(stateAb: string): number | null {
  const gas = getGasPrices()
  const h = gas.history?.[statePrice(gas, stateAb).key]
  return h && h.length > 1 ? h[h.length - 2] : null
}
