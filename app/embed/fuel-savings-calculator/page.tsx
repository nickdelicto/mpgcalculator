'use client'

import React, { useEffect } from 'react'
import FuelSavingsCalculator from '../../components/FuelSavingsCalculator'
import EmbedHeader from '../../components/EmbedHeader'
import EmbedAttribution from '../../components/EmbedAttribution'

export default function EmbedCalculator() {
  useEffect(() => {
    // Track embed load
    fetch('/api/tracking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        referrer: document.referrer 
      })
    }).catch(err => console.error('Tracking error:', err))
  }, [])

  return (
    <div className="w-full">
      {/* Header */}
      <EmbedHeader />
      
      {/* Calculator Component */}
      <main className="p-4">
        <div className="w-full">
          <FuelSavingsCalculator />
        </div>
      </main>

      {/* Attribution - Now inside our iframe */}
      <EmbedAttribution />
    </div>
  )
} 