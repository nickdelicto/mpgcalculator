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

export async function GET() {
  const client = await pool.connect()
  
  try {
    const { rows } = await client.query(
      `SELECT DISTINCT make
       FROM vehicles 
       ORDER BY make ASC`
    )
    
    return NextResponse.json(rows)
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch vehicle makes' },
      { status: 500 }
    )
  } finally {
    client.release()
  }
} 