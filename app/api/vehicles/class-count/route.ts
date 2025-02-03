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
  const vclass = searchParams.get('vclass')
  
  if (!vclass) {
    return NextResponse.json(
      { error: 'Vehicle class parameter is required' },
      { status: 400 }
    )
  }

  const client = await pool.connect()
  
  try {
    const { rows } = await client.query(
      `SELECT COUNT(*) as count 
       FROM (
         SELECT DISTINCT make, model, year
         FROM vehicles 
         WHERE vclass = $1
       ) as distinct_vehicles`,
      [vclass]
    )
    
    return NextResponse.json({ count: parseInt(rows[0].count) })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch vehicle class count' },
      { status: 500 }
    )
  } finally {
    client.release()
  }
} 