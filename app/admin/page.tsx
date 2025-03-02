import Link from 'next/link'

export default function AdminPage() {
  return (
    <div className="max-w-7xl mx-auto py-6 px-4">
      <div className="grid gap-6">
        <Link 
          href="/admin/embed-analytics"
          className="p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <h2 className="text-xl font-semibold text-gray-900">Embed Analytics</h2>
          <p className="text-gray-600 mt-2">View statistics about calculator embeds</p>
        </Link>
      </div>
    </div>
  )
} 