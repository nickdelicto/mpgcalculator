import { MetadataRoute } from 'next'
import { ROUTES as ROAD_TRIP_ROUTES } from './road-trip-cost/lib'
import { STATE_LIST as GAS_STATES } from './gas-prices/lib'
import { getVehicleIndex, getIndexableSlugs } from './lib/vehicleIndexing'

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

// Only the strong core of vehicle pages is listed: one "keeper" page per
// model year + make + model family (2018+), plus every page that already earns
// search impressions. All other vehicle pages are noindex — see app/lib/vehicleIndexing.ts.
// Stable lastmod: bump when the EPA vehicle data or the vehicle page template changes.
const VEHICLE_PAGES_LASTMOD = new Date('2026-11-26')

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const vehicleIndex = await getVehicleIndex()

  // Create vehicle page entries
  const vehicleEntries = getIndexableSlugs(vehicleIndex).map((slug) => ({
    url: `${baseUrl}/vehicles/${slug}`,
    lastModified: VEHICLE_PAGES_LASTMOD,
    changeFrequency: 'monthly' as const,
    priority: 0.8
  }))

  // Add static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1
    },
    {
      url: `${baseUrl}/vehicles`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9
    },
    {
      url: `${baseUrl}/fuel-economy-compare`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9
    },
    {
      url: `${baseUrl}/fuel-savings-calculator`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9
    },
    {
      url: `${baseUrl}/road-trip-cost-calculator`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9
    },
    // Gas prices by state + weekly alert sign-up page (prices refresh weekly)
    { url: `${baseUrl}/gas-prices`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.9 },
    ...GAS_STATES.map((s) => ({ url: `${baseUrl}/gas-prices/${s.slug}`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.8 })),
    { url: `${baseUrl}/gas-price-alerts`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.7 },
    // Route cost pages (/road-trip-cost/*), gas prices refresh weekly
    {
      url: `${baseUrl}/road-trip-cost`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9
    },
    {
      url: `${baseUrl}/road-trip-cost/christmas-2026`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9
    },
    {
      url: `${baseUrl}/road-trip-cost/holiday-2026`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9
    },
    ...ROAD_TRIP_ROUTES.map((r) => ({
      url: `${baseUrl}/road-trip-cost/${r.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8
    })),
    {
      url: `${baseUrl}/escape-the-grind`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7
    },
    {
      url: `${baseUrl}/blog/road-trips`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7
    },
    {
      url: `${baseUrl}/blog/road-trips/best-road-trip-routes-usa`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7
    }
  ]

  return [...staticPages, ...vehicleEntries]
} 