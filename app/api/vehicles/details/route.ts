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
  const year = searchParams.get('year')
  
  console.log('API received params:', { make, model, year })

  if (!make || !model || !year) {
    return NextResponse.json(
      { error: 'Make, model, and year parameters are required' },
      { status: 400 }
    )
  }

  const client = await pool.connect()
  
  try {
    const query = `
      SELECT 
        year,
        make,
        model,
        vclass as "VClass",
        trany,
        drive,
        CAST(displ AS NUMERIC) as displ,
        cylinders,
        fueltype1 as "fuelType1",
        NULLIF(fueltype2, '') as "fuelType2",
        CAST(city08 AS NUMERIC) as city08,
        CAST(highway08 AS NUMERIC) as highway08,
        CAST(comb08 AS NUMERIC) as comb08,
        NULLIF(CAST(citya08 AS NUMERIC), 0) as "cityA08",
        NULLIF(CAST(highwaya08 AS NUMERIC), 0) as "highwayA08",
        NULLIF(CAST(comba08 AS NUMERIC), 0) as "combA08",
        startstop as "startStop",
        scharger as "sCharger",
        tcharger as "tCharger",
        CAST(CASE 
          WHEN phevblended = 'true' THEN 'true'
          ELSE 'false' 
        END AS BOOLEAN) as "phevBlended",
        NULLIF(CAST(phevcity AS NUMERIC), 0) as "phevCity",
        NULLIF(CAST(phevhwy AS NUMERIC), 0) as "phevHwy",
        NULLIF(CAST(phevcomb AS NUMERIC), 0) as "phevComb",
        NULLIF(CASE 
          WHEN co2 = -1 THEN NULL 
          ELSE co2 
        END, NULL) as co2,
        NULLIF(CASE 
          WHEN co2a = -1 THEN NULL 
          ELSE co2a 
        END, NULL) as "co2A",
        NULLIF(ghgscore, -1) as "ghgScore",
        NULLIF(ghgscorea, -1) as "ghgScoreA"
       FROM vehicles 
       WHERE LOWER(make) = LOWER($1)
       AND normalized_model = TRIM(
         REGEXP_REPLACE(
           REGEXP_REPLACE(LOWER($2), '[^a-z0-9]', ' ', 'g'),
           '\\s+', ' ', 'g'
         )
       )
       AND year::text = $3`
    const values = [make, model, year]
    
    console.log('Executing query:', {
      query,
      values
    })

    const { rows } = await client.query(query, values)
    
    console.log('Query results:', {
      rowCount: rows.length,
      firstRow: rows[0] ? { 
        make: rows[0].make, 
        model: rows[0].model, 
        year: rows[0].year 
      } : null
    })

    return NextResponse.json(rows)
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch vehicle details' },
      { status: 500 }
    )
  } finally {
    client.release()
  }
} 