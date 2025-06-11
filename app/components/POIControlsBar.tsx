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
  
  // Get color for a category
  const getCategoryColor = (categoryId: string, isActive: boolean) => {
    // Base colors for each category
    const colors = {
      gasStations: { bg: 'bg-blue-500', gradient: 'from-blue-500 to-blue-600', hover: 'hover:from-blue-600 hover:to-blue-700', light: 'bg-blue-100' },
      evCharging: { bg: 'bg-teal-500', gradient: 'from-teal-500 to-teal-600', hover: 'hover:from-teal-600 hover:to-teal-700', light: 'bg-teal-100' },
      hotels: { bg: 'bg-indigo-500', gradient: 'from-indigo-500 to-indigo-600', hover: 'hover:from-indigo-600 hover:to-indigo-700', light: 'bg-indigo-100' },
      restaurants: { bg: 'bg-orange-500', gradient: 'from-orange-500 to-orange-600', hover: 'hover:from-orange-600 hover:to-orange-700', light: 'bg-orange-100' },
      attractions: { bg: 'bg-purple-500', gradient: 'from-purple-500 to-purple-600', hover: 'hover:from-purple-600 hover:to-purple-700', light: 'bg-purple-100' },
    };
    
    const defaultColors = { bg: 'bg-gray-500', gradient: 'from-gray-500 to-gray-600', hover: 'hover:from-gray-600 hover:to-gray-700', light: 'bg-gray-100' };
    
    return colors[categoryId as keyof typeof colors] || defaultColors;
  };
  
  return (
    <div className="w-full mt-2" {...props}>
      <div className="flex flex-wrap items-center gap-2">
        {POI_CATEGORIES.map(category => {
          const isActive = activeLayers.includes(category.id);
          const IconComponent = getIconComponent(category.id);
          const colors = getCategoryColor(category.id, isActive);
          
          return (
            <button
              key={category.id}
              onClick={() => toggleLayer(category.id)}
              className={`relative flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-all poi-control-button shadow-sm ${
                isActive 
                  ? `bg-gradient-to-r ${colors.gradient} text-white shadow-md` 
                  : `${colors.light} text-gray-700 hover:bg-gray-200 border border-gray-200`
              }`}
              aria-pressed={isActive ? "true" : "false"}
              data-active={isActive ? "true" : "false"}
              data-poi-id={category.id}
            >
              <IconComponent className={`h-3.5 w-3.5 ${isActive ? 'text-white' : `text-${colors.bg.split('-')[1]}-600`}`} />
              <span>{category.name}</span>
              
              {/* Small indicator for active state */}
              {isActive && (
                <span className="ml-1 w-2 h-2 bg-white rounded-full"></span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
} 