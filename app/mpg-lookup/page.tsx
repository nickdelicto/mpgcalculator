import { Metadata } from 'next'
import VehicleLookup from '../components/VehicleLookup'

export const metadata: Metadata = {
  title: 'Vehicle MPG Lookup | Fuel Consumption Calculator by Car Model',
  description: 'Lookup fuel consumption and MPG by car model. Find and compare fuel efficiency for various vehicle models.',
  keywords: 'fuel consumption comparison, fuel consumption calculator by car model, vehicle MPG lookup, car fuel efficiency, gas mileage calculator by make and model,',
}

export default function FuelConsumptionComparison() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-6 font-heading">
        Fuel Consumption Lookup by Car Model
      </h1>
      <VehicleLookup />
    </div>
  )
} 