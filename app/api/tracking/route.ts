import { NextResponse } from 'next/server'
import { Pool } from 'pg'

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
  max: 20,
  idleTimeoutMillis: 30000
})

export async function POST(request: Request) {
  const client = await pool.connect()
  try {
    const { referrer } = await request.json()
    
    // Extract domain from referrer
    let domain = 'unknown'
    try {
      if (referrer) {
        domain = new URL(referrer).hostname
      }
    } catch (e) {
      console.error('Error parsing referrer:', e)
    }

    // Start a transaction
    await client.query('BEGIN')

    // Update total tracking
    await client.query(`
      INSERT INTO embed_tracking (referrer_domain, total_loads)
      VALUES ($1, 1)
      ON CONFLICT (referrer_domain)
      DO UPDATE SET 
        total_loads = embed_tracking.total_loads + 1,
        last_seen = NOW()
    `, [domain])

    // Update daily tracking
    await client.query(`
      INSERT INTO embed_daily_loads (referrer_domain, date, loads)
      VALUES ($1, CURRENT_DATE, 1)
      ON CONFLICT (referrer_domain, date)
      DO UPDATE SET 
        loads = embed_daily_loads.loads + 1
    `, [domain])

    await client.query('COMMIT')
    return NextResponse.json({ success: true })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Tracking error:', error)
    return NextResponse.json({ error: 'Failed to track' }, { status: 500 })
  } finally {
    client.release()
  }
} 