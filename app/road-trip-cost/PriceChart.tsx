// Server-rendered SVG line chart of weekly gas prices (no chart library needed)
export default function PriceChart({ series, marks }: { series: [string, number][]; marks: { date: string; label: string }[] }) {
  const W = 760, H = 270, P = { l: 44, r: 12, t: 30, b: 28 }
  const ys = series.map((s) => s[1])
  const min = Math.floor(Math.min(...ys) * 4) / 4, max = Math.ceil(Math.max(...ys) * 4) / 4
  const x = (i: number) => P.l + (i / (series.length - 1)) * (W - P.l - P.r)
  const y = (v: number) => P.t + ((max - v) / (max - min)) * (H - P.t - P.b)
  const path = series.map((s, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(s[1]).toFixed(1)}`).join(' ')
  const ticks: number[] = []
  for (let v = min; v <= max + 1e-9; v += 0.5) ticks.push(v)
  const years = series.map((s, i) => ({ i, d: s[0] })).filter((s, k, a) => k === 0 || s.d.slice(0, 4) !== a[k - 1].d.slice(0, 4))
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Weekly U.S. regular gasoline price">
      {ticks.map((v) => (
        <g key={v}>
          <line x1={P.l} x2={W - P.r} y1={y(v)} y2={y(v)} stroke="#e5e7eb" />
          <text x={P.l - 6} y={y(v) + 4} fontSize="11" textAnchor="end" fill="#6b7280">${v.toFixed(2)}</text>
        </g>
      ))}
      {years.map((yr) => (
        <text key={yr.d} x={x(yr.i)} y={H - 8} fontSize="11" fill="#6b7280">{yr.d.slice(0, 4)}</text>
      ))}
      <path d={path} fill="none" stroke="#2563eb" strokeWidth="2.5" />
      {marks.map((m) => {
        const i = series.findIndex((s) => s[0] === m.date)
        if (i < 0) return null
        return (
          <g key={m.date}>
            <circle cx={x(i)} cy={y(series[i][1])} r="5" fill="#f59e0b" stroke="#fff" strokeWidth="2" />
            <text x={x(i) > W - 90 ? x(i) - 8 : x(i)} y={y(series[i][1]) - 10} fontSize="11" textAnchor={x(i) > W - 90 ? 'end' : 'middle'} fill="#92400e" fontWeight="600">{m.label}</text>
          </g>
        )
      })}
    </svg>
  )
}
