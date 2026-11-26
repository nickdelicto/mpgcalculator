import { NextResponse } from 'next/server'

/**
 * Resolve a place to a location the Stay22 hotel map actually accepts.
 *
 * Why: the Stay22 map embed (`/embed/gm`) returns a 404 "We fell asleep for a
 * second there..." page for many arbitrary lat/lng pairs (e.g. the geocoded
 * centre of Nashville, Gatlinburg or Myrtle Beach) and for tiny towns, while
 * `address=City, ST` for a real town works. So we try candidates in order and
 * return the first one Stay22 can render:
 *   1. `name` as an address (destination text the user typed, e.g. "Nashville, TN")
 *   2. the first point as lat/lng
 *   3. nearest towns (reverse-geocoded from each point, in order) as addresses
 *
 * Query: ?name=<text>&pts=lat,lng;lat,lng;...   (first point = preferred spot;
 * later points = nearby points along the route, used to find a bigger town).
 * Also returns a clean town name, used to label overnight stops.
 */

const ORS_API_KEY = process.env.ORS_API_KEY || ''
const PELIAS_URL = 'https://api.heigit.org/pelias/v1'
const STAY22_CHECK_URL = 'https://www.stay22.com/embed/gm?aid=curiousgens'
const MAX_POINTS = 9
const MAX_STAY22_CHECKS = 6
const CACHE_TTL_MS = 1000 * 60 * 60 * 24 // 1 day

// Small in-process caches (PM2 runs a single long-lived process).
const stay22Cache = new Map<string, { ok: boolean; at: number }>()
const reverseCache = new Map<string, { name: string | null; at: number }>()

function fresh<T extends { at: number }>(v: T | undefined): v is T {
  return Boolean(v && Date.now() - v.at < CACHE_TTL_MS)
}

async function stay22Accepts(query: string): Promise<boolean | null> {
  const cached = stay22Cache.get(query)
  if (fresh(cached)) return cached.ok
  try {
    const res = await fetch(`${STAY22_CHECK_URL}&${query}`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(6000),
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MPGCalculator/1.0)' },
    })
    const text = await res.text()
    const ok = res.status === 200 && !text.includes('No results could be found')
    // Only cache definitive answers (200 or the explicit "no results" 404).
    if (res.status === 200 || text.includes('No results could be found')) {
      stay22Cache.set(query, { ok, at: Date.now() })
      return ok
    }
    return null // rate-limited / unknown
  } catch {
    return null
  }
}

async function nearestTown(lat: number, lng: number): Promise<string | null> {
  if (!ORS_API_KEY) return null
  const key = `${lat.toFixed(3)},${lng.toFixed(3)}`
  const cached = reverseCache.get(key)
  if (fresh(cached)) return cached.name
  try {
    const res = await fetch(
      `${PELIAS_URL}/reverse?point.lat=${lat}&point.lon=${lng}&layers=locality,localadmin&size=1&api_key=${ORS_API_KEY}`,
      { cache: 'no-store', signal: AbortSignal.timeout(6000) }
    )
    if (!res.ok) return null
    const data = await res.json()
    const p = data?.features?.[0]?.properties
    const town = p ? p.locality || p.localadmin || p.name : null
    const region = p?.region_a || p?.region || ''
    const name = town ? (region ? `${town}, ${region}` : town) : null
    reverseCache.set(key, { name, at: Date.now() })
    return name
  } catch {
    return null
  }
}

function parsePoints(raw: string | null): { lat: number; lng: number }[] {
  if (!raw) return []
  return raw
    .split(';')
    .slice(0, MAX_POINTS)
    .map((pair) => {
      const [lat, lng] = pair.split(',').map(Number)
      return { lat, lng }
    })
    .filter(({ lat, lng }) => Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180)
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const name = (searchParams.get('name') || '').trim().slice(0, 200)
  const points = parsePoints(searchParams.get('pts'))
  if (!name && !points.length) {
    return NextResponse.json({ error: 'Missing name or pts' }, { status: 400 })
  }

  let checks = 0
  let inconclusive = 0
  const tryQuery = async (query: string) => {
    if (checks >= MAX_STAY22_CHECKS) return false
    checks++
    const result = await stay22Accepts(query)
    if (result === null) inconclusive++
    return result === true
  }

  // Town names near the points, nearest-first, de-duplicated
  const towns: string[] = []
  const primaryTown = points.length ? await nearestTown(points[0].lat, points[0].lng) : null
  if (primaryTown) towns.push(primaryTown)
  const label = name || primaryTown || ''

  // 1. The name the user typed
  if (name && (await tryQuery(new URLSearchParams({ address: name }).toString()))) {
    return NextResponse.json({ ok: true, name: label, address: name })
  }
  // 2. Exact coordinates (destination case: most precise)
  if (name && points.length) {
    const { lat, lng } = points[0]
    if (await tryQuery(`lat=${lat}&lng=${lng}`)) {
      return NextResponse.json({ ok: true, name: label, lat, lng })
    }
  }
  // 3. Nearby towns as addresses (overnight-stop case, or fallback)
  if (points.length) {
    // Look up in parallel, but keep the caller's (nearest-first) order
    const more = await Promise.all(points.slice(1).map((p) => nearestTown(p.lat, p.lng)))
    for (const t of more) if (t && !towns.includes(t)) towns.push(t)
    for (const town of towns) {
      if (await tryQuery(new URLSearchParams({ address: town }).toString())) {
        return NextResponse.json({ ok: true, name: name ? label : town, address: town })
      }
    }
  }

  // Couldn't verify (Stay22 slow / rate-limiting us): don't hide the map — use
  // the best guess, a real town name, which is far more reliable than raw coords.
  if (inconclusive > 0) {
    const guess = towns[0] || name
    if (guess) return NextResponse.json({ ok: true, name: name ? label : guess, address: guess, unverified: true })
    if (points.length) return NextResponse.json({ ok: true, name: label, lat: points[0].lat, lng: points[0].lng, unverified: true })
  }

  // Nothing Stay22 can map — the client falls back to a plain booking link.
  return NextResponse.json({ ok: false, name: label })
}
