import { ImageResponse } from 'next/og'
import { REPORT, reportStats } from './data'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'Thanksgiving 2026 gas prices vs 2025'

export default function Image() {
  const s = reportStats()
  const up = s.yoyPct >= 0
  const box = (label: string, value: string) => (
    <div style={{ display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,0.12)', borderRadius: 20, padding: '20px 28px', marginRight: 22 }}>
      <div style={{ fontSize: 26, color: '#fde68a' }}>{label}</div>
      <div style={{ fontSize: 58, fontWeight: 700, color: '#fff' }}>{value}</div>
    </div>
  )
  return new ImageResponse(
    (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '100%', height: '100%', padding: 64, background: 'linear-gradient(135deg, #92400e 0%, #1e3a8a 100%)', fontFamily: 'sans-serif' }}>
        <div style={{ display: 'flex', fontSize: 30, color: '#fde68a' }}>{REPORT.title} · MPGCalculator.net</div>
        <div style={{ display: 'flex', fontSize: 70, fontWeight: 800, color: '#fff', lineHeight: 1.1 }}>
          Thanksgiving gas is {up ? 'up' : 'down'} {Math.abs(s.yoyPct).toFixed(0)}% from last year
        </div>
        <div style={{ display: 'flex' }}>
          {box(`${s.last.year}`, `$${s.last.price.toFixed(2)}`)}
          {box(`${s.now.year}`, `$${s.now.price.toFixed(2)}`)}
          {box(`Rank since ${s.tg[0].year}`, `#${s.rank} of ${s.years}`)}
        </div>
        <div style={{ display: 'flex', fontSize: 24, color: '#e0e7ff' }}>U.S. average regular gasoline, Thanksgiving week · Source: EIA</div>
      </div>
    ),
    size,
  )
}
