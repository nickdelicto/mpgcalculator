import { listReportEmails } from '../../lib/reportEmails'

// Every address people gave us (Fuel Savings Calculator reports), from our own
// database. Behind the /bolingo admin login (middleware.ts, ../layout.tsx).
export const dynamic = 'force-dynamic'

export default async function ReportEmailsPage() {
  const { rows, totals } = await listReportEmails()
  const stat = (label: string, value: string) => (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-2xl font-semibold text-gray-900">{Number(value).toLocaleString()}</div>
    </div>
  )
  return (
    <div className="max-w-7xl mx-auto py-6 px-4 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Report emails</h2>
        <a href="/bolingo/emails/csv" className="text-sm font-medium text-blue-600 hover:underline">Download CSV</a>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stat('People', totals.people)}
        {stat('Reports sent', totals.sends)}
        {stat('People, last 30 days', totals.last30)}
        {stat('Failed sends', totals.failed)}
      </div>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>{['Date', 'Email', 'Vehicles', 'Yearly savings', 'Status', 'Country', 'Source'].map(h => <th key={h} className="px-4 py-2 font-medium">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map(r => (
              <tr key={r.id}>
                <td className="px-4 py-2 whitespace-nowrap">{new Date(r.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/New_York' })}</td>
                <td className="px-4 py-2">{r.email}</td>
                <td className="px-4 py-2">{[r.vehicle1, r.vehicle2].filter(Boolean).join(' vs ') || '-'}</td>
                <td className="px-4 py-2 whitespace-nowrap">{r.annual_savings ? `$${Number(r.annual_savings).toLocaleString('en-US', { maximumFractionDigits: 0 })}` : '-'}</td>
                <td className="px-4 py-2">{r.status}</td>
                <td className="px-4 py-2">{r.country || '-'}</td>
                <td className="px-4 py-2 text-gray-500">{r.source}</td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={7} className="px-4 py-6 text-center text-gray-500">No emails yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
