declare global {
  interface Window {
    fbq: any
  }
}

// Helper to check if we should track events
const shouldTrackEvent = () => {
  if (typeof window === 'undefined') return false

  // Don't track if in an iframe (embed)
  const isEmbedded = window.self !== window.top
  if (isEmbedded) return false

  // Only track on main calculator page
  const isMainCalculator = window.location.pathname === '/fuel-savings-calculator'
  const isVehiclePage = window.location.pathname.includes('/vehicles/')
  
  return isMainCalculator && !isVehiclePage
}

// Generate a unique event ID for deduplication
const generateEventId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

export const trackFacebookEvent = async (eventName: string, options = {}) => {
  // Skip tracking if not on main calculator page
  if (!shouldTrackEvent()) {
    if (process.env.NODE_ENV === 'development') {
      console.log('Skipping tracking - not on main calculator page')
    }
    return
  }

  try {
    const eventId = generateEventId()

    // Track via browser Pixel
    if (typeof window !== 'undefined' && window.fbq) {
      // Use trackCustom for custom events, track for standard events
      const isStandardEvent = [
        'PageView',
        'ViewContent',
        'Lead',
        'Purchase',
        'AddToCart',
        'CompleteRegistration',
        'Contact'
      ].includes(eventName)

      if (isStandardEvent) {
        window.fbq('track', eventName, { ...options, eventID: eventId })
      } else {
        window.fbq('trackCustom', eventName, { ...options, eventID: eventId })
      }

      if (process.env.NODE_ENV === 'development') {
        console.log(`Successfully tracked Facebook ${isStandardEvent ? 'standard' : 'custom'} event:`, eventName, { ...options, eventID: eventId })
      }
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Facebook Pixel not initialized')
      }
    }

    // Track via Conversions API
    try {
      const response = await fetch('/api/meta/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_name: eventName,
          event_id: eventId,
          event_source_url: window.location.href,
          custom_data: options,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send server-side event')
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('Successfully sent server-side event:', eventName)
      }
    } catch (serverError) {
      console.error('Server-side tracking failed:', serverError)
    }
  } catch (error) {
    console.error('Failed to track Facebook event:', error)
    if (process.env.NODE_ENV === 'development') {
      console.error('Event details:', { eventName, options })
    }
  }
} 