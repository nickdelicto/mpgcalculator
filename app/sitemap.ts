import { MetadataRoute } from 'next'
import { Vehicle } from './types/vehicle'
import { ROUTES as ROAD_TRIP_ROUTES } from './road-trip-cost/lib'

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

async function getAllVehicles() {
  const url = new URL(`${baseUrl}/api/vehicles/all`)
  try {
    const response = await fetch(url.toString())
    if (!response.ok) return []
    return await response.json() as Vehicle[]
  } catch (error) {
    console.error('Error fetching vehicles for sitemap:', error)
    return []
  }
}

// Helper to normalize text for URLs (reusing from vehicle page)
function normalizeForUrl(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\s/g, '-')
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const vehicles = await getAllVehicles()

  // Create vehicle page entries
  const vehicleEntries = vehicles.map((vehicle) => ({
    url: `${baseUrl}/vehicles/${vehicle.year}-${normalizeForUrl(vehicle.make)}-${normalizeForUrl(vehicle.model)}-mpg`,
    lastModified: new Date(),
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
    // Route cost pages (/road-trip-cost/*) — gas prices refresh weekly
    {
      url: `${baseUrl}/road-trip-cost`,
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