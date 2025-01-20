const { Pool } = require("pg")
const fs = require("fs")
const csv = require("csv-parser")
const dotenv = require("dotenv")
const path = require("path")

dotenv.config()

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number.parseInt(process.env.DB_PORT || "5432"),
})

function parseIntSafe(value) {
  const parsed = Number.parseInt(value)
  return isNaN(parsed) ? null : parsed
}

function parseFloatSafe(value) {
  const parsed = Number.parseFloat(value)
  return isNaN(parsed) ? null : parsed
}

async function importCSV() {
  const client = await pool.connect()
  try {
    await client.query("BEGIN")

    const csvPath = path.join(__dirname, "..", "data", "vehicles.csv")
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on("data", async (row) => {
        const query = `
          INSERT INTO vehicles (
            make, model, year, VClass, trany, drive, displ, cylinders,
            fuelType1, fuelType2, city08, highway08, comb08, cityA08,
            highwayA08, combA08, startStop, sCharger, tCharger, phevBlended,
            phevCity, phevHwy, phevComb, co2, co2A, ghgScore, ghgScoreA
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27)
        `
        const values = [
          row.make,
          row.model,
          parseIntSafe(row.year),
          row.VClass,
          row.trany,
          row.drive,
          parseFloatSafe(row.displ),
          parseIntSafe(row.cylinders),
          row.fuelType1,
          row.fuelType2,
          parseFloatSafe(row.city08),
          parseFloatSafe(row.highway08),
          parseFloatSafe(row.comb08),
          parseFloatSafe(row.cityA08),
          parseFloatSafe(row.highwayA08),
          parseFloatSafe(row.combA08),
          row.startStop,
          row.sCharger,
          row.tCharger,
          row.phevBlended === "true",
          parseFloatSafe(row.phevCity),
          parseFloatSafe(row.phevHwy),
          parseFloatSafe(row.phevComb),
          parseIntSafe(row.co2),
          parseIntSafe(row.co2A),
          parseIntSafe(row.ghgScore),
          parseIntSafe(row.ghgScoreA),
        ]
        await client.query(query, values)
      })
      .on("end", async () => {
        await client.query("COMMIT")
        console.log("CSV import completed successfully")
        client.release()
        pool.end()
      })
      .on("error", async (error) => {
        await client.query("ROLLBACK")
        console.error("Error during import:", error)
        client.release()
        pool.end()
      })
  } catch (err) {
    await client.query("ROLLBACK")
    console.error("Error during import:", err)
    client.release()
    pool.end()
  }
}

importCSV()

console.log("Starting CSV import...")

