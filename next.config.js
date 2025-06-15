/** @type {import('next').NextConfig} */
const nextConfig = {
  // Exclude template page from production builds
  experimental: {
    // This will exclude the template page from production builds
    excludeDefaultMomentLocales: true,
  },

  // Explicitly ignore the template page in production
  webpack: (config, { dev, isServer }) => {
    if (!dev && isServer) {
      // Exclude template page from production builds
      const originalEntry = config.entry;
      config.entry = async () => {
        const entries = await originalEntry();
        // Remove the template page from the entries
        if (entries['app/blog/template/page']) {
          delete entries['app/blog/template/page'];
        }
        return entries;
      };
    }
    return config;
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors *"
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*'
          }
        ]
      }
    ]
  },
  
  // Add redirects configuration
  async redirects() {
    return [
      {
        source: '/fuel_economy_calculator_mpg.html',
        destination: '/',
        permanent: true, // 301 redirect (permanent) is better for SEO
      },
      // Redirect old road trip article to new one
      {
        source: '/blog/road-trips/most-popular-road-trip-routes-cost-breakdown',
        destination: '/blog/road-trips/best-road-trip-routes-usa',
        permanent: true, // 301 redirect for SEO value transfer
      },
      // Redirect previous URL to new URL
      {
        source: '/blog/road-trips/most-popular-best-road-trip-routes-usa',
        destination: '/blog/road-trips/best-road-trip-routes-usa',
        permanent: true, // 301 redirect for SEO value transfer
      },
      // Redirect template page to blog homepage in production
      {
        source: '/blog/template',
        destination: '/blog',
        permanent: false, // 307 temporary redirect
      },
      // You can add more legacy URL redirects here if needed
    ]
  }
}

module.exports = nextConfig 