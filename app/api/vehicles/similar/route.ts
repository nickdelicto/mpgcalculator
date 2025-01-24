import { NextResponse } from 'next/server'
import { Pool } from 'pg'

// Create pool once, outside request handler
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
  max: 20, // Set max pool size
  idleTimeoutMillis: 30000
})

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const mpg = parseFloat(searchParams.get('mpg') || '0')
  
  if (!mpg) {
    return NextResponse.json(
      { error: 'MPG parameter is required' }, 
      { status: 400 }
    )
  }

  const lowerBound = Math.floor(mpg - 2)
  const upperBound = Math.ceil(mpg + 2)

  const client = await pool.connect()
  
  try {
    const { rows } = await client.query(
      `SELECT 
        year,
        make,
        model,
        vclass as "VClass",
        -- Fuel Types
        fueltype1 as "fuelType1",
        NULLIF(fueltype2, '') as "fuelType2",  -- Convert empty string to null
        
        -- Primary Fuel (fuelType1) Efficiency
        city08,
        highway08,
        comb08,
        
        -- Alternative Fuel (fuelType2) Efficiency
        NULLIF(citya08, 0) as "cityA08",    -- Convert 0 to null
        NULLIF(highwaya08, 0) as "highwayA08",
        NULLIF(comba08, 0) as "combA08",
        
        -- Vehicle Details
        trany,
        drive,
        displ,
        cylinders,
        
        -- Features
        startstop as "startStop",
        scharger as "sCharger",
        tcharger as "tCharger",
        phevblended as "phevBlended",
        
        -- PHEV Specific
        NULLIF(phevcity, 0) as "phevCity",
        NULLIF(phevhwy, 0) as "phevHwy",
        NULLIF(phevcomb, 0) as "phevComb",
        
        -- Environmental
        NULLIF(co2, -1) as co2,
        NULLIF(co2a, -1) as "co2A",
        NULLIF(ghgscore, -1) as "ghgScore",
        NULLIF(ghgscorea, -1) as "ghgScoreA"
       FROM vehicles 
       WHERE comb08 BETWEEN $1 AND $2 
       ORDER BY ABS(comb08 - $3), year DESC`,
      [lowerBound, upperBound, mpg]
    )
    
    // Add this console.log
    console.log('API Response Data:', JSON.stringify(rows[0], null, 2))

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

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err)
  process.exit(-1)
}) 