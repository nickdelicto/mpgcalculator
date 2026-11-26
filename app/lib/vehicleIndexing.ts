/**
 * Which /vehicles/[slug] pages Google should index.
 *
 * Every (year, make, model) row in the EPA data gets its own URL, so one car
 * (e.g. the 2025 Rivian R1T) is split across 20+ near-identical trim pages.
 * Google treats that as scaled thin content and ignores the whole section.
 * We keep every URL working (200) but only ask search engines to index a
 * strong core:
 *
 *  1. Group rows by model year + make + "model family" (see modelFamily()).
 *  2. Each group has exactly one KEEPER page: the bare model name if it
 *     exists (e.g. "Accord"), else the shortest trim name (alphabetical tie-break).
 *  3. A keeper is indexable when its model year >= KEEPER_MIN_YEAR and the
 *     make is not a low-volume exotic (NON_KEEPER_MAKES).
 *  4. Pages in VEHICLE_INDEX_ALLOWLIST (already earn Google/Bing impressions)
 *     are always indexable with a self canonical.
 *  5. Everything else is noindex,follow. Trims of an indexable keeper point
 *     their canonical at the keeper; out-of-scope pages keep a self canonical
 *     (pointing a canonical at another noindexed page sends mixed signals).
 *
 * Pure functions here are shared by the vehicle page, the sitemap and the
 * /vehicles directory so all three always agree.
 */
import { VEHICLE_INDEX_ALLOWLIST } from './vehicleIndexAllowlist'

/** Oldest model year whose keeper pages are indexed. Bump yearly if desired. */
export const KEEPER_MIN_YEAR = 2018

/**
 * Supercar / coachbuilder / defunct-startup makes: near-zero "MPG" search
 * demand, so their pages are never keepers (they still render, and any that
 * earned impressions are covered by the allowlist).
 */
export const NON_KEEPER_MAKES: ReadonlySet<string> = new Set([
  'aston martin',
  'bentley',
  'bmw alpina',
  'bugatti',
  'bugatti rimac',
  'ferrari',
  'kandi',
  'koenigsegg',
  'lamborghini',
  'lordstown',
  'maybach',
  'mclaren automotive',
  'mobility ventures llc',
  'pagani',
  'rolls-royce',
  'roush performance',
  'ruf automobile',
  'saleen',
  'shelby',
  'spyker',
  'sti',
])

/**
 * First words that are not a model on their own ("Grand Cherokee",
 * "Model 3", "Range Rover", "GR Supra", "AMG C43" ...). When a model name
 * starts with one of these, the family is the first two words.
 */
const COMPOUND_PREFIXES = new Set([
  'amg', 'el', 'fj', 'gr', 'grand', 'land', 'model', 'monte', 'new',
  'park', 'pt', 'range', 'rs', 's', 'santa', 'town', 'vf',
])
const RANGE_ROVER_LINES = /^(sport|evoque|velar)$/i

/** Same normalization the vehicle page / sitemap use for URLs. */
export function normalizeForUrl(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\s/g, '-')
}

export function vehicleSlug(v: { year: number | string; make: string; model: string }): string {
  return `${v.year}-${normalizeForUrl(v.make)}-${normalizeForUrl(v.model)}-mpg`
}

function familyWordCount(words: string[]): number {
  const first = words[0]?.toLowerCase() ?? ''
  if (!COMPOUND_PREFIXES.has(first) || words.length < 2) return 1
  if (first === 'range' && words[2] && RANGE_ROVER_LINES.test(words[2])) return 3
  return 2
}

/** Human-readable family name, e.g. "CR-V" for "CR-V AWD", "Grand Cherokee" for "Grand Cherokee 4WD". */
export function modelFamilyName(model: string): string {
  const words = model.trim().split(/\s+/)
  return words.slice(0, familyWordCount(words)).join(' ')
}

/** Normalized family key ("cr-v", "grand-cherokee"). */
export function modelFamily(model: string): string {
  return normalizeForUrl(modelFamilyName(model))
}

export interface VehicleRef {
  year: number
  make: string
  model: string
}

export interface FamilyGroup {
  year: number
  make: string
  /** normalized family key */
  family: string
  /** display name taken from the keeper's model string */
  familyName: string
  keeper: VehicleRef
  keeperSlug: string
  /** all models in the group, keeper first, then alphabetical */
  members: VehicleRef[]
  /** keeper is indexable by rule (before the allowlist is considered) */
  keeperIndexable: boolean
}

export interface VehicleIndex {
  groups: FamilyGroup[]
  /** slug -> group the slug belongs to */
  bySlug: Map<string, FamilyGroup>
  /** "make|family" -> groups for every model year, newest first */
  byMakeFamily: Map<string, FamilyGroup[]>
  newestYear: number
}

function keeperSort(family: string) {
  return (a: VehicleRef, b: VehicleRef) => {
    const na = normalizeForUrl(a.model)
    const nb = normalizeForUrl(b.model)
    const bareA = na === family ? 0 : 1
    const bareB = nb === family ? 0 : 1
    return bareA - bareB || na.length - nb.length || (na < nb ? -1 : na > nb ? 1 : 0)
  }
}

export function isKeeperEligible(year: number, make: string): boolean {
  return year >= KEEPER_MIN_YEAR && !NON_KEEPER_MAKES.has(make.toLowerCase())
}

export function buildVehicleIndex(rows: VehicleRef[]): VehicleIndex {
  const buckets = new Map<string, VehicleRef[]>()
  let newestYear = 0
  for (const r of rows) {
    const year = Number(r.year)
    if (!year || !r.make || !r.model) continue
    if (year > newestYear) newestYear = year
    const key = `${year}|${r.make.toLowerCase()}|${modelFamily(r.model)}`
    let list = buckets.get(key)
    if (!list) buckets.set(key, (list = []))
    list.push({ year, make: r.make, model: r.model })
  }

  const groups: FamilyGroup[] = []
  const bySlug = new Map<string, FamilyGroup>()
  const byMakeFamily = new Map<string, FamilyGroup[]>()

  for (const [key, list] of buckets) {
    const [, makeKey, family] = key.split('|')
    const sorted = [...list].sort(keeperSort(family))
    const keeper = sorted[0]
    const group: FamilyGroup = {
      year: keeper.year,
      make: keeper.make,
      family,
      familyName: modelFamilyName(keeper.model),
      keeper,
      keeperSlug: vehicleSlug(keeper),
      members: [keeper, ...sorted.slice(1).sort((a, b) => a.model.localeCompare(b.model))],
      keeperIndexable: isKeeperEligible(keeper.year, keeper.make),
    }
    groups.push(group)
    for (const m of list) {
      const s = vehicleSlug(m)
      if (!bySlug.has(s)) bySlug.set(s, group)
    }
    const mfKey = `${makeKey}|${family}`
    let years = byMakeFamily.get(mfKey)
    if (!years) byMakeFamily.set(mfKey, (years = []))
    years.push(group)
  }
  for (const years of byMakeFamily.values()) years.sort((a, b) => b.year - a.year)
  groups.sort((a, b) => b.year - a.year || a.make.localeCompare(b.make) || a.family.localeCompare(b.family))

  return { groups, bySlug, byMakeFamily, newestYear }
}

export function isAllowlisted(slug: string): boolean {
  return VEHICLE_INDEX_ALLOWLIST.has(slug.toLowerCase())
}

export type IndexReason = 'keeper' | 'allowlist' | 'trim' | 'out-of-scope' | 'unknown'

export interface IndexDecision {
  indexable: boolean
  /** slug the canonical tag should point at */
  canonicalSlug: string
  reason: IndexReason
  group?: FamilyGroup
}

/**
 * Index/canonical decision for a page. `slug` must be the page's canonical
 * slug form (vehicleSlug()). With no index available (API down) we fall back
 * to the historical behaviour: indexable, self canonical.
 */
export function getIndexDecision(slug: string, index: VehicleIndex | null): IndexDecision {
  const s = slug.toLowerCase()
  const group = index?.bySlug.get(s)
  if (isAllowlisted(s)) return { indexable: true, canonicalSlug: s, reason: 'allowlist', group }
  if (!index) return { indexable: true, canonicalSlug: s, reason: 'unknown' }
  if (!group) return { indexable: false, canonicalSlug: s, reason: 'out-of-scope' }
  if (!group.keeperIndexable) return { indexable: false, canonicalSlug: s, reason: 'out-of-scope', group }
  if (group.keeperSlug === s) return { indexable: true, canonicalSlug: s, reason: 'keeper', group }
  return { indexable: false, canonicalSlug: group.keeperSlug, reason: 'trim', group }
}

/** Every slug that should be listed in the sitemap (keepers + allowlist), deduplicated. */
export function getIndexableSlugs(index: VehicleIndex | null): string[] {
  const out = new Set<string>()
  // Index unavailable (API down): still list the allowlist rather than nothing
  if (index) for (const g of index.groups) if (g.keeperIndexable) out.add(g.keeperSlug)
  for (const s of VEHICLE_INDEX_ALLOWLIST) out.add(s)
  return [...out]
}

// ---------------------------------------------------------------------------
// Data loading (server only). /api/vehicles/all is ~1 MB / 18.7k rows; it is
// cached in the Next data cache for a day and memoized per process.
// ---------------------------------------------------------------------------

const INDEX_TTL_MS = 6 * 60 * 60 * 1000
let memo: { at: number; promise: Promise<VehicleIndex | null> } | null = null

async function loadVehicleIndex(): Promise<VehicleIndex | null> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  try {
    const res = await fetch(`${baseUrl}/api/vehicles/all`, { next: { revalidate: 86400 } })
    if (!res.ok) throw new Error(`/api/vehicles/all returned ${res.status}`)
    const rows = (await res.json()) as VehicleRef[]
    if (!Array.isArray(rows) || rows.length === 0) throw new Error('/api/vehicles/all returned no rows')
    return buildVehicleIndex(rows)
  } catch (error) {
    console.error('Vehicle index unavailable:', error instanceof Error ? error.message : error)
    return null
  }
}

export async function getVehicleIndex(): Promise<VehicleIndex | null> {
  const now = Date.now()
  if (memo && now - memo.at < INDEX_TTL_MS) return memo.promise
  const promise = loadVehicleIndex()
  memo = { at: now, promise }
  // Don't keep a failed load around — retry on the next request
  promise.then((idx) => {
    if (!idx && memo?.promise === promise) memo = null
  })
  return promise
}
