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
    if (!adminToken || adminToken.value !== process.env.ADMIN_SECRET) {
      // Redirect to login if not authenticated
      return NextResponse.redirect(new URL('/bolingo/login', request.url))
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
    '/bolingo/:path*',
    '/api/admin/:path*',
    // Match all paths
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 