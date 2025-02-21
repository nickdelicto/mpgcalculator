'use client'

import React from 'react'
import FuelSavingsCalculator from '../components/FuelSavingsCalculator'

export default function EmbedCalculator() {
  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      {/* Minimal branding */}
      <div className="text-xs text-gray-400 mb-2 flex items-center justify-between">
        <span>MPG Calculator</span>
        <a 
          href="https://your-site.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:text-blue-400 transition-colors"
        >
          Powered by Your Site
        </a>
      </div>
      
      {/* Calculator Component */}
      <FuelSavingsCalculator />
      
      {/* Optional: Add message listener for responsive sizing */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.addEventListener('message', function(e) {
              if (e.data.type === 'resize') {
                // Handle resize message from parent
                document.body.style.height = e.data.height + 'px';
              }
            });
          `
        }}
      />
    </div>
  )
} 