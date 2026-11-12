import { NextResponse } from 'next/server'
import { listReportEmails } from '../../../lib/reportEmails'

// The report emails as a CSV file. Under /bolingo, so the admin login applies (middleware.ts).
export const dynamic = 'force-dynamic'

const cell = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`

export async function GET() {
  const { rows } = await listReportEmails(100000)
  const head = ['date', 'email', 'vehicle1', 'vehicle2', 'annual_savings', 'status', 'country', 'source']
  const lines = rows.map(r => [new Date(r.created_at).toISOString(), r.email, r.vehicle1, r.vehicle2, r.annual_savings, r.status, r.country, r.source].map(cell).join(','))
  return new NextResponse([head.join(','), ...lines].join('\n'), {
    headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="report-emails-${new Date().toISOString().slice(0, 10)}.csv"` },
  })
}
