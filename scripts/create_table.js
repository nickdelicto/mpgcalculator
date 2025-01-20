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
  port: Number.parseInt(process.env.DB_PORT || "5432"),
})

async function createTable() {
  const client = await pool.connect()
  try {
    const sqlFile = path.join(__dirname, "create_table.sql")
    const sql = fs.readFileSync(sqlFile, "utf8")
    await client.query(sql)
    console.log("Table created successfully")
  } catch (err) {
    console.error("Error creating table:", err)
  } finally {
    client.release()
    await pool.end()
  }
}

createTable()

