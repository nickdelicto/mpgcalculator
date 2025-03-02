import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the pathname
  const pathname = request.nextUrl.pathname
  
  // Create a new response
  let response = NextResponse.next()
  
  // Check if this is an admin route
  if (pathname.startsWith('/admin')) {
    // Allow access to login page
    if (pathname === '/admin/login') {
      return response
    }

    // Check for admin session cookie
    const adminSession = request.cookies.get('admin_session')
    if (!adminSession?.value) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  // Add custom headers for path detection (for embed functionality)
  response.headers.set('x-pathname', pathname)
  response.headers.set('x-is-embed', pathname.includes('/embed') ? 'true' : 'false')
  
  return response
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    '/admin/:path*',
    // Match all paths
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 