import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Add a secret token to prevent unauthorized revalidation
    const token = request.headers.get('x-revalidate-token')
    if (token !== process.env.REVALIDATE_TOKEN) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
    }

    // Get the paths to revalidate from the request body
    const { paths } = await request.json()
    
    // Revalidate the specified paths
    if (Array.isArray(paths)) {
      for (const path of paths) {
        revalidatePath(path)
      }
    } else {
      // Revalidate all vehicle pages
      revalidatePath('/vehicles/[slug]')
    }

    return NextResponse.json({ revalidated: true, timestamp: Date.now() })
  } catch (err) {
    return NextResponse.json({ message: 'Error revalidating' }, { status: 500 })
  }
} 