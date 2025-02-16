import { Metadata } from 'next'
import FuelSavingsCalculator from '../components/FuelSavingsCalculator'
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Calculator, DollarSign } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Fuel Savings Calculator | Compare Vehicle Fuel Costs',
  description: 'Calculate and compare fuel costs between different vehicles. See potential savings over time with our interactive fuel cost savings comparison tool.',
  keywords: 'fuel savings calculator, gas savings calculator, ev savings calculator, gas vs electric car cost, vehicle fuel cost comparison, hybrid vs gas calculator, fuel efficiency savings, car fuel cost comparison',
}

export default function FuelSavingsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="relative mb-12 bg-gradient-to-r from-blue-900 to-blue-800 rounded-2xl p-8 overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 font-heading">
            Fuel Savings Calculator
          </h1>
          <p className="text-blue-100 text-lg md:text-xl font-heading max-w-2xl">
            Compare fuel costs between vehicles and see your potential savings over time
          </p>
        </div>
        {/* Decorative calculator icon */}
        <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4">
          <Calculator size={300} />
        </div>
      </div>

      {/* Calculator Card */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="border-b border-gray-700">
          <CardTitle className="text-white flex items-center gap-2 text-2xl">
            <DollarSign className="h-6 w-6 text-green-400" />
            Calculate Your Fuel Savings
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 font-heading">
          <FuelSavingsCalculator />
        </CardContent>
      </Card>
    </div>
  )
} 