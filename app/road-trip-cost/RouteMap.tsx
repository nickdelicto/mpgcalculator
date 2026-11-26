'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface Pin { name: string; lat: number; lng: number; kind: 'start' | 'stop' | 'end' }

export default function RouteMap({ path, pins }: { path: [number, number][]; pins: Pin[] }) {
  const el = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!el.current) return
    const map = L.map(el.current, { scrollWheelZoom: false, attributionControl: true })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map)

    const line = L.polyline(path.map(([lng, lat]) => [lat, lng] as [number, number]), { color: '#2563eb', weight: 5, opacity: 0.85 }).addTo(map)
    const colors = { start: '#16a34a', stop: '#f59e0b', end: '#dc2626' }
    for (const p of pins) {
      L.circleMarker([p.lat, p.lng], { radius: p.kind === 'stop' ? 7 : 9, color: '#fff', weight: 2, fillColor: colors[p.kind], fillOpacity: 1 })
        .bindTooltip(p.name, { direction: 'top', offset: [0, -8] })
        .addTo(map)
    }
    map.fitBounds(line.getBounds(), { padding: [24, 24] })
    return () => { map.remove() }
  }, [path, pins])

  return <div ref={el} className="h-72 md:h-96 w-full rounded-xl overflow-hidden border border-blue-100 z-0" role="img" aria-label="Map of the driving route" />
}
