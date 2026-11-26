import { SITE } from '../../lib'
import { REPORT, thanksgivingSeries } from '../data'

export const revalidate = 86400

// Open dataset (CC BY 4.0): U.S. regular gas price in Thanksgiving week, every year since 1990.
export async function GET() {
  const rows = thanksgivingSeries()
  const body = [
    `# Thanksgiving-week U.S. regular gasoline prices - source: EIA series EMM_EPMR_PTE_NUS_DPG - compiled by MPGCalculator.net (${SITE}/road-trip-cost/${REPORT.slug}) - CC BY 4.0`,
    'year,eia_week_of,us_regular_usd_per_gal,change_vs_prior_year_pct',
    ...rows.map((r, i) => {
      const prev = rows[i - 1]
      const chg = prev ? (((r.price - prev.price) / prev.price) * 100).toFixed(1) : ''
      return `${r.year},${r.week},${r.price.toFixed(3)},${chg}`
    }),
  ].join('\n') + '\n'
  return new Response(body, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'inline; filename="thanksgiving-gas-prices-1990-2026.csv"',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
