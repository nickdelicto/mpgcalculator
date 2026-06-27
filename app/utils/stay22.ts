/**
 * Stay22 affiliate config + Allez deep-link builder.
 *
 * An Allez link redirects the user to the booking site (OTA) most likely to
 * convert for them, and tracks the booking to our affiliate account. We build
 * these in code (no per-link dashboard work), the same way we build Viator
 * deep-links. Docs: https://community.stay22.com/allez-deep-links-everything-you-need-to-know
 */

export const STAY22_AID = 'curiousgens'

export interface AllezLinkParams {
  /** Hotel/destination latitude (preferred over address). */
  lat?: number
  /** Hotel/destination longitude. */
  lng?: number
  /** Fallback location text (e.g. "Boston, MA") when lat/lng is unavailable. */
  address?: string
  /** Hotel name — lands the user on that specific hotel's page when possible. */
  hotelName?: string
  /** Check-in date, YYYY-MM-DD (optional). */
  checkin?: string
  /** Check-out date, YYYY-MM-DD (optional). */
  checkout?: string
  /** Campaign label for Stay22 performance reporting. */
  campaign?: string
}

/**
 * Build a Stay22 Allez deep-link. Returns a plain TripAdvisor-style fallback only
 * if no usable location was provided (should not normally happen).
 */
export function generateStay22AllezLink({
  lat,
  lng,
  address,
  hotelName,
  checkin,
  checkout,
  campaign = 'roadtrip',
}: AllezLinkParams): string {
  const params = new URLSearchParams({ aid: STAY22_AID, campaign })

  const hasCoords =
    typeof lat === 'number' && typeof lng === 'number' && !Number.isNaN(lat) && !Number.isNaN(lng)

  if (hasCoords) {
    params.append('lat', String(lat))
    params.append('lng', String(lng))
  } else if (address) {
    params.append('address', address)
  }

  if (hotelName) params.append('hotelname', hotelName)
  if (checkin) params.append('checkin', checkin)
  if (checkout) params.append('checkout', checkout)
  params.append('product_medium', 'apps')

  return `https://www.stay22.com/allez/roam?${params.toString()}`
}
