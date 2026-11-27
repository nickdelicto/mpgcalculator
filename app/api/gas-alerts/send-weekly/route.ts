import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'
import { getPriceSnapshot, previousWeekGas } from '../../../lib/energyPrices'
import { buildGasAlertEmail } from '../../../lib/gasAlertEmail'
import { sendEmail } from '../../../utils/email'

/**
 * POST /api/gas-alerts/send-weekly  (called by cron on the VPS after the weekly EIA update)
 *   curl -s -X POST -H "Authorization: Bearer $GAS_ALERTS_CRON_SECRET" http://127.0.0.1:3001/api/gas-alerts/send-weekly
 *
 * Locked until ALL of these are set in .env.local:
 *   GAS_ALERTS_CRON_SECRET   shared secret for the cron call
 *   GAS_ALERTS_SEND_ENABLED=1
 *   MAIL_POSTAL_ADDRESS      required in commercial email footers (CAN-SPAM)
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

export async function POST(req: NextRequest) {
  const secret = process.env.GAS_ALERTS_CRON_SECRET
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const missing = [
    !process.env.BREVO_API_KEY && 'BREVO_API_KEY',
    process.env.GAS_ALERTS_SEND_ENABLED !== '1' && 'GAS_ALERTS_SEND_ENABLED=1',
    !process.env.MAIL_POSTAL_ADDRESS && 'MAIL_POSTAL_ADDRESS',
  ].filter(Boolean)
  if (missing.length) return NextResponse.json({ sent: 0, locked: true, missing })

  const max = Math.min(5000, parseInt(process.env.GAS_ALERTS_MAX_PER_RUN || '250'))
  const { rows } = await pool.query(
    `SELECT id, email, state, fuel, efficiency::float AS efficiency, weekly_miles, unsubscribe_token
       FROM gas_alert_subscribers
      WHERE status = 'active' AND (last_sent_at IS NULL OR last_sent_at < NOW() - INTERVAL '6 days')
      ORDER BY last_sent_at NULLS FIRST, id LIMIT $1`, [max])
  const snap = getPriceSnapshot()
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
  console.log(`weekly gas alerts: sent ${sent}, failed ${failed}, week of ${snap.gasWeekOf}`)
  return NextResponse.json({ sent, failed, weekOf: snap.gasWeekOf, remaining: rows.length === max ? 'maybe' : 0 })
}
