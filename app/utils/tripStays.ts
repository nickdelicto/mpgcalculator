/**
 * Helpers for the "Where to stay" panel on the Road Trip Cost Calculator:
 * - where a long drive needs overnight stops
 * - which check-in / check-out dates each stay gets
 */

/** Typical comfortable driving day. Longer than MAX_SINGLE_DAY_HOURS → plan a stop. */
export const DRIVING_HOURS_PER_DAY = 8
const MAX_SINGLE_DAY_HOURS = 9
const MAX_STOPS = 4

export interface OvernightStop {
  /** 1-based night number on the way (Night 1 = first night on the road). */
  night: number
  lat: number
  lng: number
  /** Approximate driving hours from the start to this stop. */
  hoursIn: number
  /** Approximate miles from the start to this stop. */
  milesIn: number
  /**
   * Points further along / back along the route (nearest first). Used to find
   * a nearby town with hotels when the exact stop point is in the middle of nowhere.
   */
  nearby: { lat: number; lng: number }[]
}

// Offsets (km along the route) to look for a bigger town near each stop
const NEARBY_OFFSETS_KM = [30, -30, 60, -60, 100, -100]

function haversineKm(a: [number, number], b: [number, number]): number {
  const toRad = (d: number) => (d * Math.PI) / 180
  const [lng1, lat1] = a
  const [lng2, lat2] = b
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return 6371 * 2 * Math.asin(Math.min(1, Math.sqrt(h)))
}

/** How many nights on the road a drive of `durationHours` needs before arriving. */
export function nightsOnTheRoad(durationHours: number): number {
  if (!Number.isFinite(durationHours) || durationHours <= MAX_SINGLE_DAY_HOURS) return 0
  return Math.min(MAX_STOPS, Math.ceil(durationHours / DRIVING_HOURS_PER_DAY) - 1)
}

/**
 * Evenly split a long route into driving days and return the point where each
 * day ends. Uses distance along the route geometry as a proxy for time.
 * `coordinates` are GeoJSON [lng, lat] pairs.
 */
export function computeOvernightStops(
  coordinates: [number, number][] | undefined,
  durationSeconds: number,
  distanceMeters: number
): OvernightStop[] {
  const durationHours = durationSeconds / 3600
  const nights = nightsOnTheRoad(durationHours)
  if (!nights || !Array.isArray(coordinates) || coordinates.length < 3) return []

  // Cumulative distance along the polyline
  const cumulative: number[] = [0]
  for (let i = 1; i < coordinates.length; i++) {
    cumulative.push(cumulative[i - 1] + haversineKm(coordinates[i - 1], coordinates[i]))
  }
  const totalKm = cumulative[cumulative.length - 1]
  if (!totalKm) return []

  const pointAtKm = (km: number): { lat: number; lng: number } | null => {
    const target = Math.min(Math.max(km, 0), totalKm)
    // binary search for first index with cumulative >= target
    let lo = 0
    let hi = cumulative.length - 1
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      if (cumulative[mid] < target) lo = mid + 1
      else hi = mid
    }
    const [lng, lat] = coordinates[lo] || []
    return typeof lat === 'number' && typeof lng === 'number' ? { lat, lng } : null
  }

  const stops: OvernightStop[] = []
  for (let night = 1; night <= nights; night++) {
    const fraction = night / (nights + 1)
    const targetKm = totalKm * fraction
    const point = pointAtKm(targetKm)
    if (!point) continue
    const { lat, lng } = point
    const nearby = NEARBY_OFFSETS_KM.map((off) => pointAtKm(targetKm + off)).filter(
      (p): p is { lat: number; lng: number } => p !== null
    )
    stops.push({
      nearby,
      night,
      lat,
      lng,
      hoursIn: durationHours * fraction,
      milesIn: (distanceMeters / 1609.344) * fraction,
    })
  }
  return stops
}

/** YYYY-MM-DD for a local date. */
export function toISODate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Parse YYYY-MM-DD as a local date (avoids the UTC off-by-one of `new Date('YYYY-MM-DD')`). */
export function parseISODate(s: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || '')
  if (!m) return null
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  return Number.isNaN(d.getTime()) ? null : d
}

export function addDays(iso: string, days: number): string {
  const d = parseISODate(iso)
  if (!d) return ''
  d.setDate(d.getDate() + days)
  return toISODate(d)
}

export function formatShortDate(iso: string): string {
  const d = parseISODate(iso)
  if (!d) return ''
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

export interface StayDates {
  checkin: string
  checkout: string
}

/**
 * Dates for a stay, derived from the departure date.
 * Night k on the road: check in on departure + (k-1), one night.
 * Destination: check in on departure + nightsOnRoad, stay `destinationNights`.
 */
export function stayDatesFor(
  departureDate: string,
  stop: { night: number } | 'destination',
  nightsOnRoad: number,
  destinationNights: number
): StayDates | null {
  if (!parseISODate(departureDate)) return null
  if (stop === 'destination') {
    const checkin = addDays(departureDate, nightsOnRoad)
    return { checkin, checkout: addDays(checkin, Math.max(1, destinationNights)) }
  }
  const checkin = addDays(departureDate, stop.night - 1)
  return { checkin, checkout: addDays(checkin, 1) }
}
