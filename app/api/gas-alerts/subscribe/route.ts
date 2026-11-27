import { NextRequest, NextResponse } from 'next/server'
import { promises as dns } from 'dns'
import { upsertSubscriber, setWelcomeMessageId } from '../../../lib/gasAlerts'
import { getPriceSnapshot, previousWeekGas } from '../../../lib/energyPrices'
import { buildGasAlertEmail } from '../../../lib/gasAlertEmail'
import { driveCost } from '../../../lib/driveCost'
import { sendEmail } from '../../../utils/email'

/**
 * POST /api/gas-alerts/subscribe — weekly "what gas costs you" email alerts.
 *
 * Spam protection (same layers as the rnjobsremote job-alert signup, minus reCAPTCHA
 * since this site has no keys yet):
 *  - Honeypot field `website` (hidden from humans) → fake success, nothing saved
 *  - Time trap: forms submitted < 2.5 s after render → fake success
 *  - Per-IP rate limit: 5/minute and 20/day (in memory; PM2 runs one process)
 *  - Email checks: format, length, common-typo hint, disposable domains, MX/A lookup
 *  - Strict validation of every other field
 */

const SITE = 'https://mpgcalculator.net'
const hits = new Map<string, number[]>()
function rateLimited(ip: string) {
  const now = Date.now()
  const day = (hits.get(ip) || []).filter((t) => t > now - 86_400_000)
  const minute = day.filter((t) => t > now - 60_000)
  if (minute.length >= 5 || day.length >= 20) return true
  day.push(now)
  hits.set(ip, day)
  if (hits.size > 20_000) for (const [k, v] of hits) if (!v.some((t) => t > now - 86_400_000)) hits.delete(k)
  return false
}

const DISPOSABLE = new Set(['mailinator.com', 'guerrillamail.com', 'guerrillamail.info', 'sharklasers.com', '10minutemail.com', 'tempmail.com', 'temp-mail.org', 'yopmail.com', 'trashmail.com', 'getnada.com', 'dispostable.com', 'maildrop.cc', 'throwawaymail.com', 'fakeinbox.com', 'mailnesia.com', 'mintemail.com', 'emailondeck.com', 'tempail.com', 'mohmal.com', 'burnermail.io'])
const TYPOS: Record<string, string> = { 'gmial.com': 'gmail.com', 'gmai.com': 'gmail.com', 'gmail.co': 'gmail.com', 'gamil.com': 'gmail.com', 'gnail.com': 'gmail.com', 'gmail.con': 'gmail.com', 'yaho.com': 'yahoo.com', 'yahoo.co': 'yahoo.com', 'hotmial.com': 'hotmail.com', 'hotmail.co': 'hotmail.com', 'outlok.com': 'outlook.com', 'iclod.com': 'icloud.com', 'icloud.co': 'icloud.com' }
const STATES = new Set('AL AK AZ AR CA CO CT DE DC FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY'.split(' '))

async function domainReceivesMail(domain: string) {
  const timeout = new Promise<'timeout'>((r) => setTimeout(() => r('timeout'), 3000))
  try {
    const mx = await Promise.race([dns.resolveMx(domain), timeout])
    if (mx === 'timeout') return true // don't block real people on a slow DNS server
    if (mx.length) return true
  } catch {
    // fall through to A record check
  }
  try {
    const a = await Promise.race([dns.resolve4(domain), timeout])
    return a === 'timeout' || a.length > 0
  } catch {
    return false
  }
}

const fakeOk = () => NextResponse.json({ ok: true })
const bad = (message: string, status = 400) => NextResponse.json({ ok: false, message }, { status })

export async function POST(req: NextRequest) {
  const ip = (req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim()
  if (rateLimited(ip)) return bad('Too many sign-up attempts. Please try again in a minute.', 429)

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return bad('Invalid request')
  }

  // Bots: honeypot filled, or submitted faster than a person can fill the form
  if (typeof body.website === 'string' && body.website.trim()) return fakeOk()
  const startedAt = Number(body.startedAt)
  if (!Number.isFinite(startedAt) || Date.now() - startedAt < 2500) return fakeOk()

  const email = String(body.email || '').trim().toLowerCase()
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email)) return bad('Please enter a valid email address.')
  const domain = email.split('@')[1]
  if (TYPOS[domain]) return bad(`Did you mean ${email.split('@')[0]}@${TYPOS[domain]}?`)
  if (DISPOSABLE.has(domain)) return bad('Please use a permanent email address.')
  if (!(await domainReceivesMail(domain))) return bad(`We couldn't find a mail server for ${domain}. Please check the spelling.`)

  const state = String(body.state || '').toUpperCase()
  const fuel = body.fuel === 'ev' ? 'ev' : 'gas'
  const efficiency = Number(body.efficiency)
  const weeklyMiles = Math.round(Number(body.weeklyMiles))
  if (!STATES.has(state)) return bad('Please choose your state.')
  if (fuel === 'gas' && !(efficiency >= 5 && efficiency <= 150)) return bad('MPG should be between 5 and 150.')
  if (fuel === 'ev' && !(efficiency >= 1 && efficiency <= 8)) return bad('Miles per kWh should be between 1 and 8.')
  if (!(weeklyMiles >= 1 && weeklyMiles <= 3000)) return bad('Weekly miles should be between 1 and 3,000.')

  try {
    const { sub } = await upsertSubscriber({
      email, state, fuel, efficiency, weeklyMiles,
      source: typeof body.source === 'string' ? body.source : null,
      country: req.headers.get('cf-ipcountry'),
      referrer: req.headers.get('referer'),
    })

    const snap = getPriceSnapshot()
    const unsubscribeUrl = `${SITE}/api/gas-alerts/unsubscribe?token=${sub.unsubscribe_token}`
    const mail = buildGasAlertEmail({ fuel, efficiency, weeklyMiles, state, unsubscribeUrl, isWelcome: true }, snap, previousWeekGas(state))
    // Welcome email (best effort: the signup still counts if sending fails)
    if (process.env.BREVO_API_KEY) {
      sendEmail({
        to: email, subject: mail.subject, html: mail.html, text: mail.text,
        headers: { 'List-Unsubscribe': `<${unsubscribeUrl}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' },
      })
        .then((r: { messageId?: string }) => setWelcomeMessageId(sub.id, r?.messageId ?? null))
        .catch((e: unknown) => console.error('gas alert welcome email failed:', e instanceof Error ? e.message : e))
    }

    const st = snap.states[state]
    const cost = driveCost({ fuel, efficiency, weeklyMiles }, st.gas, st.elecCents)
    return NextResponse.json({ ok: true, week: cost.week, month: cost.month, stateName: st.name })
  } catch (error) {
    console.error('gas alert signup failed:', error instanceof Error ? error.message : error)
    return bad('Something went wrong on our side. Please try again.', 500)
  }
}
