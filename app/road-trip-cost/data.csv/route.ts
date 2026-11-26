import { ROUTES, SITE, getGasPrices, routeCost } from '../lib'

export const revalidate = 86400

// Open dataset (CC BY 4.0): gas cost of every tracked route at the latest EIA weekly prices.
export async function GET() {
  const gas = getGasPrices()
  const esc = (v: string | number) => (typeof v === 'number' ? String(v) : /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v)
  const header = ['route', 'from', 'to', 'region', 'distance_mi', 'drive_hours', 'states', 'avg_regular_gas_usd', 'gas_one_way_hybrid_usd', 'gas_one_way_midsize_usd', 'gas_one_way_small_suv_usd', 'gas_one_way_pickup_usd', 'gas_week_of', 'url']
  const rows = ROUTES.map((r) => {
    const c = routeCost(r, gas)
    const v = (k: string) => Number(c.vehicles.find((x) => x.key === k)!.oneWay.toFixed(2))
    return [
      `${r.from.name} to ${r.to.name}`, `${r.from.name}, ${r.from.state}`, `${r.to.name}, ${r.to.state}`, r.region,
      Math.round(r.distanceMi), Number(r.durationH.toFixed(2)), r.states.map((s) => s.state).join(' > '),
      Number(c.avgPrice.toFixed(3)), v('hybrid'), v('midsize'), v('smallsuv'), v('pickup'), gas.weekOf,
      `${SITE}/road-trip-cost/${r.slug}`,
    ].map(esc).join(',')
  })
  const body = [`# Road trip gas costs - MPGCalculator.net (${SITE}/road-trip-cost) - CC BY 4.0 - gas prices: EIA week of ${gas.weekOf}`, header.join(','), ...rows].join('\n') + '\n'
  return new Response(body, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `inline; filename="road-trip-gas-costs-${gas.weekOf}.csv"`,
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
