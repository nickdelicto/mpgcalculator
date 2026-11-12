// Copies past report emails from Brevo's transactional log into report_emails
// (scripts/create_report_emails_table.sql), so addresses sent before we kept
// them ourselves are not lost. Safe to re-run: a Brevo message id is stored
// once. Brevo only keeps a limited history, so run it soon.
//   node scripts/backfill_report_emails.js [days=90]
const { Pool } = require("pg")
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

const DAYS = Number.parseInt(process.argv[2] || "90")
const PAGE = 2500
const SUBJECT = /fuel savings/i
const day = d => d.toISOString().slice(0, 10)

async function brevo(params) {
  const res = await fetch(`https://api.brevo.com/v3/smtp/statistics/events?${new URLSearchParams(params)}`, {
    headers: { accept: "application/json", "api-key": process.env.BREVO_API_KEY },
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(`Brevo ${res.status}: ${body.code || ""} ${body.message || ""}`)
  return body.events || []
}

async function main() {
  if (!process.env.BREVO_API_KEY) throw new Error("BREVO_API_KEY is not set")
  // One row per message: its first "requests" event, its latest outcome.
  const byId = new Map()
  const end = new Date(), start = new Date(Date.now() - DAYS * 864e5)
  for (const event of ["requests", "delivered", "hardBounces", "softBounces", "blocked", "invalid", "error"]) {
    for (let offset = 0; ; offset += PAGE) {
      const rows = await brevo({ limit: PAGE, offset, startDate: day(start), endDate: day(end), event, sort: "asc" })
      for (const e of rows) {
        if (!e.messageId || !SUBJECT.test(e.subject || "")) continue
        const m = byId.get(e.messageId) || { email: e.email, subject: e.subject, at: e.date, status: "pending" }
        if (event === "requests") m.at = e.date
        else m.status = event === "delivered" ? "sent" : "failed", m.error = event === "delivered" ? null : event
        byId.set(e.messageId, m)
      }
      if (rows.length < PAGE) break
    }
  }
  let added = 0
  for (const [id, m] of byId) {
    const savings = (m.subject.match(/\$([\d,]+(?:\.\d+)?)/) || [])[1]
    const r = await pool.query(
      `INSERT INTO report_emails (email, source, annual_savings, status, error, brevo_message_id, created_at, sent_at)
       VALUES ($1, 'brevo_backfill', $2, $3, $4, $5, $6, CASE WHEN $3 = 'sent' THEN $6::timestamptz END)
       ON CONFLICT (brevo_message_id) DO NOTHING`,
      [m.email, savings ? Number(savings.replace(/,/g, "")) : null, m.status, m.error || null, id, m.at]
    )
    added += r.rowCount
  }
  const emails = new Set([...byId.values()].map(m => m.email.toLowerCase()))
  console.log(`Brevo: ${byId.size} report emails to ${emails.size} addresses in the last ${DAYS} days; ${added} new rows saved`)
}

main().catch(err => { console.error("Backfill failed:", err.message); process.exitCode = 1 }).finally(() => pool.end())
