import { NextResponse } from 'next/server'
import { Pool } from 'pg'

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
})

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')
  const domain = searchParams.get('domain')

  const client = await pool.connect()
  try {
    // Get overall stats
    const overallResult = await client.query(`
      SELECT 
        referrer_domain,
        first_seen,
        last_seen,
        total_loads
      FROM embed_tracking
      ORDER BY total_loads DESC
    `)

    // Get daily aggregate stats for the last 30 days
    const dailyResult = await client.query(`
      SELECT 
        date,
        SUM(loads) as total_loads,
        COUNT(DISTINCT referrer_domain) as unique_domains
      FROM embed_daily_loads
      WHERE date >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY date
      ORDER BY date DESC
    `)

    // Get detailed daily stats per domain
    const dailyDetailedResult = await client.query(`
      SELECT 
        dl.date,
        dl.referrer_domain,
        dl.loads,
        et.first_seen,
        et.last_seen
      FROM embed_daily_loads dl
      JOIN embed_tracking et ON dl.referrer_domain = et.referrer_domain
      WHERE 
        ($1::date IS NULL OR dl.date = $1::date)
        AND ($2::text IS NULL OR dl.referrer_domain = $2)
      ORDER BY dl.date DESC, dl.loads DESC
    `, [date || null, domain || null])

    return NextResponse.json({
      overall: overallResult.rows,
      daily: dailyResult.rows,
      dailyDetailed: dailyDetailedResult.rows
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  } finally {
    client.release()
  }
} 