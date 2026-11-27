import { SITE } from '../../lib'
import { holidaySeries } from '../../holidays'
import { XMAS } from '../data'

export const revalidate = 86400

// Open dataset (CC BY 4.0): U.S. regular gas price in the EIA week containing Christmas, every year since 1990.
export async function GET() {
  const rows = holidaySeries('christmas', XMAS.year)
  const body = [
    `# Christmas-week U.S. regular gasoline prices - source: EIA series EMM_EPMR_PTE_NUS_DPG - compiled by MPGCalculator.net (${SITE}/road-trip-cost/${XMAS.slug}) - CC BY 4.0`,
    'year,eia_week_of,us_regular_usd_per_gal,change_vs_prior_year_pct',
    ...rows.map((r, i) => `${r.year},${r.week},${r.price.toFixed(3)},${i ? (((r.price - rows[i - 1].price) / rows[i - 1].price) * 100).toFixed(1) : ''}`),
  ].join('\n') + '\n'
  return new Response(body, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'inline; filename="christmas-gas-prices.csv"', 'Cache-Control': 'public, max-age=3600' } })
}
