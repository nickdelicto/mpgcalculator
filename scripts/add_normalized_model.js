const { Pool } = require("pg")
const fs = require("fs")
const path = require("path")
const dotenv = require("dotenv")

dotenv.config()

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || "5432"),
})

async function addNormalizedModel() {
  const client = await pool.connect()
  try {
    // Begin transaction
    await client.query("BEGIN")

    // Read and execute the SQL file
    const sqlFile = path.join(__dirname, "add_normalized_model.sql")
    const sql = fs.readFileSync(sqlFile, "utf8")
    
    console.log("Starting migration...")
    await client.query(sql)
    
    // Verify the update
    const { rows } = await client.query(`
      SELECT COUNT(*) as total,
             COUNT(normalized_model) as normalized,
             COUNT(DISTINCT normalized_model) as unique_normalized
      FROM vehicles
    `)
    
    console.log("Migration completed successfully")
    console.log("Statistics:", {
      totalRecords: rows[0].total,
      normalizedRecords: rows[0].normalized,
      uniqueNormalizedValues: rows[0].unique_normalized
    })

    // Commit transaction
    await client.query("COMMIT")
  } catch (err) {
    await client.query("ROLLBACK")
    console.error("Error during migration:", err)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

addNormalizedModel()
console.log("Starting normalized_model column migration...") 