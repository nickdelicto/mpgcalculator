'use client'

import React, { useEffect, useState } from 'react'
import { STAY22_AID, generateStay22AllezLink } from '../utils/stay22'

interface Stay22MapProps {
  /** Latitude of the place to stay (destination or overnight stop) */
  lat: number
  /** Longitude of the place to stay */
  lng: number
  /**
   * Stay22-friendly place query (e.g. "Nashville, TN"). When set it is used
   * instead of lat/lng — Stay22's map 404s on many arbitrary coordinates.
   */
  address?: string
  /** 'resolving' = still finding a location Stay22 accepts; 'unavailable' = none found */
  status?: 'resolving' | 'ready' | 'unavailable'
  /** Check-in date (YYYY-MM-DD). Optional — Stay22 shows "Select dates" if omitted. */
  checkin?: string
  /** Check-out date (YYYY-MM-DD). */
  checkout?: string
  /** Number of adult guests. */
  adults?: number
  /** Stay22 affiliate ID (defaults to our account). */
  aid?: string
  /** Campaign tag for Stay22 performance reporting. */
  campaign?: string
  /** Clean destination label shown in the widget's search bar (overrides the raw address). */
  destinationName?: string
}

// Brand accent for the Stay22 widget (hex without #) — matches our blue UI.
const STAY22_MAIN_COLOR = '2563EB'
// If the widget hasn't finished loading by then, offer a plain link instead.
const SLOW_LOAD_MS = 12000

/**
 * Full-size Stay22 accommodation map. Fills its parent container.
 * Shown in the big map area when the Hotels tab is active (swaps in for the
 * route map). Bookings are tracked to our affiliate account (`aid`).
 */
const Stay22Map: React.FC<Stay22MapProps> = ({
  lat,
  lng,
  address,
  status = 'ready',
  checkin,
  checkout,
  adults,
  aid = STAY22_AID,
  campaign = 'roadtrip_map',
  destinationName,
}) => {
  const [loaded, setLoaded] = useState(false)
  const [slow, setSlow] = useState(false)

  const validCoords =
    typeof lat === 'number' && typeof lng === 'number' && !Number.isNaN(lat) && !Number.isNaN(lng)

  const params = new URLSearchParams({ aid })
  if (address) {
    params.append('address', address)
  } else {
    params.append('lat', String(lat))
    params.append('lng', String(lng))
  }
  params.append('campaign', campaign)
  params.append('maincolor', STAY22_MAIN_COLOR)
  if (destinationName) params.append('venue', destinationName)
  if (checkin) params.append('checkin', checkin)
  if (checkout) params.append('checkout', checkout)
  if (adults && adults > 0) params.append('adults', String(adults))
  const src = `https://www.stay22.com/embed/gm?${params.toString()}`

  // Reset the loading state whenever the place/dates change (new iframe src).
  useEffect(() => {
    setLoaded(false)
    setSlow(false)
    const t = setTimeout(() => setSlow(true), SLOW_LOAD_MS)
    return () => clearTimeout(t)
  }, [src])

  if (!validCoords) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-500">
        <p>Calculate a route to see places to stay.</p>
      </div>
    )
  }

  const fallbackUrl = generateStay22AllezLink({
    lat: address ? undefined : lat,
    lng: address ? undefined : lng,
    address: address || destinationName,
    checkin,
    checkout,
    adults,
    campaign: `${campaign}_fallback`,
  })

  if (status === 'resolving') {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
        <div className="text-gray-400 text-sm animate-pulse">Finding hotels near {destinationName || 'your stop'}…</div>
      </div>
    )
  }

  // Stay22's map can't show this spot — offer the booking search directly
  // instead of an iframe that would render an error page.
  if (status === 'unavailable') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-gray-50 p-6 text-center">
        <p className="text-gray-700">The hotel map isn&apos;t available for {destinationName || 'this spot'}.</p>
        <a
          href={fallbackUrl}
          target="_blank"
          rel="sponsored noopener"
          className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-700"
        >
          Search hotels near {destinationName ? destinationName.split(',')[0] : 'here'}
        </a>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      {!loaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gray-50 z-10 p-4 text-center">
          <div className="text-gray-400 text-sm animate-pulse">Loading hotels and prices…</div>
          {slow && (
            <a
              href={fallbackUrl}
              target="_blank"
              rel="sponsored noopener"
              className="text-sm font-medium text-blue-700 underline"
            >
              Taking a while? Open the hotel search in a new tab
            </a>
          )}
        </div>
      )}
      <iframe
        key={src}
        title={destinationName ? `Hotels near ${destinationName}` : 'Hotels near your destination'}
        src={src}
        onLoad={() => setLoaded(true)}
        loading="lazy"
        className="w-full h-full"
        style={{ border: 0 }}
        allow="geolocation"
      />
    </div>
  )
}

export default Stay22Map
