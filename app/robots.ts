import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/embed/',    // Embed calculator pages
        '/private/',
        '/api/',     // All API routes
        '/bolingo/', // Admin section (renamed from /admin for security)
        '/bolingo/login',
        '/bolingo/embed-analytics'
      ]
    },
    sitemap: `${baseUrl}/sitemap.xml`
  }
}