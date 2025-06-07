'use client'

import React from 'react'
import { POI_CATEGORIES } from '../utils/overpassService'
import { Droplet, Zap, Utensils, Camera, BedDouble } from 'lucide-react'

interface MapPOIControlsProps {
  activeLayers: string[];
  onChange: (newLayers: string[]) => void;
  [key: string]: any; // Allow additional props like data-testid
}

// POI category controls displayed outside the map
export default function MapPOIControls({ activeLayers, onChange, ...props }: MapPOIControlsProps) {
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
        console.log(`Map sync update: ${layerId} -> ${isActive ? 'active' : 'inactive'}, found ${otherButtons.length} buttons`);
        
        otherButtons.forEach(btn => {
          btn.setAttribute('data-active', isActive ? 'true' : 'false');
          btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
          
          // Handle different styling approaches
          const parent = btn.closest('[data-testid]')?.getAttribute('data-testid');
          if (parent === 'route-poi-controls') {
            // For route controls (under destination)
            if (isActive) {
              btn.classList.add('poi-control-active', 'bg-blue-600', 'text-white', 'shadow-inner');
              btn.classList.remove('bg-gray-700', 'text-gray-300', 'hover:bg-gray-600');
            } else {
              btn.classList.remove('poi-control-active', 'bg-blue-600', 'text-white', 'shadow-inner');
              btn.classList.add('bg-gray-700', 'text-gray-300', 'hover:bg-gray-600');
            }
          }
        });
      }, 10);
    }
  };
  
  // Get the appropriate icon component for each category
  const getIconComponent = (categoryId: string) => {
    switch (categoryId) {
      case 'gasStations': return <Droplet className="w-4 h-4" />;
      case 'evCharging': return <Zap className="w-4 h-4" />;
      case 'hotels': return <BedDouble className="w-4 h-4" />;
      case 'restaurants': return <Utensils className="w-4 h-4" />;
      case 'attractions': return <Camera className="w-4 h-4" />;
      default: return <Droplet className="w-4 h-4" />;
    }
  };
  
  return (
    // Positioned OUTSIDE the map container as a separate UI element
    <div 
      className="w-full bg-gray-800 bg-opacity-100 border-b border-gray-700 py-2 shadow-md relative z-50" 
      data-testid="map-poi-controls"
      {...props}
    >
      <div className="max-w-screen-lg mx-auto flex justify-end gap-3 px-4">
        {POI_CATEGORIES.map(category => (
          <button
            key={category.id}
            onClick={() => toggleLayer(category.id)}
            className={`poi-control-button flex items-center justify-center p-1.5 rounded-md transition-all group relative ${
              activeLayers.includes(category.id) 
                ? 'bg-opacity-90 poi-control-active'
                : 'bg-opacity-60 hover:bg-opacity-80'
            }`}
            style={{
              backgroundColor: activeLayers.includes(category.id) 
                ? category.color 
                : 'rgba(255, 255, 255, 0.8)',
              color: activeLayers.includes(category.id) ? 'white' : 'black',
            }}
            data-poi-id={category.id}
            data-active={activeLayers.includes(category.id) ? "true" : "false"}
            aria-pressed={activeLayers.includes(category.id) ? "true" : "false"}
          >
            {getIconComponent(category.id)}
            
            {/* Custom tooltip that appears ABOVE the icon */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="bg-gray-900 text-white text-xs py-1 px-2 rounded shadow-lg whitespace-nowrap">
                {category.name}
                {/* Small triangle pointing down */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
} 