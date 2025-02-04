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
  const make = searchParams.get('make')
  const model = searchParams.get('model')
  const drive = searchParams.get('drive')
  const fuelType1 = searchParams.get('fuelType1')
  const fuelType2 = searchParams.get('fuelType2')
  const transmission = searchParams.get('transmission')
  const displacement = searchParams.get('displacement')
  
  if (!make || !model) {
    return NextResponse.json(
      { error: 'Make and model parameters are required' },
      { status: 400 }
    )
  }

  const client = await pool.connect()
  
  try {
    // Build the WHERE clause for variant filtering
    const params = [make, model]
    let variantFilter = ''
    let paramIndex = 3

    if (drive) {
      params.push(drive)
      variantFilter += ` AND drive = $${paramIndex++}`
    }
    if (fuelType1) {
      params.push(fuelType1)
      variantFilter += ` AND fueltype1 = $${paramIndex++}`
    }
    if (fuelType2) {
      params.push(fuelType2)
      variantFilter += ` AND COALESCE(fueltype2, '') = $${paramIndex++}`
    }
    if (transmission) {
      params.push(transmission)
      variantFilter += ` AND trany = $${paramIndex++}`
    }
    if (displacement) {
      params.push(displacement)
      variantFilter += ` AND displ::text = $${paramIndex++}`
    }

    // Get timeline data with efficiency metrics
    const { rows } = await client.query(`
      WITH YearlyData AS (
        SELECT 
          year,
          city08 as city_mpg,
          highway08 as highway_mpg,
          comb08 as combined_mpg,
          phevcity as phev_city_mpge,
          phevhwy as phev_highway_mpge,
          phevcomb as phev_combined_mpge,
          co2 as co2_gpm,
          CASE 
            WHEN phevcomb > 0 THEN phevcomb
            ELSE comb08
          END as best_combined_mpg
        FROM vehicles 
        WHERE LOWER(make) = LOWER($1)
        AND normalized_model = TRIM(
          REGEXP_REPLACE(
            REGEXP_REPLACE(LOWER($2), '[^a-z0-9]', ' ', 'g'),
            '\\s+', ' ', 'g'
          )
        )
        ${variantFilter}
        ORDER BY year ASC
      ),
      BaselineEfficiency AS (
        SELECT best_combined_mpg as baseline_mpg
        FROM YearlyData
        ORDER BY year ASC
        LIMIT 1
      )
      SELECT 
        y.*,
        ROUND(
          ((y.best_combined_mpg - b.baseline_mpg) / b.baseline_mpg * 100)::numeric,
          1
        ) as efficiency_improvement_percent
      FROM YearlyData y
      CROSS JOIN BaselineEfficiency b
      ORDER BY year ASC
    `, params)

    // Calculate summary statistics
    const summary = rows.length > 0 ? {
      total_years: rows.length,
      earliest_year: rows[0].year,
      latest_year: rows[rows.length - 1].year,
      total_improvement: rows[rows.length - 1].efficiency_improvement_percent
    } : null

    return NextResponse.json({
      timeline: rows,
      summary
    })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch timeline data' },
      { status: 500 }
    )
  } finally {
    client.release()
  }
} 