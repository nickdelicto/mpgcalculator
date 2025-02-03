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
  const mpg = parseFloat(searchParams.get('mpg') || '0')
  
  if (!vclass) {
    return NextResponse.json(
      { error: 'Vehicle class parameter is required' },
      { status: 400 }
    )
  }

  const client = await pool.connect()
  
  try {
    // Get MPG stats for the class, considering PHEV values
    const { rows } = await client.query(`
      WITH VehicleEfficiency AS (
        SELECT 
          make, model, year,
          CASE 
            -- Prioritize PHEV combined if available
            WHEN phevcomb IS NOT NULL AND phevcomb > 0 THEN phevcomb
            -- Then fall back to primary fuel combined
            ELSE comb08
          END as best_efficiency
        FROM vehicles 
        WHERE vclass = $1
      ),
      ClassStats AS (
        SELECT 
          MIN(best_efficiency) as min_mpg,
          MAX(best_efficiency) as max_mpg,
          AVG(best_efficiency) as avg_mpg,
          COUNT(DISTINCT make || model || year) as total_vehicles
        FROM VehicleEfficiency
      )
      SELECT 
        ROUND(min_mpg::numeric, 1) as min_mpg,
        ROUND(max_mpg::numeric, 1) as max_mpg,
        ROUND(avg_mpg::numeric, 1) as avg_mpg,
        total_vehicles,
        ROUND(
          CASE 
            WHEN $2 <= min_mpg THEN 1
            WHEN $2 >= max_mpg THEN 5
            ELSE 1 + (4.0 * ($2 - min_mpg) / NULLIF(max_mpg - min_mpg, 0))
          END::numeric,
          1
        ) as rating
      FROM ClassStats
    `, [vclass, mpg])
    
    // Ensure we have valid numeric values
    const result = rows[0]
    return NextResponse.json({
      min_mpg: parseFloat(result.min_mpg),
      max_mpg: parseFloat(result.max_mpg),
      avg_mpg: parseFloat(result.avg_mpg),
      total_vehicles: parseInt(result.total_vehicles),
      rating: parseFloat(result.rating || '3.0') // Default to 3.0 if rating is null
    })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch class MPG stats' },
      { status: 500 }
    )
  } finally {
    client.release()
  }
} 