import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

/**
 * IMPORTANT: This is the admin section of the application.
 * For security, these routes are accessible via /bolingo instead of /admin
 * Example: /bolingo/embed-analytics instead of /admin/embed-analytics
 * 
 * This layout provides authentication for all admin routes.
 * In development: Authentication is bypassed
 * In production: Requires valid admin_token cookie
 */

// Simple admin check - using cookie-based auth
async function checkAdmin() {
  // For development, allow local access
  if (process.env.NODE_ENV === 'development') {
    return true
  }

  // In production, check for proper cookie
  const cookieStore = await cookies()
  const adminToken = cookieStore.get('admin_token')
  return adminToken?.value === process.env.ADMIN_SECRET
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