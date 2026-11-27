'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { driveCost, money, DEFAULTS, type FuelKind } from '../lib/driveCost'
import type { PriceSnapshot } from '../lib/energyPrices'

interface Props {
  snapshot: PriceSnapshot
  defaultState?: string
  /** Where the form is shown (stored with the signup), e.g. "route-page" */
  source: string
  /** Optional heading override, e.g. for a route page */
  heading?: string
}

declare global {
  interface Window { gtag?: (...args: unknown[]) => void }
}

export default function GasAlertSignup({ snapshot, defaultState = 'TX', source, heading }: Props) {
  const states = useMemo(() => Object.entries(snapshot.states).sort((a, b) => a[1].name.localeCompare(b[1].name)), [snapshot])
  const [fuel, setFuel] = useState<FuelKind>('gas')
  const [state, setState] = useState(snapshot.states[defaultState] ? defaultState : 'TX')
  const [eff, setEff] = useState<string>(String(DEFAULTS.gasMpg))
  const [miles, setMiles] = useState<string>(String(DEFAULTS.weeklyMiles))
  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('') // honeypot
  const [status, setStatus] = useState<'idle' | 'sending' | 'done'>('idle')
  const [error, setError] = useState<string | null>(null)
  const startedAt = useRef(Date.now())
  useEffect(() => { startedAt.current = Date.now() }, [])

  const st = snapshot.states[state]
  const effNum = Number(eff), milesNum = Number(miles)
  const valid = effNum > 0 && milesNum > 0
  const cost = valid ? driveCost({ fuel, efficiency: effNum, weeklyMiles: milesNum }, st.gas, st.elecCents) : null

  function switchFuel(f: FuelKind) {
    setFuel(f)
    setEff(String(f === 'gas' ? DEFAULTS.gasMpg : DEFAULTS.evMiPerKwh))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setStatus('sending')
    try {
      const res = await fetch('/api/gas-alerts/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, state, fuel, efficiency: effNum, weeklyMiles: milesNum, source, website, startedAt: startedAt.current }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.ok) throw new Error(data.message || 'Something went wrong. Please try again.')
      setStatus('done')
      window.gtag?.('event', 'generate_lead', { lead_type: 'gas_alert', fuel, state, source })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setStatus('idle')
    }
  }

  if (status === 'done') {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-5" role="status">
        <div className="font-heading font-bold text-lg text-green-900">You&apos;re in! ✅</div>
        <p className="text-green-900 mt-1">
          Your first update is on its way to <strong>{email}</strong>. Every week you&apos;ll get what driving costs you in {st.name}
          {cost ? <> — right now about <strong>{money(cost.week)}</strong> a week</> : null}.
        </p>
        <p className="text-sm text-green-800 mt-2">Not in your inbox? Check Promotions or Spam and mark it &quot;Not spam&quot;.</p>
      </div>
    )
  }

  const inputCls = 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100'
  return (
    <form onSubmit={submit} className="rounded-xl border border-blue-200 bg-white p-5 shadow-sm" aria-label="Weekly gas price alert sign-up">
      <div className="font-heading font-bold text-xl text-gray-900">{heading || 'What will gas cost you this week?'}</div>
      <p className="text-gray-600 mt-1 mb-4">Free weekly email with <strong>your</strong> driving cost, from government (EIA) prices for your state.</p>

      <div className="inline-flex rounded-lg border border-gray-300 p-0.5 mb-4" role="radiogroup" aria-label="Fuel type">
        {(['gas', 'ev'] as const).map((f) => (
          <button key={f} type="button" role="radio" aria-checked={fuel === f} onClick={() => switchFuel(f)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium ${fuel === f ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}>
            {f === 'gas' ? '⛽ Gas car' : '🔌 Electric'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <label className="block">
          <span className="block text-sm font-medium text-gray-700 mb-1">State</span>
          <select value={state} onChange={(e) => setState(e.target.value)} className={inputCls}>
            {states.map(([ab, s]) => <option key={ab} value={ab}>{s.name}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="block text-sm font-medium text-gray-700 mb-1">{fuel === 'gas' ? 'Your car’s MPG' : 'Miles per kWh'}</span>
          <input type="number" inputMode="decimal" min={fuel === 'gas' ? 5 : 1} max={fuel === 'gas' ? 150 : 8} step="0.1" value={eff} onChange={(e) => setEff(e.target.value)} className={inputCls} required />
        </label>
        <label className="block">
          <span className="block text-sm font-medium text-gray-700 mb-1">Miles per week</span>
          <input type="number" inputMode="numeric" min={1} max={3000} value={miles} onChange={(e) => setMiles(e.target.value)} className={inputCls} required />
        </label>
      </div>

      <div className="mt-4 rounded-lg bg-blue-50 px-4 py-3 text-gray-800" aria-live="polite">
        {cost ? (
          <>This week in {st.name}: <strong className="text-blue-800 text-lg">{money(cost.week)}</strong> · about {money(cost.month)}/month
            <span className="block text-xs text-gray-500 mt-0.5">
              {fuel === 'gas' ? `Regular gas $${st.gas.toFixed(2)}/gal (${st.gasBasis})` : `Home electricity ${st.elecCents.toFixed(1)}¢/kWh (${st.elecBasis})`}
            </span>
          </>
        ) : 'Enter your car’s efficiency and weekly miles to see your cost.'}
      </div>

      <div className="mt-4 flex flex-col sm:flex-row gap-3">
        <label className="sr-only" htmlFor={`gas-alert-email-${source}`}>Email</label>
        <input id={`gas-alert-email-${source}`} type="email" autoComplete="email" required placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className={`${inputCls} sm:flex-1`} />
        <button type="submit" disabled={status === 'sending'} className="rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
          {status === 'sending' ? 'Signing you up…' : 'Email me every week'}
        </button>
      </div>
      {/* Honeypot: hidden from people, bots fill it in */}
      <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px', width: 1, height: 1, overflow: 'hidden' }}>
        <label>Website<input type="text" name="website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} /></label>
      </div>
      {error && <p className="mt-2 text-sm text-red-700" role="alert">{error}</p>}
      <p className="mt-2 text-xs text-gray-500">Free · one email a week · unsubscribe in one click. We never sell your email.</p>
    </form>
  )
}
