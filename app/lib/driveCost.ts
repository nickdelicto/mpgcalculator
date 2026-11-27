// Pure "what does driving cost me" math — safe for client and server.

export type FuelKind = 'gas' | 'ev'

export interface DriverProfile {
  fuel: FuelKind
  /** MPG for gas cars, miles per kWh for EVs */
  efficiency: number
  weeklyMiles: number
}

export const DEFAULTS = { gasMpg: 28, evMiPerKwh: 3.5, weeklyMiles: 250 }

/** Cost per mile in dollars. gasPrice: $/gal. elecCents: ¢/kWh (home charging). */
export function costPerMile(p: DriverProfile, gasPrice: number, elecCents: number) {
  if (p.efficiency <= 0) return 0
  return p.fuel === 'ev' ? elecCents / 100 / p.efficiency : gasPrice / p.efficiency
}

export function driveCost(p: DriverProfile, gasPrice: number, elecCents: number) {
  const perMile = costPerMile(p, gasPrice, elecCents)
  const week = perMile * p.weeklyMiles
  return { perMile, week, month: (week * 52) / 12, year: week * 52 }
}

export const money = (n: number) => (n >= 100 ? `$${Math.round(n).toLocaleString('en-US')}` : `$${n.toFixed(2)}`)
