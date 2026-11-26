#!/usr/bin/env node
/**
 * Builds data/road-trips/routes.json for the /road-trip-cost/[route] pages.
 *
 * For every route in routes-list.mjs it computes, using OpenRouteService (HeiGIT):
 *  - real driving distance + time (driving-car profile)
 *  - miles driven in each state (route geometry × US state polygons)
 *  - suggested overnight stops (~8 h of driving per day), reverse-geocoded to a town
 *  - a simplified polyline for the map
 *
 * Run locally (needs ORS_API_KEY in .env):  node scripts/road-trips/build-routes.mjs
 * Re-running only fetches routes that are missing (cache in data/road-trips/). Use --force to rebuild all.
 * Rate limits (free ORS plan): directions 40/min, geocoding 100/min — the script paces itself.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { ROUTES } from './routes-list.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = join(HERE, '..', '..')
const OUT_DIR = join(ROOT, 'data', 'road-trips')
const PLACES_FILE = join(OUT_DIR, 'places.json')
const ROUTES_FILE = join(OUT_DIR, 'routes.json')
const FORCE = process.argv.includes('--force')
const HOURS_PER_DAY = 8

const env = readFileSync(join(ROOT, '.env'), 'utf8')
const KEY = (env.match(/^ORS_API_KEY="?([^"\n]+)"?/m) || [])[1]
if (!KEY) throw new Error('ORS_API_KEY missing in .env')
const H = 'https://api.heigit.org'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

mkdirSync(OUT_DIR, { recursive: true })
const places = existsSync(PLACES_FILE) ? JSON.parse(readFileSync(PLACES_FILE, 'utf8')) : {}
const routesOut = existsSync(ROUTES_FILE) && !FORCE ? JSON.parse(readFileSync(ROUTES_FILE, 'utf8')) : { routes: [] }

// ---------- US states (point-in-polygon) ----------
const STATE_ABBR = { Alabama: 'AL', Alaska: 'AK', Arizona: 'AZ', Arkansas: 'AR', California: 'CA', Colorado: 'CO', Connecticut: 'CT', Delaware: 'DE', 'District of Columbia': 'DC', Florida: 'FL', Georgia: 'GA', Hawaii: 'HI', Idaho: 'ID', Illinois: 'IL', Indiana: 'IN', Iowa: 'IA', Kansas: 'KS', Kentucky: 'KY', Louisiana: 'LA', Maine: 'ME', Maryland: 'MD', Massachusetts: 'MA', Michigan: 'MI', Minnesota: 'MN', Mississippi: 'MS', Missouri: 'MO', Montana: 'MT', Nebraska: 'NE', Nevada: 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', Ohio: 'OH', Oklahoma: 'OK', Oregon: 'OR', Pennsylvania: 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC', 'South Dakota': 'SD', Tennessee: 'TN', Texas: 'TX', Utah: 'UT', Vermont: 'VT', Virginia: 'VA', Washington: 'WA', 'West Virginia': 'WV', Wisconsin: 'WI', Wyoming: 'WY', 'Puerto Rico': 'PR' }
const statesGeo = JSON.parse(readFileSync(join(HERE, 'us-states.json'), 'utf8'))
const STATES = statesGeo.features.map((f) => {
  const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates
  let minX = 180, minY = 90, maxX = -180, maxY = -90
  for (const p of polys) for (const [x, y] of p[0]) { minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y) }
  return { abbr: STATE_ABBR[f.properties.name], polys, bbox: [minX, minY, maxX, maxY] }
})
function inRing(x, y, ring) {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j]
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}
let lastState = null
function stateAt(lng, lat) {
  const test = (s) => s.bbox[0] <= lng && lng <= s.bbox[2] && s.bbox[1] <= lat && lat <= s.bbox[3] &&
    s.polys.some((p) => inRing(lng, lat, p[0]) && !p.slice(1).some((h) => inRing(lng, lat, h)))
  if (lastState && test(lastState)) return lastState.abbr
  const s = STATES.find(test)
  if (s) { lastState = s; return s.abbr }
  return null // e.g. bridges/coastline gaps in the low-res polygons
}

// ---------- geometry helpers ----------
function decodePolyline(str) {
  let index = 0, lat = 0, lng = 0
  const out = []
  while (index < str.length) {
    for (const which of [0, 1]) {
      let b, shift = 0, result = 0
      do { b = str.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5 } while (b >= 0x20)
      const d = result & 1 ? ~(result >> 1) : result >> 1
      if (which === 0) lat += d; else lng += d
    }
    out.push([lng / 1e5, lat / 1e5])
  }
  return out
}
const toRad = (d) => (d * Math.PI) / 180
function haversineMi([lng1, lat1], [lng2, lat2]) {
  const R = 3958.8
  const a = Math.sin(toRad(lat2 - lat1) / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(toRad(lng2 - lng1) / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}
function simplify(points, maxPoints = 220) {
  if (points.length <= maxPoints) return points
  const step = (points.length - 1) / (maxPoints - 1)
  const out = []
  for (let i = 0; i < maxPoints; i++) out.push(points[Math.round(i * step)])
  return out
}
const round = (n, d = 4) => Math.round(n * 10 ** d) / 10 ** d

// ---------- API calls ----------
async function api(url, opts = {}, tries = 4) {
  for (let t = 1; t <= tries; t++) {
    try {
      const r = await fetch(url, opts)
      if (r.status === 429) { await sleep(65000); continue }
      const j = await r.json()
      if (!r.ok) throw new Error(`HTTP ${r.status} ${JSON.stringify(j).slice(0, 200)}`)
      return j
    } catch (e) {
      if (t === tries) throw e
      await sleep(3000 * t)
    }
  }
}
async function geocode(text) {
  if (places[text]) return places[text]
  const [, st] = text.split(', ')
  const q = (layers) => `${H}/pelias/v1/search?${new URLSearchParams({ api_key: KEY, text, size: '5', 'boundary.country': 'USA', ...(layers ? { layers } : {}) })}`
  let j = await api(q('locality'))
  let f = j.features.find((x) => x.properties.region_a === st)
  if (!f) { await sleep(700); j = await api(q('')); f = j.features.find((x) => x.properties.region_a === st) }
  if (!f) throw new Error(`Geocode failed for ${text}`)
  await sleep(700)
  places[text] = { name: text.split(', ')[0], state: st, label: f.properties.label, lng: round(f.geometry.coordinates[0]), lat: round(f.geometry.coordinates[1]) }
  writeFileSync(PLACES_FILE, JSON.stringify(places, null, 1))
  return places[text]
}
// eslint-disable-next-line no-unused-vars
async function _reverseUnused([lng, lat]) {
  const u = `${H}/pelias/v1/reverse?${new URLSearchParams({ api_key: KEY, 'point.lat': String(lat), 'point.lon': String(lng), layers: 'locality', size: '1', 'boundary.country': 'USA' })}`
  const j = await api(u)
  await sleep(700)
  const p = j.features[0]?.properties
  return p ? { name: p.name, state: p.region_a, lng: round(j.features[0].geometry.coordinates[0]), lat: round(j.features[0].geometry.coordinates[1]) } : null
}
async function directions(a, b) {
  const j = await api(`${H}/openrouteservice/v2/directions/driving-car?api_key=${KEY}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ coordinates: [[a.lng, a.lat], [b.lng, b.lat]], instructions: false, units: 'm', radiuses: [-1, -1] }),
  })
  await sleep(1600)
  return j.routes[0]
}

// ---------- slugs ----------
const cityCount = {}
for (const [a, b] of ROUTES) for (const p of [a, b]) { const n = p.split(', ')[0]; (cityCount[n] ||= new Set()).add(p) }
const slugPart = (p) => {
  const [n, st] = p.split(', ')
  const base = n.toLowerCase().replace(/\./g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  return cityCount[n].size > 1 ? `${base}-${st.toLowerCase()}` : base
}

// ---------- main ----------
const done = new Map(routesOut.routes.map((r) => [r.slug, r]))
const seen = new Set()
for (const [from, to, region] of ROUTES) {
  const slug = `${slugPart(from)}-to-${slugPart(to)}`
  const rev = `${slugPart(to)}-to-${slugPart(from)}`
  if (seen.has(slug) || seen.has(rev)) { console.warn('duplicate/reverse skipped:', slug); continue }
  seen.add(slug)
  if (done.has(slug)) continue

  let A, B, route
  try {
    A = await geocode(from); B = await geocode(to)
    route = await directions(A, B)
  } catch (e) {
    console.error(`FAILED ${slug}: ${e.message.slice(0, 160)}`)
    continue
  }
  const pts = decodePolyline(route.geometry)
  const distanceMi = route.summary.distance / 1609.344
  const durationH = route.summary.duration / 3600

  // Miles per state + cumulative distance along the route
  const stateMi = {}
  const cum = [0]
  for (let i = 1; i < pts.length; i++) {
    const d = haversineMi(pts[i - 1], pts[i])
    cum.push(cum[i - 1] + d)
    const mid = [(pts[i - 1][0] + pts[i][0]) / 2, (pts[i - 1][1] + pts[i][1]) / 2]
    const st = stateAt(mid[0], mid[1])
    if (st) stateMi[st] = (stateMi[st] || 0) + d
  }
  // Scale polyline miles to the router's official distance; order states by first appearance
  const geoTotal = cum[cum.length - 1] || 1
  const scale = distanceMi / Object.values(stateMi).reduce((s, v) => s + v, 0 || 1)
  const order = []
  for (let i = 1; i < pts.length; i += Math.max(1, Math.floor(pts.length / 400))) {
    const st = stateAt(pts[i][0], pts[i][1]); if (st && !order.includes(st)) order.push(st)
  }
  for (const st of Object.keys(stateMi)) if (!order.includes(st)) order.push(st)
  const states = order.filter((s) => stateMi[s] * scale >= 1).map((s) => ({ state: s, miles: Math.round(stateMi[s] * scale * 10) / 10 }))

  // Overnight stops (~8 h of driving per day)
  const days = Math.max(1, Math.ceil(durationH / HOURS_PER_DAY - 0.15))
  const stops = [] // filled in by computeStops() below (no API calls)

  const rec = {
    slug, region,
    from: A, to: B,
    distanceMi: Math.round(distanceMi * 10) / 10,
    durationH: Math.round(durationH * 100) / 100,
    days, states, stops,
    path: simplify(pts).map(([x, y]) => [round(x), round(y)]),
    computedAt: new Date().toISOString().slice(0, 10),
  }
  done.set(slug, rec)
  writeFileSync(ROUTES_FILE, JSON.stringify({ generatedBy: 'scripts/road-trips/build-routes.mjs', routes: [...done.values()] }))
  console.log(`${slug}: ${rec.distanceMi} mi, ${rec.durationH} h, ${days} day(s), states ${states.map((s) => s.state).join('>')}, stops ${stops.map((s) => s.name).join(', ') || '-'}`)
}
// Hand-picked overnight towns where no top-1000 city is near the halfway point
const STOP_OVERRIDES = {
  'las-vegas-to-denver': [{ name: 'Grand Junction', state: 'CO', lat: 39.0639, lng: -108.5506 }],
  'denver-to-west-yellowstone': [{ name: 'Pinedale', state: 'WY', lat: 42.8666, lng: -109.8607 }],
  'denver-to-kansas-city': [{ name: 'Hays', state: 'KS', lat: 38.8792, lng: -99.3268 }],
}
function snapStop(rec, t) {
  const pts = rec.path
  const cum = [0]
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + haversineMi(pts[i - 1], pts[i]))
  let bi = 0, bd = Infinity
  pts.forEach((p, i) => { const d = haversineMi(p, [t.lng, t.lat]); if (d < bd) { bd = d; bi = i } })
  if (bd > 40) throw new Error(`Override stop ${t.name} is ${bd.toFixed(0)} mi off route ${rec.slug}`)
  return { ...t, mileMark: Math.round((rec.distanceMi * cum[bi]) / cum[cum.length - 1]) }
}
// ---------- overnight stops: nearest real city (top-1000 US cities) to the route near each ~8 h mark ----------
const CITIES = JSON.parse(readFileSync(join(HERE, 'us-cities.json'), 'utf8')) // [name, st, pop, lng, lat]
function computeStops(rec, maxD = 25) {
  const pts = rec.path
  const cum = [0]
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + haversineMi(pts[i - 1], pts[i]))
  const total = cum[cum.length - 1] || 1
  const stops = []
  for (let k = 1; k < rec.days; k++) {
    const target = (total * k) / rec.days
    const win = total * 0.1 // look ±10% of the trip around the ideal stop point
    const near = pts.map((p, i) => ({ p, at: cum[i] })).filter((x) => Math.abs(x.at - target) <= win)
    let best = null
    for (const [name, st, pop, lng, lat] of CITIES) {
      if (name === rec.from.name || name === rec.to.name) continue
      for (const x of near) {
        const d = haversineMi(x.p, [lng, lat])
        if (d > maxD) continue
        // prefer close to the route, close to the ideal mile mark, and bigger towns (more hotels)
        const score = d + Math.abs(x.at - target) * 0.15 - Math.log10(pop) * 6
        if (!best || score < best.score) best = { score, name, state: st, lng, lat, at: x.at }
      }
    }
    if (best) stops.push({ name: best.name, state: best.state, lng: best.lng, lat: best.lat, mileMark: Math.round((rec.distanceMi * best.at) / total) })
  }
  // de-dupe and keep order
  return stops.filter((s, i, a) => a.findIndex((t) => t.name === s.name) === i).sort((a, b) => a.mileMark - b.mileMark)
}
for (const rec of done.values()) {
  rec.days = Math.max(1, Math.ceil(rec.durationH / HOURS_PER_DAY - 0.15))
  rec.stops = computeStops(rec)
  if (rec.stops.length < rec.days - 1) rec.stops = computeStops(rec, 60) // sparse areas (e.g. rural Utah)
  if (STOP_OVERRIDES[rec.slug]) rec.stops = STOP_OVERRIDES[rec.slug].map((t) => snapStop(rec, t))
  rec.days = rec.stops.length + 1 // itinerary days always match the stops we can name
}

// Drop routes no longer in the list
const keep = [...done.values()].filter((r) => seen.has(r.slug))
writeFileSync(ROUTES_FILE, JSON.stringify({ generatedBy: 'scripts/road-trips/build-routes.mjs', routes: keep }))
console.log(`Done: ${keep.length} routes`)
