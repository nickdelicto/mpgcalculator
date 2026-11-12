const { Pool } = require("pg")
const fs = require("fs")
const path = require("path")
const dotenv = require("dotenv")

dotenv.config({ path: path.join(__dirname, "..", ".env.local") })
dotenv.config()

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number.parseInt(process.env.DB_PORT || "5432"),
})

async function createReportEmailsTable() {
  const client = await pool.connect()
  try {
    const sqlFile = path.join(__dirname, "create_report_emails_table.sql")
    const sql = fs.readFileSync(sqlFile, "utf8")
    await client.query(sql)
    console.log("report_emails table ready")
  } catch (err) {
    console.error("Error creating report_emails table:", err)
  } finally {
    client.release()
    await pool.end()
  }
}

createReportEmailsTable() 