import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

// Simple admin check - you might want to replace this with proper auth
async function checkAdmin() {
  const headersList = await headers()
  const auth = headersList.get('authorization')
  
  // For development, allow local access
  if (process.env.NODE_ENV === 'development') {
    return true
  }

  // In production, check for proper auth
  if (!auth || auth !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return false
  }
  return true
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const isAdmin = await checkAdmin()
  
  if (!isAdmin) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4">
          <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
        </div>
      </div>
      {children}
    </div>
  )
} 