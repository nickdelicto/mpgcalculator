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
    const entityId = searchParams.get('entityId');

    // Validate required parameters
    if (!entityId) {
      return NextResponse.json(
        { error: 'Missing entityId parameter' },
        { status: 400 }
      );
    }

    // Build TomTom API URL
    const url = `https://api.tomtom.com/search/2/place.json?key=${TOMTOM_API_KEY}&entityId=${entityId}`;

    console.log('TomTom place lookup:', url.replace(TOMTOM_API_KEY, 'API_KEY_HIDDEN'));

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
