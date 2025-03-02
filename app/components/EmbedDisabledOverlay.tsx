import React from 'react'

interface EmbedDisabledOverlayProps {
  isVisible: boolean;
}

export default function EmbedDisabledOverlay({ isVisible }: EmbedDisabledOverlayProps) {
  if (!isVisible) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(255,255,255,0.98)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        padding: '20px',
        textAlign: 'center',
        transition: 'opacity 0.3s ease',
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? 'all' : 'none',
      }}
    >
      {/* Warning Icon */}
      <svg 
        width="48" 
        height="48" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="#EF4444" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>

      {/* Message */}
      <h3 
        style={{
          color: '#1F2937',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          margin: '16px 0 8px',
          fontSize: '1.5rem',
          fontWeight: 600
        }}
      >
        Calculator Disabled
      </h3>
      <p 
        style={{
          color: '#4B5563',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          margin: 0,
          maxWidth: '400px',
          fontSize: '1rem',
          lineHeight: 1.5
        }}
      >
        This calculator requires proper attribution to function. Please ensure the attribution link is visible and unmodified.
      </p>
    </div>
  )
} 