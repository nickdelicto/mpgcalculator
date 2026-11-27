import { driveCost, money, type FuelKind } from './driveCost'
import type { PriceSnapshot } from './energyPrices'

const SITE = 'https://mpgcalculator.net'
const EV_DEFAULT = 3.5
const GAS_DEFAULT = 28

export interface AlertEmailInput {
  fuel: FuelKind
  efficiency: number
  weeklyMiles: number
  state: string
  unsubscribeUrl: string
  isWelcome?: boolean
}

const fmtDate = (iso: string) => new Date(iso + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'long', day: 'numeric', timeZone: 'UTC' })

export function buildGasAlertEmail(input: AlertEmailInput, snap: PriceSnapshot, prevGas: number | null) {
  const st = snap.states[input.state]
  const profile = { fuel: input.fuel, efficiency: input.efficiency, weeklyMiles: input.weeklyMiles }
  const you = driveCost(profile, st.gas, st.elecCents)
  // The "other" option for comparison: gas drivers see an EV at home charging, EV drivers see a typical gas car
  const other = input.fuel === 'gas'
    ? { label: 'An EV charged at home', ...driveCost({ fuel: 'ev', efficiency: EV_DEFAULT, weeklyMiles: input.weeklyMiles }, st.gas, st.elecCents) }
    : { label: `A ${GAS_DEFAULT}-MPG gas car`, ...driveCost({ fuel: 'gas', efficiency: GAS_DEFAULT, weeklyMiles: input.weeklyMiles }, st.gas, st.elecCents) }
  const change = prevGas ? st.gas - prevGas : null
  const changeTxt = change === null || Math.abs(change) < 0.005 ? 'about the same as last week' : `${change < 0 ? 'down' : 'up'} ${Math.abs(change * 100).toFixed(0)}¢ from last week`
  const headline = input.fuel === 'gas'
    ? `${st.name} gas this week: $${st.gas.toFixed(2)} (${changeTxt})`
    : `${st.name} electricity: ${st.elecCents.toFixed(1)}¢/kWh, your EV costs ${money(you.week)} this week`
  const subject = input.fuel === 'gas'
    ? `${st.name} gas is $${st.gas.toFixed(2)}, your driving costs ${money(you.week)} this week`
    : headline
  const unit = input.fuel === 'gas' ? `${input.efficiency} MPG` : `${input.efficiency} mi/kWh`
  const priceLine = input.fuel === 'gas'
    ? `Regular gas: <strong>$${st.gas.toFixed(2)}/gal</strong> (${st.gasBasis}, EIA week of ${fmtDate(snap.gasWeekOf)}), ${changeTxt}.`
    : `Home electricity: <strong>${st.elecCents.toFixed(1)}¢/kWh</strong> (${st.elecBasis}, EIA ${snap.elecPeriod}). Public fast charging usually costs 2–3× more.`
  const saving = input.fuel === 'gas' ? you.year - other.year : other.year - you.year

  const html = `<!doctype html><html><body style="margin:0;background:#eef4ff;font-family:Arial,Helvetica,sans-serif;color:#111827">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef4ff;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:14px;overflow:hidden">
  <tr><td style="background:#0b6b3a;padding:16px 24px;color:#fff;font-size:15px;font-weight:bold">MPGCalculator.net · Weekly driving cost</td></tr>
  <tr><td style="padding:24px">
    ${input.isWelcome ? `<p style="margin:0 0 14px;font-size:15px;color:#374151">You're in! Every week we'll email you what driving costs you, based on the latest U.S. government (EIA) prices for ${st.name}. Here's this week:</p>` : ''}
    <div style="font-size:14px;color:#6b7280;text-transform:uppercase;letter-spacing:.04em">Your driving this week</div>
    <div style="font-size:40px;font-weight:bold;color:#1d4ed8;margin:4px 0">${money(you.week)}</div>
    <div style="font-size:15px;color:#374151">${input.weeklyMiles} miles · ${unit} · about <strong>${money(you.month)}/month</strong>, <strong>${money(you.year)}/year</strong></div>
    <p style="font-size:15px;color:#374151;margin:18px 0 0">${priceLine}</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:18px 0;background:#f0f7ff;border-radius:10px"><tr><td style="padding:14px 16px;font-size:15px;color:#1f2937">
      <strong>${other.label}</strong> would cost about <strong>${money(other.week)}</strong> for the same ${input.weeklyMiles} miles
      ${saving > 1 ? `, ${input.fuel === 'gas' ? 'that’s' : 'so you save'} about <strong>${money(Math.abs(saving))} a year</strong>${input.fuel === 'gas' ? ' less' : ''}.` : '.'}
      <br><a href="${SITE}/fuel-savings-calculator?utm_source=gas-alert&utm_medium=email" style="color:#1d4ed8">Compare your exact cars →</a>
    </td></tr></table>
    <p style="font-size:15px;color:#374151;margin:0 0 6px">Planning a trip? See gas cost, stops and hotels for 159 popular drives:</p>
    <a href="${SITE}/road-trip-cost?utm_source=gas-alert&utm_medium=email" style="display:inline-block;background:#1d4ed8;color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px;font-weight:bold">Road trip gas costs →</a>
  </td></tr>
  <tr><td style="padding:20px 24px;background:#f9fafb;border-top:1px solid #e5e7eb;text-align:center">
    <p style="margin:0 0 10px;font-size:14px;color:#6b7280">
      <a href="${SITE}/gas-price-alerts?utm_source=gas-alert&utm_medium=email" style="color:#0b6b3a;text-decoration:none;font-weight:bold">Update my car or state</a>
      &nbsp;&middot;&nbsp;
      <a href="${input.unsubscribeUrl}" style="color:#6b7280;text-decoration:none">Unsubscribe</a>
    </p>
    <p style="margin:0 0 6px;font-size:12px;color:#6b7280">MPGCalculator.net &middot; Free fuel cost tools for drivers</p>
    <p style="margin:0;font-size:11px;color:#9ca3af">You signed up for weekly gas price alerts. Prices from the U.S. Energy Information Administration.${process.env.MAIL_POSTAL_ADDRESS ? `<br>${process.env.MAIL_POSTAL_ADDRESS}` : ''}</p>
  </td></tr>
</table></td></tr></table></body></html>`

  const text = `${headline}\n\nYour driving this week: ${money(you.week)} (${input.weeklyMiles} mi, ${unit}), about ${money(you.month)}/month.\n${other.label}: ${money(other.week)}/week.\n\nRoad trip gas costs: ${SITE}/road-trip-cost\nUnsubscribe: ${input.unsubscribeUrl}`
  return { subject, html, text }
}
