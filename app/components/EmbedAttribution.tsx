import React, { useRef, useState, useEffect } from 'react'
import { useAttributionProtection } from '../hooks/useAttributionProtection'
import EmbedDisabledOverlay from './EmbedDisabledOverlay'

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
            color: '#6366f1',
            textDecoration: 'none',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            padding: '4px 8px',
            borderRadius: '4px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(4px)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontWeight: 500,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
          className="hover:translate-y-[-1px] hover:shadow-md hover:border-indigo-400/40"
        >
          <svg 
            width="14" 
            height="14" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            style={{ marginRight: '4px' }}
          >
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
          Powered by mpgcalculator.net
        </a>
      </div>

      <EmbedDisabledOverlay isVisible={isDisabled} />
    </>
  )
} 