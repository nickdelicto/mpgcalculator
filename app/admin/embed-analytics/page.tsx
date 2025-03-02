'use client'

import { useEffect, useState } from 'react'
import { Card } from "../../../components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table"
import { formatDistanceToNow, format } from 'date-fns'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer
} from 'recharts'

interface EmbedStat {
  referrer_domain: string;
  first_seen: string;
  last_seen: string;
  total_loads: number;
}

interface DailyStat {
  date: string;
  total_loads: number;
  unique_domains: number;
}

interface DailyDetailedStat {
  date: string;
  referrer_domain: string;
  loads: number;
  first_seen: string;
  last_seen: string;
}

interface Stats {
  overall: EmbedStat[];
  daily: DailyStat[];
  dailyDetailed: DailyDetailedStat[];
}

export default function EmbedAnalytics() {
  const [stats, setStats] = useState<Stats>({ overall: [], daily: [], dailyDetailed: [] })
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedDomain, setSelectedDomain] = useState<string>('')
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [autoUpdate, setAutoUpdate] = useState(true)

  // Fetch stats function
  const fetchStats = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      if (selectedDate) params.append('date', selectedDate)
      if (selectedDomain) params.append('domain', selectedDomain)
      
      const response = await fetch(`/api/admin/stats?${params}`)
      const data = await response.json()
      setStats(data || { overall: [], daily: [], dailyDetailed: [] })
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Error fetching stats:', error)
      setStats({ overall: [], daily: [], dailyDetailed: [] })
    } finally {
      setIsLoading(false)
    }
  }

  // Manual refresh handler
  const handleRefresh = () => {
    fetchStats()
  }

  // Auto-update effect
  useEffect(() => {
    fetchStats()
    
    if (autoUpdate) {
      const interval = setInterval(fetchStats, 5 * 60 * 1000) // 5 minutes
      return () => clearInterval(interval)
    }
  }, [selectedDate, selectedDomain, autoUpdate])

  // Calculate stats only if data is available
  const totalLoads = stats?.overall?.reduce((sum, stat) => sum + stat.total_loads, 0) || 0
  const totalSites = stats?.overall?.length || 0

  // Get today's loads
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayLoads = stats?.overall?.reduce((sum, stat) => {
    const lastSeen = new Date(stat.last_seen)
    return lastSeen >= today ? sum + stat.total_loads : sum
  }, 0) || 0

  if (isLoading) {
    return <div className="container mx-auto py-8">Loading...</div>
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Embed Analytics Dashboard</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">
              Auto-update
              <input
                type="checkbox"
                checked={autoUpdate}
                onChange={(e) => setAutoUpdate(e.target.checked)}
                className="ml-2"
              />
            </label>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Updating...
              </>
            ) : (
              <>
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </>
            )}
          </button>
          <span className="text-sm text-gray-500">
            Last updated: {formatDistanceToNow(lastUpdated, { addSuffix: true })}
          </span>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Total Active Embeds</h3>
          <p className="text-3xl font-bold">{totalSites}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Total Loads Today</h3>
          <p className="text-3xl font-bold">{todayLoads.toLocaleString()}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Total Loads All Time</h3>
          <p className="text-3xl font-bold">{totalLoads.toLocaleString()}</p>
        </Card>
      </div>

      {/* Daily Stats Chart */}
      <Card className="mb-8">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-6">Daily Loads (Last 30 Days)</h2>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.daily}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => format(new Date(date), 'MMM d')}
                />
                <YAxis />
                <RechartsTooltip 
                  labelFormatter={(date) => format(new Date(date), 'MMM d, yyyy')}
                  formatter={(value: number) => [value.toLocaleString(), 'Loads']}
                />
                <Line 
                  type="monotone" 
                  dataKey="total_loads" 
                  stroke="#2563eb" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>

      {/* Daily Detailed Stats */}
      <Card className="mb-8">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Daily Detailed Stats</h2>
            <div className="flex gap-4">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border rounded"
              />
              <select
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                className="px-3 py-2 border rounded"
              >
                <option value="">All Domains</option>
                {stats.overall.map(stat => (
                  <option key={stat.referrer_domain} value={stat.referrer_domain}>
                    {stat.referrer_domain}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead className="text-right">Daily Loads</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.dailyDetailed.map((stat) => (
                <TableRow key={`${stat.date}-${stat.referrer_domain}`}>
                  <TableCell>{format(new Date(stat.date), 'MMM d, yyyy')}</TableCell>
                  <TableCell className="font-medium">{stat.referrer_domain}</TableCell>
                  <TableCell className="text-right">{stat.loads.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Overall Stats Table */}
      <Card className="mb-8">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Overall Embed Sources</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Domain</TableHead>
                <TableHead>First Seen</TableHead>
                <TableHead>Last Seen</TableHead>
                <TableHead className="text-right">Total Loads</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.overall.map((stat) => (
                <TableRow key={stat.referrer_domain}>
                  <TableCell className="font-medium">{stat.referrer_domain}</TableCell>
                  <TableCell>{formatDistanceToNow(new Date(stat.first_seen), { addSuffix: true })}</TableCell>
                  <TableCell>{formatDistanceToNow(new Date(stat.last_seen), { addSuffix: true })}</TableCell>
                  <TableCell className="text-right">{stat.total_loads.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Export Button */}
      <div className="flex justify-end">
        <button
          onClick={() => {
            const csv = [
              ['Domain', 'First Seen', 'Last Seen', 'Total Loads'],
              ...stats.overall.map(stat => [
                stat.referrer_domain,
                new Date(stat.first_seen).toISOString(),
                new Date(stat.last_seen).toISOString(),
                stat.total_loads
              ])
            ].map(row => row.join(',')).join('\n')

            const blob = new Blob([csv], { type: 'text/csv' })
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'embed-analytics.csv'
            a.click()
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Export to CSV
        </button>
      </div>
    </div>
  )
}