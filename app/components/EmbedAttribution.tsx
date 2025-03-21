import React, { useRef, useState, useEffect } from 'react'
import { useAttributionProtection } from '../hooks/useAttributionProtection'
import EmbedDisabledOverlay from './EmbedDisabledOverlay'
import Image from 'next/image'

export default function EmbedAttribution() {
  const attributionRef = useRef<HTMLDivElement>(null)
  const isDisabled = useAttributionProtection(attributionRef)
  const [origin, setOrigin] = useState('')

  // Set the origin on the client side only
  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  return (
    <>
      <div 
        ref={attributionRef}
        style={{
          position: 'fixed',
          bottom: '8px',
          right: '8px',
          fontSize: '12px',
          zIndex: 100,
          transform: 'translateZ(0)',
          willChange: 'transform'
        }}
      >
        <a 
          href={origin || '#'} // Fallback to # during SSR
          target="_blank"
          rel="noopener"
          style={{
            color: '#057C57',
            textDecoration: 'none',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            padding: '4px 8px',
            borderRadius: '4px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(4px)',
            border: '1px solid rgba(5, 124, 87, 0.2)',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontWeight: 500,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
          className="hover:translate-y-[-1px] hover:shadow-md hover:border-[#057C57]/40"
        >
          <Image
            src="/favicon.png"
            alt="MPGCalculator.net favicon"
            width={14}
            height={14}
            style={{ marginRight: '4px' }}
          />
          Powered by mpgcalculator.net
        </a>
      </div>

      <EmbedDisabledOverlay isVisible={isDisabled} />
    </>
  )
} 