'use client'

import React, { useEffect, useRef } from 'react'

// Add AdSense type definition
declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

interface AdUnitProps {
  id: string;                   // Unique identifier for this ad unit
  slot?: string;                // AdSense ad slot ID (when implemented)
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical'; // Ad format
  className?: string;           // Additional CSS classes
  placeholder?: boolean;        // Whether to show a placeholder in dev mode
}

// Map our format values to AdSense format values
const formatMap = {
  'auto': 'auto',
  'rectangle': 'rectangle',
  'horizontal': 'horizontal',
  'vertical': 'vertical'
};

// Google AdSense Publisher ID
const PUBLISHER_ID = 'ca-pub-4543471446143087';

/**
 * AdUnit component for displaying advertisements
 * 
 * This component renders Google AdSense ads and displays
 * placeholders in development mode for easier testing
 */
const AdUnit: React.FC<AdUnitProps> = ({
  id,
  slot = '',
  format = 'auto',
  className = '',
  placeholder = true
}) => {
  // Change to HTMLModElement to match the ins element
  const adRef = useRef<HTMLModElement>(null);
  
  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return;
    
    // Skip AdSense initialization in development if placeholder is true
    const isProduction = process.env.NODE_ENV === 'production';
    if (!isProduction && placeholder) return;
    
    // Skip if no slot ID is provided (we'll return to placeholder view)
    if (!slot && isProduction) {
      console.warn(`AdUnit ${id} has no slot ID. Skipping AdSense initialization.`);
      return;
    }
    
    try {
      // Wait for AdSense to be initialized
      if (adRef.current) {
        // Push the ad to AdSense for display
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (error) {
      console.error('Error initializing AdSense ad:', error);
    }
  }, [id, slot, placeholder]);

  // Display a placeholder in development
  const isProduction = process.env.NODE_ENV === 'production';
  const showPlaceholder = placeholder && !isProduction;
  
  // Determine ad size based on format
  let adStyle = {};
  if (format === 'horizontal') {
    adStyle = { minHeight: '90px', width: '100%' };
  } else if (format === 'vertical') {
    adStyle = { minHeight: '600px', width: '100%' };
  } else if (format === 'rectangle') {
    adStyle = { minHeight: '250px', width: '100%' };
  }
  
  return (
    <div 
      id={`ad-unit-${id}`}
      className={`ad-unit ${className}`}
      data-ad-format={format}
    >
      {showPlaceholder ? (
        <div className="ad-placeholder flex items-center justify-center bg-gray-700 text-white p-4 text-center" style={adStyle}>
          Ad Placeholder: {id} ({format})
        </div>
      ) : (
        // Display actual AdSense ad
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={adStyle}
          data-ad-client={PUBLISHER_ID}
          data-ad-slot={slot || ''}
          data-ad-format={formatMap[format]}
          data-full-width-responsive="true"
        />
      )}
    </div>
  );
};

export default AdUnit; 