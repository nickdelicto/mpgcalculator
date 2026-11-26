import { ImageResponse } from 'next/og'
import { getRoute, getGasPrices, routeCost, DEFAULT_VEHICLE, usd, miles, hm, prettyDate } from '../lib'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'Road trip gas cost'
export const revalidate = 86400

// Social / AI preview card built from the route's own numbers
export default async function Image({ params }: { params: { route: string } }) {
  const { route: slug } = await Promise.resolve(params)
  const r = getRoute(slug)
  const gas = getGasPrices()
  if (!r) {
    return new ImageResponse(<div style={{ display: 'flex', width: '100%', height: '100%', background: '#1e3a8a' }} />, size)
  }
  const mid = routeCost(r, gas).vehicles.find((v) => v.key === DEFAULT_VEHICLE.key)!
  const stat = (label: string, value: string) => (
    <div style={{ display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,0.12)', borderRadius: 20, padding: '22px 30px', marginRight: 24 }}>
      <div style={{ fontSize: 26, color: '#bfdbfe' }}>{label}</div>
      <div style={{ fontSize: 56, fontWeight: 700, color: '#fff' }}>{value}</div>
    </div>
  )
  return new ImageResponse(
    (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '100%', height: '100%', padding: 64, background: 'linear-gradient(135deg, #1d4ed8 0%, #4338ca 100%)', fontFamily: 'sans-serif' }}>
        <div style={{ display: 'flex', fontSize: 30, color: '#bfdbfe' }}>Road trip gas cost · MPGCalculator.net</div>
        <div style={{ display: 'flex', fontSize: 76, fontWeight: 800, color: '#fff', lineHeight: 1.1 }}>
          {r.from.name} → {r.to.name}
        </div>
        <div style={{ display: 'flex' }}>
          {stat('Distance', miles(r.distanceMi))}
          {stat('Drive time', hm(r.durationH))}
          {stat('Gas, one way*', usd(mid.oneWay))}
        </div>
        <div style={{ display: 'flex', fontSize: 24, color: '#c7d2fe' }}>
          *Midsize car ({DEFAULT_VEHICLE.mpg} MPG), EIA regular gas prices, week of {prettyDate(gas.weekOf)}
        </div>
      </div>
    ),
    size,
  )
}
