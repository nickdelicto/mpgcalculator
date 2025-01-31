import { Pool } from 'pg'

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
})

// Helper function to normalize text for URLs
function normalizeForUrl(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\s-]+/g, '-')     // Replace spaces and multiple hyphens with single hyphen
    .replace(/[^a-z0-9-]/g, '')  // Remove special characters except hyphens
    .replace(/-+/g, '-')         // Replace multiple consecutive hyphens with single hyphen
    .replace(/^-|-$/g, '')       // Remove leading and trailing hyphens
}

export async function generateStaticParams() {
  const client = await pool.connect()
  
  try {
    const { rows } = await client.query(`
      SELECT DISTINCT year, make, model
      FROM vehicles
      ORDER BY year DESC, make ASC, model ASC
    `)
    
    return rows.map(vehicle => ({
      slug: `${vehicle.year}-${normalizeForUrl(vehicle.make)}-${normalizeForUrl(vehicle.model)}-mpg`
    }))
  } catch (error) {
    console.error('Error generating static params:', error)
    return []
  } finally {
    client.release()
  }
} 