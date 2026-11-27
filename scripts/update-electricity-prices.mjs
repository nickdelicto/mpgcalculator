#!/usr/bin/env node
/**
 * Pulls average RESIDENTIAL electricity prices by state (cents/kWh) from the EIA
 * Electric Power Monthly, Table 5.6.A, and writes data/electricity-prices.live.json
 * (git-ignored; pass --baseline to update the committed data/electricity-prices.json).
 * Used for EV "cost to drive" numbers (gas price alerts). No API key needed.
 *
 * EIA publishes monthly (~4th week, data ~2 months behind). Cron suggestion (monthly):
 *   20 11 28 * *  cd /home/delicto/apps/mpgcalculator && node scripts/update-electricity-prices.mjs
 */
import { writeFileSync, renameSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const SOURCE = 'https://www.eia.gov/electricity/monthly/epm_table_grapher.php?t=epmt_5_6_a'
const DATA = join(dirname(fileURLToPath(import.meta.url)), '..', 'data')
const OUT = join(DATA, process.argv.includes('--baseline') ? 'electricity-prices.json' : 'electricity-prices.live.json')

const STATES = { Alabama: 'AL', Alaska: 'AK', Arizona: 'AZ', Arkansas: 'AR', California: 'CA', Colorado: 'CO', Connecticut: 'CT', Delaware: 'DE', 'District of Columbia': 'DC', Florida: 'FL', Georgia: 'GA', Hawaii: 'HI', Idaho: 'ID', Illinois: 'IL', Indiana: 'IN', Iowa: 'IA', Kansas: 'KS', Kentucky: 'KY', Louisiana: 'LA', Maine: 'ME', Maryland: 'MD', Massachusetts: 'MA', Michigan: 'MI', Minnesota: 'MN', Mississippi: 'MS', Missouri: 'MO', Montana: 'MT', Nebraska: 'NE', Nevada: 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', Ohio: 'OH', Oklahoma: 'OK', Oregon: 'OR', Pennsylvania: 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC', 'South Dakota': 'SD', Tennessee: 'TN', Texas: 'TX', Utah: 'UT', Vermont: 'VT', Virginia: 'VA', Washington: 'WA', 'West Virginia': 'WV', Wisconsin: 'WI', Wyoming: 'WY' }

const res = await fetch(SOURCE, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; electricity-price-updater)' } })
if (!res.ok) { console.error(`EIA fetch failed: HTTP ${res.status}`); process.exit(1) }
const text = (await res.text()).replace(/<[^>]+>/g, '|').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ')
const cells = text.split('|').map((s) => s.trim()).filter(Boolean)

const period = (text.match(/by State, (\w+ \d{4}) and \d{4}/) || [])[1]
if (!period) { console.error('Could not find the data month in the EIA table'); process.exit(1) }

// Row layout: <State> | residential(current) | residential(prior year) | commercial ...
const cents = {}
const prevCents = {} // same month a year earlier
for (const [name, ab] of Object.entries(STATES)) {
  const i = cells.indexOf(name)
  if (i === -1) continue
  const v = Number(cells[i + 1])
  if (Number.isFinite(v) && v > 3 && v < 80) cents[ab] = v
  const pv = Number(cells[i + 2])
  if (Number.isFinite(pv) && pv > 3 && pv < 80) prevCents[ab] = pv
}
const us = Number(cells[cells.indexOf('U.S. Total') + 1])
const usPrev = Number(cells[cells.indexOf('U.S. Total') + 2])
const prevPeriod = (text.match(/by State, \w+ \d{4} and (\d{4})/) || [])[1]
if (Object.keys(cents).length < 45 || !(us > 5 && us < 60)) { console.error(`Implausible data: ${Object.keys(cents).length} states, US ${us}`); process.exit(1) }

const out = { source: 'U.S. Energy Information Administration (EIA), Electric Power Monthly Table 5.6.A, average residential price', sourceUrl: SOURCE, period, centsPerKwh: { US: us, ...cents }, prevPeriod: prevPeriod ? `${period.split(' ')[0]} ${prevPeriod}` : null, prevCentsPerKwh: { US: usPrev, ...prevCents }, updatedAt: new Date().toISOString() }
writeFileSync(OUT + '.tmp', JSON.stringify(out, null, 2) + '\n')
renameSync(OUT + '.tmp', OUT)
console.log(`Electricity prices for ${period}: U.S. ${us}¢/kWh, ${Object.keys(cents).length} states → ${OUT.split('/').pop()}`)
