'use client'

import { useMemo, useState } from 'react'
import type { PriceSnapshot } from '../lib/energyPrices'

// Cost to charge an EV: per full charge, per mile and per month, vs a gas car, using
// the state's EIA home electricity price (or the user's own public charging price).
export default function EvChargeCalculator({ snapshot, defaultState = 'TX' }: { snapshot: PriceSnapshot; defaultState?: string }) {
  const states = useMemo(() => Object.entries(snapshot.states).sort((a, b) => a[1].name.localeCompare(b[1].name)), [snapshot])
  const [state, setState] = useState(snapshot.states[defaultState] ? defaultState : 'TX')
  const [where, setWhere] = useState<'home' | 'public'>('home')
  const [publicPrice, setPublicPrice] = useState('0.45')
  const [battery, setBattery] = useState('75')
  const [eff, setEff] = useState('3.5')
  const [miles, setMiles] = useState('1000')
  const [mpg, setMpg] = useState('28')

  const st = snapshot.states[state]
  const perKwh = where === 'home' ? st.elecCents / 100 : Number(publicPrice)
  const b = Number(battery), e = Number(eff), m = Number(miles), g = Number(mpg)
  const ok = perKwh > 0 && b > 0 && e > 0 && m >= 0 && g > 0
  const fullCharge = b * perKwh
  const perMile = perKwh / e
  const monthly = perMile * m
  const gasMonthly = (m / g) * st.gas
  const money = (n: number) => (n >= 100 ? `$${Math.round(n).toLocaleString('en-US')}` : `$${n.toFixed(2)}`)
  const input = 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100'
  const label = 'block text-sm font-medium text-gray-700 mb-1'

  return (
    <div className="rounded-xl border border-blue-200 bg-white p-5 shadow-sm">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="block"><span className={label}>State</span>
          <select value={state} onChange={(ev) => setState(ev.target.value)} className={input}>
            {states.map(([ab, s]) => <option key={ab} value={ab}>{s.name}</option>)}
          </select>
        </label>
        <div>
          <span className={label}>Where you charge</span>
          <div className="inline-flex rounded-lg border border-gray-300 p-0.5" role="radiogroup" aria-label="Charging location">
            {(['home', 'public'] as const).map((w) => (
              <button key={w} type="button" role="radio" aria-checked={where === w} onClick={() => setWhere(w)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium ${where === w ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}>
                {w === 'home' ? 'At home' : 'Public fast charger'}
              </button>
            ))}
          </div>
        </div>
        {where === 'public' && (
          <label className="block"><span className={label}>Public charging price ($ per kWh)</span>
            <input type="number" inputMode="decimal" step="0.01" min="0.05" max="2" value={publicPrice} onChange={(ev) => setPublicPrice(ev.target.value)} className={input} />
            <span className="text-xs text-gray-500">Check the price in your charging app. It varies by network and location.</span>
          </label>
        )}
        <label className="block"><span className={label}>Battery size (kWh)</span>
          <input type="number" inputMode="decimal" min="10" max="250" value={battery} onChange={(ev) => setBattery(ev.target.value)} className={input} />
        </label>
        <label className="block"><span className={label}>Efficiency (miles per kWh)</span>
          <input type="number" inputMode="decimal" step="0.1" min="1" max="8" value={eff} onChange={(ev) => setEff(ev.target.value)} className={input} />
        </label>
        <label className="block"><span className={label}>Miles per month</span>
          <input type="number" inputMode="numeric" min="0" max="10000" value={miles} onChange={(ev) => setMiles(ev.target.value)} className={input} />
        </label>
        <label className="block"><span className={label}>Compare with a gas car (MPG)</span>
          <input type="number" inputMode="decimal" min="5" max="150" value={mpg} onChange={(ev) => setMpg(ev.target.value)} className={input} />
        </label>
      </div>

      <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3" aria-live="polite">
        {ok ? [
          ['Full charge (0 to 100%)', money(fullCharge)],
          ['Cost per mile', `${(perMile * 100).toFixed(1)}¢`],
          ['Per month', money(monthly)],
          ['Gas car per month', money(gasMonthly)],
        ].map(([k, v]) => (
          <div key={k} className="rounded-lg bg-blue-50 p-3">
            <div className="text-xs uppercase tracking-wide text-gray-500">{k}</div>
            <div className="text-2xl font-bold text-blue-800">{v}</div>
          </div>
        )) : <p className="text-gray-600 col-span-full">Enter positive numbers to see your charging cost.</p>}
      </div>
      {ok && (
        <p className="mt-3 text-gray-800">
          {monthly < gasMonthly
            ? <>Charging {where === 'home' ? 'at home' : 'in public'} in {st.name} saves about <strong>{money(gasMonthly - monthly)} a month</strong> ({money((gasMonthly - monthly) * 12)} a year) compared with a {g} MPG gas car.</>
            : <>At these prices, a {g} MPG gas car costs about the same or less to fuel than charging {where === 'home' ? 'at home' : 'in public'} in {st.name}.</>}
          <span className="block text-xs text-gray-500 mt-1">
            {where === 'home' ? `Home electricity ${st.elecCents.toFixed(1)}¢/kWh (${st.elecBasis}, EIA ${snapshot.elecPeriod}). ` : ''}
            Regular gas ${st.gas.toFixed(2)}/gal ({st.gasBasis}). Charging losses and time-of-use rates are not included.
          </span>
        </p>
      )}
    </div>
  )
}
