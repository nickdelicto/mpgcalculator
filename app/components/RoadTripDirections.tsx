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
  <path d="M12 0C5.383 0 0 5.383 0 12C0 20.383 12 36 12 36C12 36 24 20.383 24 12C24 5.383 18.617 0 12 0Z" fill="#00a000"/>
  <circle cx="12" cy="12" r="8" fill="white"/>
  <circle cx="12" cy="12" r="4" fill="#00a000"/>
</svg>
`;

const END_MARKER_SVG = `
<svg width="28" height="36" viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="0" width="4" height="32" fill="#666"/>
  <rect x="6" y="0" width="20" height="20" fill="#FF3B30"/>
  <circle cx="16" cy="10" r="6" fill="white"/>
  <path d="M16 6L20 10L16 14L12 10L16 6Z" fill="#FF3B30"/>
</svg>
`;

const RoadTripDirections: React.FC<DirectionsProps> = ({ steps, unitSystem }) => {
  // Create a copy of steps to avoid mutating props
  const displaySteps = [...steps].reverse();
  
  return (
    <div className="space-y-3 pr-2 py-2">
      {/* Directions timeline */}
      <div className="relative">
        {displaySteps && displaySteps.map((step, index) => {
          // In reversed order, the last index is the first step and vice versa
          const isFirstStep = index === displaySteps.length - 1;
          const isLastStep = index === 0;
          const isMiddleStep = !isFirstStep && !isLastStep;
          
          // Special styling for first and last steps (maintaining the green/red)
          const bgColor = isFirstStep 
            ? 'bg-gradient-to-r from-green-700 to-green-600' 
            : isLastStep 
              ? 'bg-gradient-to-r from-red-700 to-red-600' 
              : 'bg-gray-100';
          
          const textColor = isFirstStep || isLastStep ? 'text-white' : 'text-gray-800';
          const subTextColor = isFirstStep || isLastStep ? 'text-gray-200' : 'text-gray-500';
          
          // Timeline connector line (shown between steps)
          const showConnector = index < displaySteps.length - 1;
          
          return (
            <React.Fragment key={index}>
              <div className={`p-3 ${bgColor} rounded-lg shadow-sm flex items-start mb-2 ${isMiddleStep ? 'border border-gray-200 hover:shadow-md transition-shadow duration-200' : ''}`}>
                {/* Special marker for first/last step, regular icon for other steps */}
                {isFirstStep ? (
                  <div className="mr-3 mt-1 flex-shrink-0 h-8 w-6 drop-shadow-sm" dangerouslySetInnerHTML={{ __html: START_MARKER_SVG }} />
                ) : isLastStep ? (
                  <div className="mr-3 mt-1 flex-shrink-0 h-8 w-7 drop-shadow-sm" dangerouslySetInnerHTML={{ __html: END_MARKER_SVG }} />
                ) : (
                  <div className="mr-3 mt-1 bg-blue-600 rounded-full p-1.5 flex-shrink-0 shadow-sm">
                    <div className="text-white">
                      {getInstructionIcon(step.type)}
                    </div>
                  </div>
                )}
                
                <div className="flex-1">
                  <p className={`font-medium ${textColor}`}>
                    {isFirstStep ? 'Start' : isLastStep ? 'Arrive at destination' : step.instruction}
                  </p>
                  <div className="flex items-center mt-1">
                    <span className={`text-xs ${subTextColor} font-medium`}>
                      {formatDistance(step.distance, unitSystem)}
                    </span>
                    <span className={`text-xs ${subTextColor} mx-1`}>•</span>
                    <span className={`text-xs ${subTextColor}`}>
                      {formatDuration(step.duration)}
                    </span>
                  </div>
                </div>
                
                {/* Distance badge for middle steps */}
                {isMiddleStep && (
                  <div className="ml-2 bg-white border border-gray-200 rounded-full px-2 py-1 text-xs text-gray-600 self-center">
                    {formatDistance(step.distance, unitSystem)}
                  </div>
                )}
              </div>
              
              {/* Connector line */}
              {showConnector && (
                <div className="h-4 w-0.5 bg-gray-300 ml-4 mb-1"></div>
              )}
            </React.Fragment>
          );
        })}
      </div>
      
      {/* Total trip stats */}
      {steps && steps.length > 0 && (
        <div className="bg-white rounded-lg p-4 border border-gray-200 mt-4 shadow-sm flex justify-between">
          <div className="text-sm text-gray-700">
            <span className="font-medium">Total Distance:</span> {formatDistance(steps.reduce((total, step) => total + step.distance, 0), unitSystem)}
          </div>
          <div className="text-sm text-gray-700">
            <span className="font-medium">Total Time:</span> {formatDuration(steps.reduce((total, step) => total + step.duration, 0))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoadTripDirections; 