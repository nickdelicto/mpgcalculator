import GasAlertSignup from './GasAlertSignup'
import { getPriceSnapshot } from '../lib/energyPrices'

// Server wrapper: loads this week's prices and renders the client sign-up form.
export default function GasAlertBox(props: { defaultState?: string; source: string; heading?: string }) {
  return <GasAlertSignup snapshot={getPriceSnapshot()} {...props} />
}
