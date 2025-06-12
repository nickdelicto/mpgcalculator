import { MetadataRoute } from 'next'

// This file defines rules for web crawlers via robots.txt
// We also have an llms.txt file in the public directory that provides
// guidance for Large Language Models to better understand our site structure and tools.
// The llms.txt file can be accessed at: /llms.txt

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