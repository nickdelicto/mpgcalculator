'use client'

import React from 'react';
import { RouteStep } from '../utils/routingService';
import { ArrowRight, ArrowLeft, ArrowUp, CornerUpRight, CornerUpLeft, ChevronRight } from 'lucide-react';

interface DirectionsProps {
  steps: RouteStep[];
  unitSystem: 'imperial' | 'metric';
}

// Map instruction types to icons
const getInstructionIcon = (type: number) => {
  switch(type) {
    case 0: return <ArrowLeft className="h-4 w-4" />; // Left turn
    case 1: return <ArrowRight className="h-4 w-4" />; // Right turn
    case 6: return <ArrowUp className="h-4 w-4" />; // Continue straight
    case 7: return <CornerUpRight className="h-4 w-4" />; // Enter roundabout
    case 10: return <ChevronRight className="h-4 w-4" />; // Arrive
    case 11: return <ArrowUp className="h-4 w-4" />; // Head in direction
    case 12: return <ArrowLeft className="h-4 w-4" />; // Keep left
    case 13: return <ArrowRight className="h-4 w-4" />; // Keep right
    default: return <ArrowUp className="h-4 w-4" />; // Default
  }
};

// Format distance in user-friendly way based on unit system
const formatDistance = (meters: number, unitSystem: 'imperial' | 'metric'): string => {
  if (unitSystem === 'metric') {
    // Metric units (meters/kilometers)
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    } else {
      return `${(meters / 1000).toFixed(1)} km`;
    }
  } else {
    // Imperial units (feet/miles)
    const feet = meters * 3.28084;
    if (feet < 528) { // Less than 0.1 miles (528 feet)
      return `${Math.round(feet)} ft`;
    } else {
      const miles = meters * 0.000621371;
      return `${miles.toFixed(1)} mi`;
    }
  }
};

// Format duration in user-friendly way
const formatDuration = (seconds: number): string => {
  if (seconds < 60) {
    return `${Math.round(seconds)} sec`;
  } else if (seconds < 3600) {
    return `${Math.round(seconds / 60)} min`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.round((seconds % 3600) / 60);
    return `${hours} hr ${mins} min`;
  }
};

// Define SVG icons for start and end markers to match the map
const START_MARKER_SVG = `
<svg width="24" height="36" viewBox="0 0 24 36" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 0C5.383 0 0 5.383 0 12C0 20.383 12 36 12 36C12 36 24 20.383 24 12C24 5.383 18.617 0 12 0Z" fill="#008000"/>
  <circle cx="12" cy="12" r="6" fill="white"/>
</svg>
`;

const END_MARKER_SVG = `
<svg width="28" height="32" viewBox="0 0 28 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="0" width="4" height="32" fill="#666"/>
  <rect x="6" y="0" width="20" height="20" fill="#FF3B30"/>
  <rect x="6" y="0" width="10" height="10" fill="white"/>
  <rect x="16" y="10" width="10" height="10" fill="white"/>
</svg>
`;

const RoadTripDirections: React.FC<DirectionsProps> = ({ steps, unitSystem }) => {
  return (
    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
      {steps && steps.map((step, index) => {
        // Determine if this is first step (departure) or last step (arrival)
        const isFirstStep = index === 0;
        const isLastStep = index === steps.length - 1;
        
        // Special styling for first and last steps
        const bgColor = isFirstStep ? 'bg-green-800' : isLastStep ? 'bg-red-800' : 'bg-gray-700';
        
        return (
          <div key={index} className={`p-2 ${bgColor} rounded flex items-start`}>
            {/* Special marker for first/last step, regular icon for other steps */}
            {isFirstStep ? (
              <div className="mr-3 mt-1 flex-shrink-0 h-8 w-6" dangerouslySetInnerHTML={{ __html: START_MARKER_SVG }} />
            ) : isLastStep ? (
              <div className="mr-3 mt-1 flex-shrink-0 h-8 w-7" dangerouslySetInnerHTML={{ __html: END_MARKER_SVG }} />
            ) : (
              <div className="mr-3 mt-1 bg-blue-500 rounded-full p-1 flex-shrink-0">
                {getInstructionIcon(step.type)}
              </div>
            )}
            
            <div className="flex-1">
              <p className="text-white font-medium">
                {isFirstStep ? 'Start' : isLastStep ? 'Arrive at destination' : step.instruction}
              </p>
              <p className="text-xs text-gray-300">
                {formatDistance(step.distance, unitSystem)} • {formatDuration(step.duration)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RoadTripDirections; 