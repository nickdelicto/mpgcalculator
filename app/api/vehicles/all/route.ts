import { NextResponse } from 'next/server'
import { Pool } from 'pg'

// Create a connection pool
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

export async function GET() {
  const client = await pool.connect()
  
  try {
    // Only select the fields needed for sitemap generation
    const { rows } = await client.query(`
      SELECT DISTINCT ON (year, make, model)
        year,
        make,
        model
      FROM vehicles 
      ORDER BY year DESC, make ASC, model ASC
    `)
    
    return NextResponse.json(rows)
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch all vehicles' },
      { status: 500 }
    )
  } finally {
    client.release()
  }
}

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err)
  process.exit(-1)
}) 
