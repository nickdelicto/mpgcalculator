import { redirect } from 'next/navigation'

/**
 * Main admin route (/bolingo)
 * Automatically redirects to embed-analytics dashboard
 */
export default function AdminPage() {
  // Redirect to embed analytics - no need for a landing page
  redirect('/bolingo/embed-analytics')
} 