import GasAlertSignup from './GasAlertSignup'
import { getPriceSnapshot } from '../lib/energyPrices'

// Server wrapper: loads this week's prices and renders the client sign-up form.
// Shown only when GAS_ALERTS_SIGNUP=1 (set in .env.local once the
// gas_alert_subscribers table exists), so the form never appears without a place to save emails.
export default function GasAlertBox(props: { defaultState?: string; source: string; heading?: string }) {
  if (process.env.GAS_ALERTS_SIGNUP !== '1') return null
  return <GasAlertSignup snapshot={getPriceSnapshot()} {...props} />
}
