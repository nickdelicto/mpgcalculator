'use client'

import React, { useEffect } from 'react'
import { POI_CATEGORIES } from '../utils/overpassService'
import { Droplet, Zap, Utensils, Camera, BedDouble } from 'lucide-react'

interface POIControlsBarProps {
  activeLayers: string[];
  onChange: (layers: string[]) => void;
  [key: string]: any; // Allow additional props like data-testid
}

export default function POIControlsBar({ activeLayers, onChange, ...props }: POIControlsBarProps) {
  // Toggle a layer on/off
  const toggleLayer = (layerId: string) => {
    // Get the new active layers list
    const newLayers = activeLayers.includes(layerId)
      ? activeLayers.filter(id => id !== layerId)
      : [...activeLayers, layerId];
    
    // Update the parent component state
    onChange(newLayers);
    
    // Additionally, immediately sync the visual state of buttons
    // without waiting for the state to propagate
    if (typeof window !== 'undefined') {
      const isActive = newLayers.includes(layerId);
      
      // Find all buttons with this layerId
      setTimeout(() => {
        const otherButtons = document.querySelectorAll(`.poi-control-button[data-poi-id="${layerId}"]`);
        console.log(`Sync update: ${layerId} -> ${isActive ? 'active' : 'inactive'}, found ${otherButtons.length} buttons`);
        
        otherButtons.forEach(btn => {
          btn.setAttribute('data-active', isActive ? 'true' : 'false');
          btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });
      }, 10);
    }
  };
  
  // Log active layers for debugging
  useEffect(() => {
    console.log('POIControlsBar active layers:', activeLayers);
  }, [activeLayers]);
  
  // Get appropriate icon for a category
  const getIconComponent = (categoryId: string) => {
    switch (categoryId) {
      case 'gasStations': return Droplet;
      case 'evCharging': return Zap;
      case 'hotels': return BedDouble;
      case 'restaurants': return Utensils;
      case 'attractions': return Camera;
      default: return Droplet;
    }
  };
  
  return (
    <div className="w-full mt-2 mb-4" {...props}>
      <div className="text-sm text-gray-300 mb-2">Show on map:</div>
      <div className="flex flex-wrap items-center gap-2">
        {POI_CATEGORIES.map(category => {
          const isActive = activeLayers.includes(category.id);
          const IconComponent = getIconComponent(category.id);
          
          return (
            <button
              key={category.id}
              onClick={() => toggleLayer(category.id)}
              className={`relative flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-all poi-control-button ${
                isActive 
                  ? 'bg-blue-600 text-white poi-control-active shadow-inner' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              aria-pressed={isActive ? "true" : "false"}
              data-active={isActive ? "true" : "false"}
              data-poi-id={category.id}
            >
              <IconComponent className="h-3.5 w-3.5" />
              <span>{category.name}</span>
              
              {/* Small indicator for active state */}
              {isActive && (
                <span className="ml-1 w-2 h-2 bg-yellow-400 rounded-full"></span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
} 