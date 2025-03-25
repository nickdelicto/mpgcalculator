/** @type {import('next').NextConfig} */
const nextConfig = {
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
      // You can add more legacy URL redirects here if needed
    ]
  }
}

module.exports = nextConfig 