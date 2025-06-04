import { NextResponse } from 'next/server';

const ORS_API_KEY = process.env.NEXT_PUBLIC_ORS_API_KEY || '';
const BASE_URL = 'https://api.openrouteservice.org/v2';

export async function POST(request: Request) {
  try {
    console.log('Directions API proxy request received');
    
    // Check for API key
    if (!ORS_API_KEY) {
      console.error('CRITICAL ERROR: Missing API key in environment variables for directions API');
      console.error('Environment check:', {
        nodeEnv: process.env.NODE_ENV,
        hasKey: !!process.env.NEXT_PUBLIC_ORS_API_KEY,
        keyLength: (process.env.NEXT_PUBLIC_ORS_API_KEY || '').length
      });
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    // Get request body
    const body = await request.json();
    console.log('Original request body:', JSON.stringify(body));
    
    // Validate request
    if (!body.coordinates || body.coordinates.length < 2) {
      console.error('Invalid coordinates in request:', body.coordinates);
      return NextResponse.json(
        { error: 'Invalid coordinates' },
        { status: 400 }
      );
    }

    // Build enhanced request with all required parameters
    // Accept the encoded polyline format which is more efficient
    const enhancedBody = {
      coordinates: body.coordinates,
      format: 'json',
      geometry: true,
      instructions: body.instructions !== undefined ? body.instructions : true,
      language: body.language || 'en',
      units: body.units || 'm',
      preference: body.preference || 'recommended'
    };
    
    console.log('Enhanced request body:', JSON.stringify(enhancedBody));
    
    // Make request to OpenRouteService with proper profile and parameters
    // Use driving-car as default profile or use the one provided
    const profile = body.profile || 'driving-car';
    
    // The api_key as query parameter allows for all geometry formats
    const url = `${BASE_URL}/directions/${profile}?api_key=${ORS_API_KEY}`;
    
    console.log('OpenRouteService request URL:', url.replace(ORS_API_KEY, 'API_KEY_HIDDEN'));
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, application/geo+json'
      },
      body: JSON.stringify(enhancedBody)
    });
    
    // Handle API errors
    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouteService API error:', errorText);
      return NextResponse.json(
        { error: `API error: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }
    
    // Get and log the response data
    const data = await response.json();
    
    // Log a summary of the response (without the full geometry details)
    const responseSummary = {
      ...data,
      routes: data.routes ? data.routes.map((route: any) => ({
        ...route,
        geometry: typeof route.geometry === 'string' ? 
          `[Encoded polyline string length: ${route.geometry.length}]` :
          route.geometry ? 
            { type: route.geometry.type, coordinates: `[Array of ${route.geometry.coordinates?.length || 0} points]` } : 
            route.geometry
      })) : data.routes,
      features: data.features ? data.features.map((feature: any) => ({
        ...feature,
        geometry: feature.geometry ? 
          { type: feature.geometry.type, coordinates: `[Array of ${feature.geometry.coordinates?.length || 0} points]` } : 
          feature.geometry
      })) : data.features
    };
    
    console.log('OpenRouteService response summary:', JSON.stringify(responseSummary));
    
    // Return the full API response
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Proxy server error:', error);
    return NextResponse.json(
      { error: 'Server error processing request' },
      { status: 500 }
    );
  }
} 