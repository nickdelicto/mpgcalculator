// Component for displaying vehicle efficiency timeline
'use client'

import { useEffect, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { Card, CardContent } from '../../components/ui/card'

interface TimelineDataPoint {
  year: number
  city_mpg: number
  highway_mpg: number
  combined_mpg: number
  phev_city_mpge: number | null
  phev_highway_mpge: number | null
  phev_combined_mpge: number | null
  co2_gpm: number | null
  best_combined_mpg: number
  efficiency_improvement_percent: number
}

interface TimelineSummary {
  total_years: number
  earliest_year: number
  latest_year: number
  total_improvement: number
}

interface TimelineResponse {
  timeline: TimelineDataPoint[]
  summary: TimelineSummary
}

interface VehicleTimelineProps {
  make: string
  model: string
  drive?: string
  fuelType1?: string
  fuelType2?: string | null
  transmission?: string
  displacement?: string
}

// Custom tooltip component for mobile-friendly display
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-lg max-w-[280px] text-sm">
        <div className="font-semibold text-white mb-2">{label}</div>
        
        {/* MPG Values */}
        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-400">Highway:</span>
            <span className="text-yellow-400 font-mono">{data.highway_mpg} MPG</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Combined:</span>
            <span className="text-green-400 font-mono">{data.best_combined_mpg} MPG</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">City:</span>
            <span className="text-blue-400 font-mono">{data.city_mpg} MPG</span>
          </div>
          {data.efficiency_improvement_percent !== 0 && (
            <div className="flex justify-between border-t border-gray-700 mt-2 pt-2">
              <span className="text-gray-400">Improvement:</span>
              <span className={`font-mono ${data.efficiency_improvement_percent > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {data.efficiency_improvement_percent > 0 ? '+' : ''}{data.efficiency_improvement_percent}%
              </span>
            </div>
          )}
        </div>
      </div>
    )
  }
  return null
}

export default function VehicleTimeline({ 
  make, 
  model, 
  drive,
  fuelType1,
  fuelType2,
  transmission,
  displacement 
}: VehicleTimelineProps) {
  const [data, setData] = useState<TimelineResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTimelineData = async () => {
      try {
        setLoading(true)
        const url = new URL('/api/vehicles/timeline-stats', window.location.origin)
        url.searchParams.append('make', make)
        url.searchParams.append('model', model)
        if (drive) url.searchParams.append('drive', drive)
        if (fuelType1) url.searchParams.append('fuelType1', fuelType1)
        if (fuelType2) url.searchParams.append('fuelType2', fuelType2)
        if (transmission) url.searchParams.append('transmission', transmission)
        if (displacement) url.searchParams.append('displacement', displacement)
        
        const response = await fetch(url.toString())
        if (!response.ok) throw new Error('Failed to fetch timeline data')
        
        const timelineData = await response.json()
        setData(timelineData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load timeline data')
      } finally {
        setLoading(false)
      }
    }

    fetchTimelineData()
  }, [make, model, drive, fuelType1, fuelType2, transmission, displacement])

  if (loading) return <div className="text-gray-400">Loading timeline data...</div>
  if (error) return <div className="text-red-400">Error: {error}</div>
  if (!data || data.timeline.length === 0) return null

  return (
    <div className="space-y-4 font-mono">
      <div className="h-[300px] text-white bg-gradient-to-br from-blue-900/90 to-blue-600/70 rounded-lg p-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data.timeline}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="year"
              stroke="#9CA3AF"
              tick={{ fill: '#9CA3AF' }}
            />
            <YAxis
              stroke="#9CA3AF"
              tick={{ fill: '#9CA3AF' }}
              label={{
                value: 'MPG / MPGe',
                angle: -90,
                position: 'insideLeft',
                fill: '#9CA3AF'
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="best_combined_mpg"
              name="Combined"
              stroke="#10B981"
              strokeWidth={2}
              dot={{ fill: '#10B981', r: 6 }}
              activeDot={{ r: 8 }}
            />
            <Line
              type="monotone"
              dataKey="city_mpg"
              name="City"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={{ fill: '#3B82F6', r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="highway_mpg"
              name="Highway"
              stroke="#F59E0B"
              strokeWidth={2}
              dot={{ fill: '#F59E0B', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Section */}
      {data.summary && data.summary.total_years > 1 && (
        <div className="text-sm text-blue-100">
          <p>
            Timeline spans {data.summary.total_years} years
            ({data.summary.earliest_year} - {data.summary.latest_year})
            {data.summary.total_improvement !== 0 && (
              <span className={data.summary.total_improvement > 0 ? 'text-green-400' : 'text-red-400'}>
                {' '}with a {data.summary.total_improvement > 0 ? '+' : ''}{data.summary.total_improvement}% efficiency change
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  )
} 