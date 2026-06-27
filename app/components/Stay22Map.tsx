'use client'

import React, { useState } from 'react'
import { STAY22_AID } from '../utils/stay22'

interface Stay22MapProps {
  /** Destination latitude */
  lat: number
  /** Destination longitude */
  lng: number
  /** Check-in date (YYYY-MM-DD). Optional — Stay22 defaults if omitted. */
  checkin?: string
  /** Check-out date (YYYY-MM-DD). Optional — defaults to check-in + 1 day. */
  checkout?: string
  /** Stay22 affiliate ID (defaults to our account). */
  aid?: string
  /** Campaign tag for Stay22 performance reporting. */
  campaign?: string
  /** Clean destination label shown in the widget's search bar (overrides the raw address). */
  destinationName?: string
}

// Brand accent for the Stay22 widget (hex without #) — matches our blue UI.
const STAY22_MAIN_COLOR = '2563EB'

/**
 * Full-size Stay22 accommodation map. Fills its parent container.
 * Shown in the big map area when the Hotels tab is active (swaps in for the
 * route map). Bookings are tracked to our affiliate account (`aid`).
 */
const Stay22Map: React.FC<Stay22MapProps> = ({
  lat,
  lng,
  checkin,
  checkout,
  aid = STAY22_AID,
  campaign = 'road-trip-cost-calculator',
  destinationName,
}) => {
  const [loaded, setLoaded] = useState(false)

  if (typeof lat !== 'number' || typeof lng !== 'number' || Number.isNaN(lat) || Number.isNaN(lng)) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-500">
        <p>Calculate a route to see places to stay.</p>
      </div>
    )
  }

  const params = new URLSearchParams({
    aid,
    lat: String(lat),
    lng: String(lng),
    campaign,
    maincolor: STAY22_MAIN_COLOR,
  })
  if (destinationName) params.append('venue', destinationName)
  if (checkin) params.append('checkin', checkin)
  if (checkout) params.append('checkout', checkout)
  const src = `https://www.stay22.com/embed/gm?${params.toString()}`

  return (
    <div className="relative w-full h-full">
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
          <div className="text-gray-400 text-sm animate-pulse">Loading accommodations…</div>
        </div>
      )}
      <iframe
        title="Accommodations near your destination"
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
