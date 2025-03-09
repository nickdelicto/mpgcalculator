import { NextRequest, NextResponse } from 'next/server'
import { sendMetaEvent } from '../../../utils/meta-api'
import { headers } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const headersList = headers()
    
    // Get client IP and user agent
    const clientIp = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') ||
                    '127.0.0.1'
    const userAgent = request.headers.get('user-agent') || ''

    // Get Meta cookies for deduplication
    const fbp = request.cookies.get('_fbp')?.value
    const fbc = request.cookies.get('_fbc')?.value

    const event = {
      ...body,
      event_time: Math.floor(Date.now() / 1000),
      action_source: 'website' as const,
      user_data: {
        ...body.user_data,
        client_ip_address: clientIp,
        client_user_agent: userAgent,
        fbp,
        fbc,
      },
    }

    const result = await sendMetaEvent(event)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Meta event API error:', error)
    return NextResponse.json(
      { error: 'Failed to send event' },
      { status: 500 }
    )
  }
}

// Optional: Add GET method for testing
export async function GET() {
  return NextResponse.json(
    { message: 'Meta events endpoint is working' },
    { status: 200 }
  )
} 