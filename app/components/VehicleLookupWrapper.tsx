'use client'

import React from 'react'
import VehicleLookup from './VehicleLookup'
import { Vehicle } from '../types/vehicle'

// Helper function to normalize text for URLs
function normalizeForUrl(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')  // Replace all non-alphanumeric chars with space
    .replace(/\s+/g, ' ')        // Replace multiple spaces with single space
    .trim()                      // Trim leading/trailing spaces
    .replace(/\s/g, '-')         // Convert spaces to hyphens for URL-friendly format
}

export default function VehicleLookupWrapper() {
  const handleVehicleSelect = (vehicle: Vehicle) => {
    const normalizedMake = normalizeForUrl(vehicle.make)
    const normalizedModel = normalizeForUrl(vehicle.model)
    window.location.href = `/vehicles/${vehicle.year}-${normalizedMake}-${normalizedModel}-mpg`
  }

  return (
    <VehicleLookup 
      onVehicleSelect={handleVehicleSelect}
      showAddComparison={true}
    />
  )
} 