import { Pool } from 'pg'

// The addresses people give us, kept in our own database (scripts/
// create_report_emails_table.sql) so the list never depends on the email
// provider. Saving never blocks the send: a database hiccup is logged, the
// email still goes out.
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
  max: 5,
  idleTimeoutMillis: 30000
})

export interface ReportEmailRow {
  email: string
  source?: string
  vehicle1?: string | null
  vehicle2?: string | null
  annualMileage?: number | null
  annualSavings?: number | null
  report?: unknown
  country?: string | null
  referrer?: string | null
}

export async function recordReportEmail(row: ReportEmailRow): Promise<number | null> {
  try {
    const { rows } = await pool.query(
      `INSERT INTO report_emails (email, source, vehicle1, vehicle2, annual_mileage, annual_savings, report, country, referrer)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
      [row.email.trim(), row.source || 'fuel_savings_report', row.vehicle1 ?? null, row.vehicle2 ?? null,
        row.annualMileage ?? null, row.annualSavings ?? null, row.report ? JSON.stringify(row.report) : null,
        row.country ?? null, row.referrer?.slice(0, 500) ?? null]
    )
    return rows[0]?.id ?? null
  } catch (error) {
    console.error('report_emails insert failed:', error instanceof Error ? error.message : error)
    return null
  }
}

export async function markReportEmail(id: number | null, result: { messageId?: string | null; error?: string | null }) {
  if (id == null) return
  try {
    await pool.query(
      result.error
        ? `UPDATE report_emails SET status = 'failed', error = $2 WHERE id = $1`
        : `UPDATE report_emails SET status = 'sent', sent_at = NOW(), brevo_message_id = $2 WHERE id = $1`,
      [id, result.error ? result.error.slice(0, 500) : result.messageId ?? null]
    )
  } catch (error) {
    console.error('report_emails update failed:', error instanceof Error ? error.message : error)
  }
}

export interface ReportEmailListRow {
  id: number
  email: string
  source: string
  vehicle1: string | null
  vehicle2: string | null
  annual_savings: string | null
  status: string
  country: string | null
  created_at: Date
}

// For the admin list (/bolingo/emails): newest first, plus the totals.
export async function listReportEmails(limit = 1000) {
  const [rows, totals] = await Promise.all([
    pool.query<ReportEmailListRow>(
      `SELECT id, email, source, vehicle1, vehicle2, annual_savings, status, country, created_at
         FROM report_emails ORDER BY created_at DESC LIMIT $1`, [limit]),
    pool.query<{ sends: string; people: string; last30: string; failed: string }>(
      `SELECT count(*) AS sends, count(DISTINCT lower(email)) AS people,
              count(DISTINCT lower(email)) FILTER (WHERE created_at > now() - interval '30 days') AS last30,
              count(*) FILTER (WHERE status = 'failed') AS failed
         FROM report_emails`),
  ])
  return { rows: rows.rows, totals: totals.rows[0] }
}
