import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'
import { getPriceSnapshot, previousWeekGas } from '../../../lib/energyPrices'
import { buildGasAlertEmail } from '../../../lib/gasAlertEmail'
import { sendEmail } from '../../../utils/email'

/**
 * POST /api/gas-alerts/send-weekly[?dryRun=1]  (called by scripts/send-gas-alerts.sh from cron, after the weekly EIA update)
 *   curl -s -X POST -H "Authorization: Bearer $GAS_ALERTS_CRON_SECRET" http://127.0.0.1:3001/api/gas-alerts/send-weekly
 *
 * Locked until ALL of these are set in .env.local:
 *   GAS_ALERTS_CRON_SECRET   shared secret for the cron call
 *   GAS_ALERTS_SEND_ENABLED=1
 *   (MAIL_POSTAL_ADDRESS is shown in the footer when set; required once emails carry offers)
 * Optional: GAS_ALERTS_MAX_PER_RUN (default 250, keeps us inside Brevo's free daily limit;
 * the rest go out on the next run because only subscribers not emailed in 6 days are picked).
 */
export const dynamic = 'force-dynamic'
const SITE = 'https://mpgcalculator.net'
const pool = new Pool({
  user: process.env.DB_USER, host: process.env.DB_HOST, database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD, port: parseInt(process.env.DB_PORT || '5432'), max: 2,
})
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

/**
 * List hygiene (same approach as rnjobsremote's alertListHygiene): Brevo keeps an account-wide
 * blocklist of addresses that unsubscribed (incl. Gmail's one-click button), hard-bounced or
 * reported spam. Brevo silently drops sends to them, and repeatedly mailing them hurts sender
 * reputation for every site on this Brevo account, so we switch them off before each run.
 * Only changes status; nothing is deleted, so a person who signs up again is reactivated.
 */
async function pruneBrevoBlocked(dryRun: boolean) {
  const key = process.env.BREVO_API_KEY!
  const blocked = new Map<string, string>()
  for (let offset = 0; offset < 50_000; offset += 100) {
    const res = await fetch(`https://api.brevo.com/v3/smtp/blockedContacts?limit=100&offset=${offset}`, { headers: { 'api-key': key, accept: 'application/json' } })
    if (!res.ok) throw new Error(`Brevo blockedContacts HTTP ${res.status}`)
    const list = ((await res.json()).contacts || []) as { email?: string; reason?: { code?: string } }[]
    for (const c of list) if (c.email) blocked.set(c.email.toLowerCase().trim(), c.reason?.code || 'blocked')
    if (list.length < 100) break
  }
  if (!blocked.size) return 0
  const { rows } = await pool.query(`SELECT id, email FROM gas_alert_subscribers WHERE status = 'active' AND email = ANY($1)`, [[...blocked.keys()]])
  if (!dryRun) {
    for (const r of rows) {
      const reason = blocked.get(r.email) || 'blocked'
      const status = /unsub/i.test(reason) ? 'unsubscribed' : 'bounced'
      await pool.query(`UPDATE gas_alert_subscribers SET status = $2, updated_at = NOW(), unsubscribed_at = COALESCE(unsubscribed_at, NOW()) WHERE id = $1`, [r.id, status])
    }
  }
  return rows.length
}

export async function POST(req: NextRequest) {
  const secret = process.env.GAS_ALERTS_CRON_SECRET
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const missing = [
    !process.env.BREVO_API_KEY && 'BREVO_API_KEY',
    process.env.GAS_ALERTS_SEND_ENABLED !== '1' && 'GAS_ALERTS_SEND_ENABLED=1',
    // The weekly email is informational (prices + links to our own pages). If sponsored offers are
    // ever added, it becomes commercial email and must also require MAIL_POSTAL_ADDRESS (CAN-SPAM).
  ].filter(Boolean)
  if (missing.length) return NextResponse.json({ sent: 0, locked: true, missing })

  const dryRun = req.nextUrl.searchParams.get('dryRun') === '1'
  let pruned = 0
  try {
    pruned = await pruneBrevoBlocked(dryRun)
  } catch (e) {
    console.error('gas alerts: Brevo blocklist check failed, sending anyway:', e instanceof Error ? e.message : e)
  }
  const max = Math.min(5000, parseInt(process.env.GAS_ALERTS_MAX_PER_RUN || '250'))
  const { rows } = await pool.query(
    `SELECT id, email, state, fuel, efficiency::float AS efficiency, weekly_miles, unsubscribe_token
       FROM gas_alert_subscribers
      WHERE status = 'active' AND (last_sent_at IS NULL OR last_sent_at < NOW() - INTERVAL '6 days')
      ORDER BY last_sent_at NULLS FIRST, id LIMIT $1`, [max])
  const snap = getPriceSnapshot()
  if (dryRun) return NextResponse.json({ dryRun: true, wouldSend: rows.length, wouldPrune: pruned, weekOf: snap.gasWeekOf })
  let sent = 0, failed = 0
  for (const s of rows) {
    const unsubscribeUrl = `${SITE}/api/gas-alerts/unsubscribe?token=${s.unsubscribe_token}`
    const mail = buildGasAlertEmail({ fuel: s.fuel, efficiency: s.efficiency, weeklyMiles: s.weekly_miles, state: s.state, unsubscribeUrl }, snap, previousWeekGas(s.state))
    try {
      await sendEmail({ to: s.email, subject: mail.subject, html: mail.html, text: mail.text, headers: { 'List-Unsubscribe': `<${unsubscribeUrl}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' } })
      await pool.query('UPDATE gas_alert_subscribers SET last_sent_at = NOW() WHERE id = $1', [s.id])
      sent++
    } catch (e) {
      failed++
      console.error('weekly gas alert failed for', s.id, e instanceof Error ? e.message : e)
    }
    await sleep(150) // stay well under Brevo's API rate limit
  }
  console.log(`weekly gas alerts: sent ${sent}, failed ${failed}, pruned ${pruned}, week of ${snap.gasWeekOf}`)
  return NextResponse.json({ sent, failed, pruned, weekOf: snap.gasWeekOf, remaining: rows.length === max ? 'maybe' : 0 })
}
