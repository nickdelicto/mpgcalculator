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
  const mpg = parseFloat(searchParams.get('mpg') || '0')
  const vclass = searchParams.get('vclass')
  const excludeYear = searchParams.get('excludeYear')
  const excludeMake = searchParams.get('excludeMake')
  const excludeModel = searchParams.get('excludeModel')
  
  if (!mpg || !vclass) {
    return NextResponse.json(
      { error: 'MPG and vehicle class parameters are required' },
      { status: 400 }
    )
  }

  const client = await pool.connect()
  
  try {
    // Find vehicles with similar MPG in the same class
    const { rows } = await client.query(`
      WITH RankedVehicles AS (
        SELECT 
          year,
          make,
          model,
          vclass as "VClass",
          fueltype1 as "fuelType1",
          city08,
          highway08,
          comb08,
          co2,
          ghgscore as "ghgScore",
          ABS(comb08 - $1) as mpg_difference,
          ROW_NUMBER() OVER (
            PARTITION BY make, model 
            ORDER BY year DESC
          ) as year_rank
        FROM vehicles 
        WHERE vclass = $2
          AND (year != $3 OR make != $4 OR model != $5)
          AND comb08 BETWEEN $1 - 5 AND $1 + 5
      )
      SELECT *
      FROM RankedVehicles
      WHERE year_rank = 1
      ORDER BY mpg_difference ASC
      LIMIT 3
    `, [mpg, vclass, excludeYear, excludeMake, excludeModel])
    
    return NextResponse.json(rows)
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch similar vehicles' },
      { status: 500 }
    )
  } finally {
    client.release()
  }
} 