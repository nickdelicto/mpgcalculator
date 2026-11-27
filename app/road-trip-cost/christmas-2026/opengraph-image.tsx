import { ImageResponse } from 'next/og'
import { XMAS, xmasStats } from './data'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'Christmas 2026 gas prices vs last Christmas'
export const revalidate = 86400

export default function Image() {
  const s = xmasStats()
  const up = s.yoyPct >= 0
  const box = (label: string, value: string) => (
    <div style={{ display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,0.14)', borderRadius: 20, padding: '20px 28px', marginRight: 22 }}>
      <div style={{ fontSize: 26, color: '#fecaca' }}>{label}</div>
      <div style={{ fontSize: 58, fontWeight: 700, color: '#fff' }}>{value}</div>
    </div>
  )
  return new ImageResponse(
    (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '100%', height: '100%', padding: 64, background: 'linear-gradient(135deg, #991b1b 0%, #14532d 100%)', fontFamily: 'sans-serif' }}>
        <div style={{ display: 'flex', fontSize: 30, color: '#fecaca' }}>{XMAS.title} · MPGCalculator.net</div>
        <div style={{ display: 'flex', fontSize: 68, fontWeight: 800, color: '#fff', lineHeight: 1.1 }}>
          Gas is {Math.abs(s.yoyPct).toFixed(0)}% {up ? 'higher' : 'lower'} than last Christmas
        </div>
        <div style={{ display: 'flex' }}>
          {box(`Christmas ${s.last.year}`, `$${s.last.price.toFixed(2)}`)}
          {box(s.locked ? `Christmas ${XMAS.year}` : 'This week', `$${s.current.price.toFixed(2)}`)}
        </div>
        <div style={{ display: 'flex', fontSize: 24, color: '#dcfce7' }}>U.S. average regular gasoline · Source: EIA</div>
      </div>
    ),
    size,
  )
}
