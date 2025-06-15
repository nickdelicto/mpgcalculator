import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the pathname
  const pathname = request.nextUrl.pathname
  
  // Create a new response
  let response = NextResponse.next()
  
  // Check if accessing admin routes
  if (pathname.startsWith('/bolingo')) {
    // Allow access to login page
    if (pathname === '/bolingo/login') {
      return NextResponse.next()
    }

    // Check for admin cookie
    const adminToken = request.cookies.get('admin_token')
    const adminSecret = process.env.ADMIN_SECRET

    // Always add debug headers (safe for production)
    response.headers.set('x-auth-debug', [
      adminToken ? 'has_token' : 'no_token',
      adminSecret ? 'has_secret' : 'no_secret',
      adminToken && adminSecret ? (adminToken.value === adminSecret ? 'match' : 'no_match') : 'incomplete'
    ].join(':'))

    // Development-only console logs
    if (process.env.NODE_ENV === 'development') {
      console.log('Debug - Middleware:')
      console.log('Path:', pathname)
      console.log('Has Token:', !!adminToken)
      console.log('Has Secret:', !!adminSecret)
      if (adminToken) {
        console.log('Token Length:', adminToken.value.length)
        console.log('Secret Length:', adminSecret?.length || 0)
      }
    }

    // Check authentication
    if (!adminToken || !adminSecret || adminToken.value !== adminSecret) {
      // Add debug info to redirect
      const redirectUrl = new URL('/bolingo/login', request.url)
      redirectUrl.searchParams.set('from', pathname)
      redirectUrl.searchParams.set('reason', !adminToken ? 'no_token' : !adminSecret ? 'no_secret' : 'mismatch')
      
      // Redirect to login if not authenticated
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Add custom headers for path detection (for Embed pages)
  response.headers.set('x-pathname', pathname)
  response.headers.set('x-is-embed', pathname.includes('/embed') ? 'true' : 'false')
  
  // Add noindex headers for template pages
  if (pathname.includes('/blog/template/')) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow')
  }
  
  return response
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    '/bolingo/:path*',
    '/api/admin/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
    '/blog/template/:path*',
  ],
} 