'use client'

import React, { useState, useEffect } from 'react'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Switch } from '../../components/ui/switch'

interface RoadTripTollsInputProps {
  value: number;
  onChange: (value: number) => void;
}

export function RoadTripTollsInput({ value, onChange }: RoadTripTollsInputProps) {
  const [hasTolls, setHasTolls] = useState(false)
  const [tollAmount, setTollAmount] = useState(value.toString())
  
  // Initialize state based on value
  useEffect(() => {
    setHasTolls(value > 0)
    setTollAmount(value > 0 ? value.toString() : '0.00')
  }, [])
  
  // Handle toll switch toggle
  const handleTollToggle = (checked: boolean) => {
    setHasTolls(checked)
    
    if (!checked) {
      // If turning off tolls, set value to 0
      onChange(0)
      setTollAmount('0.00')
    } else if (tollAmount) {
      // If turning on tolls and we have an amount, update parent
      onChange(parseFloat(tollAmount) || 0)
    }
  }
  
  // Handle toll amount change
  const handleTollAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setTollAmount(newValue)
    
    // Only update parent if we have tolls enabled
    if (hasTolls) {
      const numericValue = parseFloat(newValue) || 0
      onChange(numericValue)
    }
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Switch
          id="has-tolls"
          checked={hasTolls}
          onCheckedChange={handleTollToggle}
          className="data-[state=checked]:bg-green-600"
        />
        <Label htmlFor="has-tolls" className="text-gray-700 font-medium">Route includes tolls</Label>
      </div>
      
      {hasTolls && (
        <div className="space-y-2 bg-green-50 p-3 rounded-lg border border-green-100 animate-in fade-in">
          <Label htmlFor="toll-amount" className="text-gray-700 font-medium">Total Toll Amount ($)</Label>
          <Input
            id="toll-amount"
            type="number"
            min="0"
            step="0.01"
            value={tollAmount}
            onChange={handleTollAmountChange}
            placeholder="0.00"
            className="bg-white border-gray-200 w-32 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
          />
        </div>
      )}
    </div>
  )
} 