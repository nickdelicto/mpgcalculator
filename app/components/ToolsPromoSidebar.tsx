'use client'

import React from 'react';

interface ToolsPromoSidebarProps {
  className?: string; // Additional classes for container styling
  width?: string;     // Width class override (default is w-full for mobile, specified width for desktop)
}

/**
 * Sidebar component that promotes different calculator tools
 * Can be used on any page and supports custom width classes
 * Features:
 * - Hidden scrollbars with scroll functionality
 * - Stops at footer
 * - Responsive sizing
 */
export default function ToolsPromoSidebar({ className = "", width = "lg:w-1/3" }: ToolsPromoSidebarProps) {
  return (
    <div className={`w-full ${width} ${className}`}>
      {/* Using sticky instead of fixed, with both top and bottom constraints */}
      <div className="sticky top-24 w-full">
        {/* Scrollable container with hidden scrollbar */}
        <div 
          className="overflow-y-auto pr-4 w-full" 
          style={{ 
            maxHeight: 'calc(110vh - 180px)', 
            scrollbarWidth: 'none', /* Firefox */
            msOverflowStyle: 'none',  /* IE/Edge */
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {/* Webkit scrollbar hiding */}
          <style dangerouslySetInnerHTML={{ __html: `
            .overflow-y-auto::-webkit-scrollbar {
              display: none;
            }
          `}} />
          
          <div className="space-y-6 py-4 pb-8">
            {/* Tool Promo Cards */}
            
            {/* Road Trip Cost Calculator */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg overflow-hidden border border-indigo-400 hover:shadow-xl transition-all transform hover:-translate-y-1">
              <div className="px-6 py-5">
                <div className="inline-block bg-yellow-400 text-indigo-900 font-bold text-xs px-3 py-1 rounded-full mb-3">FEATURED TOOL</div>
                <h3 className="text-xl font-bold text-white mb-2">Road Trip Cost Calculator</h3>
                <p className="text-indigo-100 text-sm mb-4">Plan your journey, calculate fuel costs, and find routes & hotels with our interactive trip planner.</p>
                <div className="flex items-center justify-between">
                  <a href="/road-trip-cost-calculator" className="inline-flex items-center font-semibold text-white hover:text-yellow-200 text-sm">
                    Try it now
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                  <div className="w-12 h-12 flex items-center justify-center bg-indigo-700 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Fuel Savings Calculator */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg overflow-hidden border border-green-400 hover:shadow-xl transition-all transform hover:-translate-y-1">
              <div className="px-6 py-5">
                <div className="inline-block bg-emerald-200 text-emerald-900 font-bold text-xs px-3 py-1 rounded-full mb-3">SAVE MONEY</div>
                <h3 className="text-xl font-bold text-white mb-2">Fuel Savings Calculator</h3>
                <p className="text-green-100 text-sm mb-4">Compare vehicles and see how much you could save with better fuel efficiency.</p>
                <div className="flex items-center justify-between">
                  <a href="/fuel-savings-calculator" className="inline-flex items-center font-semibold text-white hover:text-emerald-200 text-sm">
                    Calculate savings
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                  <div className="w-12 h-12 flex items-center justify-center bg-green-700 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Vehicle MPG Comparison */}
            <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl shadow-lg overflow-hidden border border-blue-400 hover:shadow-xl transition-all transform hover:-translate-y-1">
              <div className="px-6 py-5">
                <div className="inline-block bg-blue-200 text-blue-900 font-bold text-xs px-3 py-1 rounded-full mb-3">COMPARE</div>
                <h3 className="text-xl font-bold text-white mb-2">Vehicle MPG Comparison</h3>
                <p className="text-blue-100 text-sm mb-4">Compare fuel efficiency between different vehicles side by side.</p>
                <div className="flex items-center justify-between">
                  <a href="/compare-vehicle-mpg" className="inline-flex items-center font-semibold text-white hover:text-blue-200 text-sm">
                    Compare now
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                  <div className="w-12 h-12 flex items-center justify-center bg-blue-700 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Vehicle MPG Checker */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-600 rounded-xl shadow-lg overflow-hidden border border-orange-400 hover:shadow-xl transition-all transform hover:-translate-y-1">
              <div className="px-6 py-5">
                <div className="inline-block bg-amber-200 text-amber-900 font-bold text-xs px-3 py-1 rounded-full mb-3">QUICK CHECK</div>
                <h3 className="text-xl font-bold text-white mb-2">Vehicle MPG Checker</h3>
                <p className="text-orange-100 text-sm mb-4">Find the official fuel economy rating for any vehicle make and model.</p>
                <div className="flex items-center justify-between">
                  <a href="/vehicle-mpg-checker" className="inline-flex items-center font-semibold text-white hover:text-amber-200 text-sm">
                    Check a vehicle
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                  <div className="w-12 h-12 flex items-center justify-center bg-orange-700 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 