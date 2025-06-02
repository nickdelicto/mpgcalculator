import { NextResponse } from 'next/server';

const ORS_API_KEY = process.env.NEXT_PUBLIC_ORS_API_KEY || '';
// The geocoding API uses a different endpoint structure than the directions API
const BASE_URL = 'https://api.openrouteservice.org';

export async function GET(request: Request) {
  try {
    // Check for API key
    if (!ORS_API_KEY) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const text = searchParams.get('text');
    
    // Validate request
    if (!text) {
      return NextResponse.json(
        { error: 'Missing search text' },
        { status: 400 }
      );
    }
    
    // Make request to OpenRouteService Pelias geocoding autocomplete API
    // The correct endpoint is /geocode/autocomplete/... (without v2)
    const url = `${BASE_URL}/geocode/autocomplete?text=${encodeURIComponent(text)}&api_key=${ORS_API_KEY}`;
    
    console.log('Geocoding autocomplete request URL:', url.replace(ORS_API_KEY, 'API_KEY_HIDDEN'));
    
    const response = await fetch(url);
    
    // Handle API errors
    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouteService API error:', errorText);
      return NextResponse.json(
        { error: `API error: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }
    
    // Return API response
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Proxy server error:', error);
    return NextResponse.json(
      { error: 'Server error processing request' },
      { status: 500 }
    );
  }
} 