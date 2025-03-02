import React from 'react'

export default function EmbedHeader() {
  return (
    <div className="w-full bg-gradient-to-r from-blue-900 to-blue-800 text-white border-b border-blue-700">
      {/* Main Header Container */}
      <div className="px-4 py-3 text-center">
        {/* App Title with Subscript */}
        <h1 className="text-2xl font-bold font-heading flex flex-wrap items-baseline justify-center gap-x-2">
          Interactive Fuel Savings Calculator
          <span className="text-xs text-blue-200 font-normal whitespace-nowrap">
            by mpgcalculator.net
          </span>
        </h1>
      </div>
    </div>
  )
} 