import { useEffect, useState, useRef, RefObject } from 'react'

// Debounce helper
const debounce = (fn: Function, ms = 300) => {
  let timeoutId: ReturnType<typeof setTimeout>
  return function (this: any, ...args: any[]) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn.apply(this, args), ms)
  }
}

export function useAttributionProtection(attributionRef: RefObject<HTMLDivElement | null>) {
  const [isDisabled, setIsDisabled] = useState(false)
  const [origin, setOrigin] = useState('')
  
  useEffect(() => {
    console.log('🔄 Protection effect running, origin:', origin)
    
    // Only run on client side
    if (typeof window === 'undefined') {
      console.log('⏭ Skipping - Not client side')
      return
    }

    // Set origin
    setOrigin(window.location.origin)
    console.log('🌐 Origin set to:', window.location.origin)

    const element = attributionRef.current
    if (!element) {
      console.log('⚠️ No element found')
      return
    }

    const runAttributionCheck = () => {
      console.log('🔍 Running attribution check...')
      
      if (!element) {
        console.log('❌ Element no longer exists')
        setIsDisabled(true)
        return
      }

      const computedStyle = window.getComputedStyle(element)
      const linkStyle = window.getComputedStyle(element.querySelector('a') || element)
      const rect = element.getBoundingClientRect()
      
      // Enhanced visibility check
      const visibilityDetails = {
        display: computedStyle.display,
        visibility: computedStyle.visibility,
        opacity: parseFloat(computedStyle.opacity),
        height: rect.height,
        width: rect.width,
        elementPointerEvents: computedStyle.pointerEvents,
        linkPointerEvents: linkStyle.pointerEvents
      }

      const isVisible = 
        visibilityDetails.display !== 'none' &&
        visibilityDetails.visibility !== 'hidden' &&
        visibilityDetails.opacity > 0 &&
        visibilityDetails.height > 0 &&
        visibilityDetails.width > 0 &&
        visibilityDetails.elementPointerEvents !== 'none' &&
        visibilityDetails.linkPointerEvents !== 'none'

      console.log('👁 Visibility check:', { isVisible, ...visibilityDetails })
      
      // Position check
      const isPositionCorrect = 
        computedStyle.position === 'fixed' &&
        computedStyle.bottom === '8px' &&
        computedStyle.right === '8px'
      
      console.log('📍 Position check:', {
        isPositionCorrect,
        position: computedStyle.position,
        bottom: computedStyle.bottom,
        right: computedStyle.right
      })

      // Viewport check
      const isInViewport = 
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
      
      console.log('🖥 Viewport check:', {
        isInViewport,
        rectBottom: rect.bottom,
        viewportHeight: window.innerHeight,
        rectRight: rect.right,
        viewportWidth: window.innerWidth
      })

      // Z-index check
      const zIndex = parseInt(computedStyle.zIndex, 10)
      const hasValidZIndex = !isNaN(zIndex) && zIndex >= 100
      
      console.log('📚 Z-index check:', { hasValidZIndex, zIndex })

      // Link check
      const link = element.querySelector('a')
      const hasValidLink = origin ? (
        link &&
        link.href === origin + '/' &&
        link.getAttribute('target') === '_blank' &&
        link.getAttribute('rel')?.includes('noopener')
      ) : false

      console.log('🔗 Link check:', {
        hasValidLink,
        linkExists: !!link,
        actualUrl: link?.href,
        expectedUrl: origin + '/',
        target: link?.getAttribute('target'),
        rel: link?.getAttribute('rel')
      })

      const shouldDisable = 
        !isVisible ||
        !isPositionCorrect ||
        !isInViewport ||
        !hasValidZIndex ||
        !hasValidLink

      console.log('🚨 Final result:', {
        shouldDisable,
        currentlyDisabled: isDisabled,
        failedChecks: {
          visibility: !isVisible,
          position: !isPositionCorrect,
          viewport: !isInViewport,
          zIndex: !hasValidZIndex,
          link: !hasValidLink
        }
      })

      if (shouldDisable !== isDisabled) {
        console.log(`${shouldDisable ? '🔒' : '🔓'} Setting disabled state to:`, shouldDisable)
        setIsDisabled(shouldDisable)
      }
    }

    // Debounced version of the check
    const debouncedCheck = debounce(runAttributionCheck, 300)

    console.log('👀 Setting up observers...')
    
    // Set up mutation observer
    const mutationObserver = new MutationObserver((mutations) => {
      console.log('🔄 Mutation detected:', mutations.map(m => m.type))
      debouncedCheck()
    })
    mutationObserver.observe(element, {
      attributes: true,
      childList: true,
      subtree: true,
      characterData: true
    })

    // Set up resize observer
    const resizeObserver = new ResizeObserver(() => {
      console.log('📐 Resize detected')
      debouncedCheck()
    })
    resizeObserver.observe(element)

    // Set up visibility change listener
    document.addEventListener('visibilitychange', debouncedCheck)

    // Initial check after a longer delay to ensure complete render
    console.log('⏳ Scheduling initial check...')
    const initialCheck = setTimeout(runAttributionCheck, 500)

    // Cleanup
    return () => {
      console.log('🧹 Cleaning up observers and listeners')
      mutationObserver.disconnect()
      resizeObserver.disconnect()
      document.removeEventListener('visibilitychange', debouncedCheck)
      clearTimeout(initialCheck)
    }
  }, [attributionRef, origin, isDisabled])

  return isDisabled
} 