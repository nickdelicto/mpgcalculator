#!/usr/bin/env node
/**
 * Saves the full weekly U.S. average retail REGULAR gasoline price history (EIA series
 * EMM_EPMR_PTE_NUS_DPG, 1990→now) to data/eia-us-weekly.json. No API key needed.
 * Used by the data reports (e.g. /road-trip-cost/holiday-2026) for year-over-year numbers.
 *
 *   node scripts/update-gas-history.mjs
 */
import { writeFileSync, renameSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const SOURCE = 'https://www.eia.gov/dnav/pet/hist/LeafHandler.ashx?n=pet&s=emm_epmr_pte_nus_dpg&f=w'
const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'data', 'eia-us-weekly.json')
const MONTHS = { Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12 }

const res = await fetch(SOURCE, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; gas-history-updater)' } })
if (!res.ok) { console.error(`EIA fetch failed: HTTP ${res.status}`); process.exit(1) }
const text = (await res.text()).replace(/<[^>]+>/g, '|').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ')
const cells = text.split('|').map((s) => s.trim()).filter(Boolean)

const weeks = []
let year = null, md = null
for (const c of cells) {
  const ym = c.match(/^(\d{4})-(\w{3})$/)
  if (ym && MONTHS[ym[2]]) { year = ym[1]; md = null; continue }
  if (year && /^\d{2}\/\d{2}$/.test(c)) { md = c; continue }
  if (year && md && /^\d\.\d{3}$/.test(c)) {
    const [m, d] = md.split('/')
    weeks.push([`${year}-${m}-${d}`, Number(c)])
    md = null
  }
}
weeks.sort((a, b) => a[0].localeCompare(b[0]))
const last = weeks[weeks.length - 1]
if (weeks.length < 1500 || !last || last[1] < 1.5 || last[1] > 10) { console.error(`Implausible history (${weeks.length} weeks, last ${last})`); process.exit(1) }

writeFileSync(OUT + '.tmp', JSON.stringify({ source: 'U.S. Energy Information Administration (EIA), weekly U.S. regular gasoline retail price', sourceUrl: SOURCE, series: 'EMM_EPMR_PTE_NUS_DPG', updatedAt: new Date().toISOString(), weeks }))
renameSync(OUT + '.tmp', OUT)
console.log(`Saved ${weeks.length} weeks (${weeks[0][0]} → ${last[0]}, latest $${last[1]})`)
