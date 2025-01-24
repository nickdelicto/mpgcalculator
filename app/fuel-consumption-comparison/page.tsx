import { Metadata } from 'next'
import VehicleLookup from '../components/VehicleLookup'

export const metadata: Metadata = {
  title: 'Vehicle Fuel Consumption Comparison | Compare MPG Between Cars',
  description: 'Compare fuel consumption and MPG between different vehicles. Find and compare fuel efficiency, emissions, and specifications for various car models.',
  keywords: 'fuel consumption comparison, fuel consumption calculator by car model, vehicle MPG comparison, car fuel efficiency, compare car fuel economy',
}

export default function FuelConsumptionComparison() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-6">
        Vehicle Fuel Consumption Comparison
      </h1>
      <VehicleLookup />
    </div>
  )
} 