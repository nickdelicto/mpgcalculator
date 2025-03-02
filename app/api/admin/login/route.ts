import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  const { password } = await request.json()
  
  if (password === process.env.ADMIN_PASSWORD) {
    const response = NextResponse.json({ success: true })
    
    // Set a secure cookie for admin session
    response.cookies.set('admin_token', process.env.ADMIN_SECRET || '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 // 24 hours
    })
    
    return response
  }
  
  return NextResponse.json(
    { error: 'Invalid password' },
    { status: 401 }
  )
} 