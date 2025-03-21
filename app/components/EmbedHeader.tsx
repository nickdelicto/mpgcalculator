import React from 'react'

export default function EmbedHeader() {
  return (
    <div className="w-full bg-gradient-to-r from-[#057C57] to-[#046A4A] text-[#EDEDED] border-b border-[#046A4A]">
      {/* Main Header Container */}
      <div className="px-4 py-3 text-center">
        {/* App Title with Subscript */}
        <h1 className="text-2xl font-bold font-heading flex flex-wrap items-baseline justify-center gap-x-2">
          Interactive Fuel Savings Calculator
          <span className="text-xs text-[#E77C00] font-normal whitespace-nowrap">
            by mpgcalculator.net
          </span>
        </h1>
      </div>
    </div>
  )
} 