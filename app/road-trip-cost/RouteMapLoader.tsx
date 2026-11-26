'use client'

import dynamic from 'next/dynamic'

// Leaflet touches `window`, so load the map only in the browser.
const RouteMap = dynamic(() => import('./RouteMap'), {
  ssr: false,
  loading: () => <div className="h-72 md:h-96 w-full rounded-xl bg-blue-50 border border-blue-100 animate-pulse" />,
})

export default RouteMap
