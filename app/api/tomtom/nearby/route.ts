import { NextResponse } from 'next/server';

const TOMTOM_API_KEY = process.env.TOMTOM_API_KEY || '';

export async function GET(request: Request) {
  try {
    // Check for API key
    if (!TOMTOM_API_KEY) {
      console.error('TomTom API key not configured');
      return NextResponse.json(
        { error: 'TomTom API key not configured' },
        { status: 500 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const radius = searchParams.get('radius') || '5000';
    const limit = searchParams.get('limit') || '10';
    const categorySet = searchParams.get('categorySet');

    // Validate required parameters
    if (!lat || !lng) {
      return NextResponse.json(
        { error: 'Missing lat or lng parameters' },
        { status: 400 }
      );
    }

    // Build TomTom API URL
    let url = `https://api.tomtom.com/search/2/nearbySearch/.json?key=${TOMTOM_API_KEY}&lat=${lat}&lon=${lng}&radius=${radius}&limit=${limit}`;

    if (categorySet) {
      url += `&categorySet=${categorySet}`;
    }

    console.log('TomTom nearby search:', url.replace(TOMTOM_API_KEY, 'API_KEY_HIDDEN'));

    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('TomTom API error:', errorText);
      return NextResponse.json(
        { error: `TomTom API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('TomTom proxy error:', error);
    return NextResponse.json(
      { error: 'Server error processing TomTom request' },
      { status: 500 }
    );
  }
}
