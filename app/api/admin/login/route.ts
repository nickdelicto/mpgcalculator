import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  const { password } = await request.json()
  const adminSecret = process.env.ADMIN_SECRET
  const adminPassword = process.env.ADMIN_PASSWORD
  
  // Create response with debug info (safe for production)
  const debugInfo = {
    hasSecret: !!adminSecret,
    hasPassword: !!adminPassword,
    secretLength: adminSecret?.length || 0,
    passwordMatch: password === adminPassword
  }
  
  // Development-only console logs
  if (process.env.NODE_ENV === 'development') {
    console.log('Login attempt:', debugInfo)
  }
  
  if (!adminSecret || !adminPassword) {
    console.error('Missing environment variables')
    return NextResponse.json(
      { 
        error: 'Server configuration error',
        debug: debugInfo
      },
      { status: 500 }
    )
  }
  
  if (password === adminPassword) {
    const response = NextResponse.json({ 
      success: true,
      debug: debugInfo
    })
    
    // Set a secure cookie for admin session
    const isProduction = process.env.NODE_ENV === 'production'
    response.cookies.set('admin_token', adminSecret, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 // 24 hours
    })
    
    // Add cookie debug info to response headers (safe for production)
    response.headers.set('x-cookie-debug', JSON.stringify({
      name: 'admin_token',
      valueLength: adminSecret.length,
      options: {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24
      }
    }))
    
    // Development-only console logs
    if (process.env.NODE_ENV === 'development') {
      console.log('Cookie set:', {
        name: 'admin_token',
        valueLength: adminSecret.length,
        options: {
          httpOnly: true,
          secure: isProduction,
          sameSite: 'strict',
          maxAge: 60 * 60 * 24
        }
      })
    }
    
    return response
  }
  
  return NextResponse.json(
    { 
      error: 'Invalid password',
      debug: debugInfo
    },
    { status: 401 }
  )
} 