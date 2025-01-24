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

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const make = searchParams.get('make')
  const model = searchParams.get('model')
  
  if (!make || !model) {
    return NextResponse.json(
      { error: 'Make and model parameters are required' },
      { status: 400 }
    )
  }

  const client = await pool.connect()
  
  try {
    const { rows } = await client.query(
      `SELECT DISTINCT year
       FROM vehicles 
       WHERE make = $1 AND model = $2
       ORDER BY year DESC`,
      [make, model]
    )
    
    return NextResponse.json(rows)
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch vehicle years' },
      { status: 500 }
    )
  } finally {
    client.release()
  }
} 