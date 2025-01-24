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

// Add export configuration for allowed methods
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const make = searchParams.get('make')
  
  if (!make) {
    return NextResponse.json(
      { error: 'Make parameter is required' },
      { status: 400 }
    )
  }

  const client = await pool.connect()
  
  try {
    const { rows } = await client.query(
      `SELECT DISTINCT model
       FROM vehicles 
       WHERE make = $1
       ORDER BY model ASC`,
      [make]
    )
    
    return NextResponse.json(rows)
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch vehicle models' },
      { status: 500 }
    )
  } finally {
    client.release()
  }
} 