#!/usr/bin/env node
/**
 * Pulls the latest weekly U.S. retail REGULAR gasoline prices from the EIA
 * (U.S. Energy Information Administration) public table and writes
 * data/gas-prices.json. No API key needed.
 *
 * Source table: https://www.eia.gov/dnav/pet/pet_pri_gnd_a_epmr_pte_dpgal_w.htm
 * EIA publishes every Monday (evening ET). Run weekly via cron, e.g. Tuesday:
 *   15 11 * * 2  cd /home/delicto/apps/mpgcalculator && node scripts/update-gas-prices.mjs
 * Route pages (/road-trip-cost/*) read this file at render time (ISR, 1 day),
 * so no rebuild is needed after an update.
 *
 * Safety: if the fetch/parse fails or the numbers look wrong, the existing
 * file is left untouched and the script exits non-zero.
 */
import { writeFileSync, readFileSync, existsSync, renameSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const SOURCE = 'https://www.eia.gov/dnav/pet/pet_pri_gnd_a_epmr_pte_dpgal_w.htm'
const DATA = join(dirname(fileURLToPath(import.meta.url)), '..', 'data')
// Writes the git-ignored live file (so server-side updates never block `git pull`).
// Pass --baseline to update the committed fallback data/gas-prices.json instead.
const OUT = join(DATA, process.argv.includes('--baseline') ? 'gas-prices.json' : 'gas-prices.live.json')

// Row labels in the EIA table → our keys
const AREAS = {
  'U.S.': 'US',
  'East Coast (PADD1)': 'PADD1',
  'New England (PADD 1A)': 'PADD1A',
  'Central Atlantic (PADD 1B)': 'PADD1B',
  'Lower Atlantic (PADD 1C)': 'PADD1C',
  'Midwest (PADD 2)': 'PADD2',
  'Gulf Coast (PADD 3)': 'PADD3',
  'Rocky Mountain (PADD 4)': 'PADD4',
  'West Coast (PADD 5)': 'PADD5',
  'West Coast less California': 'PADD5XCA',
  California: 'CA', Colorado: 'CO', Florida: 'FL', Massachusetts: 'MA', Minnesota: 'MN',
  'New York': 'NY', Ohio: 'OH', Texas: 'TX', Washington: 'WA',
}

function toText(html) {
  return html
    .replace(/<[^>]+>/g, '|')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\|\s*(\|\s*)+/g, '|')
    .replace(/\s+/g, ' ')
}

async function main() {
  const res = await fetch(SOURCE, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; gas-price-updater)' } })
  if (!res.ok) throw new Error(`EIA fetch failed: HTTP ${res.status}`)
  const text = toText(await res.text())
  const cells = text.split('|').map((s) => s.trim()).filter(Boolean)

  // Dates header: the run of MM/DD/YY cells right before the first "View"
  const firstView = cells.indexOf('View')
  const dates = []
  for (let i = firstView - 1; i >= 0 && /^\d{2}\/\d{2}\/\d{2}$/.test(cells[i]); i--) dates.unshift(cells[i])
  if (dates.length < 2) throw new Error('Could not find week dates in EIA table')
  const isoDates = dates.map((d) => { const [m, dd, yy] = d.split('/'); return `20${yy}-${m}-${dd}` })

  const prices = {}
  const history = {}
  for (const [label, key] of Object.entries(AREAS)) {
    const i = cells.indexOf(label)
    if (i === -1) continue
    const vals = cells.slice(i + 1, i + 1 + dates.length).map(Number)
    if (vals.some((v) => !Number.isFinite(v))) continue
    history[key] = vals
    prices[key] = vals[vals.length - 1]
  }

  // Sanity checks — never overwrite good data with garbage
  if (!prices.US || prices.US < 1.5 || prices.US > 10) throw new Error(`Implausible U.S. price: ${prices.US}`)
  for (const k of ['PADD1A', 'PADD1B', 'PADD1C', 'PADD2', 'PADD3', 'PADD4', 'PADD5']) {
    if (!prices[k]) throw new Error(`Missing region ${k}`)
  }

  const out = {
    source: 'U.S. Energy Information Administration (EIA), weekly retail regular gasoline prices',
    sourceUrl: SOURCE,
    weekOf: isoDates[isoDates.length - 1],
    weeks: isoDates,
    prices,
    history,
    updatedAt: new Date().toISOString(),
  }

  const prevFile = existsSync(OUT) ? OUT : join(DATA, 'gas-prices.json')
  if (existsSync(prevFile)) {
    const prev = JSON.parse(readFileSync(prevFile, 'utf8'))
    if (prev.weekOf === out.weekOf) {
      console.log(`No new EIA data (still week of ${out.weekOf}). U.S. regular $${prices.US}`)
      return
    }
  }
  writeFileSync(OUT + '.tmp', JSON.stringify(out, null, 2) + '\n')
  renameSync(OUT + '.tmp', OUT)
  console.log(`Updated gas prices: week of ${out.weekOf}, U.S. regular $${prices.US}, ${Object.keys(prices).length} areas`)
}

main().catch((e) => { console.error(e.message); process.exit(1) })
