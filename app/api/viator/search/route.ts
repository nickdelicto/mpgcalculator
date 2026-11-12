import { NextResponse } from 'next/server';

const VIATOR_API_KEY = process.env.VIATOR_API_KEY || '';
const BASE_URL = 'https://api.viator.com/partner';

export async function POST(request: Request) {
  try {
    // Check for API key
    if (!VIATOR_API_KEY) {
      console.error('CRITICAL ERROR: Missing Viator API key in environment variables');
      console.error('Environment check:', {
        nodeEnv: process.env.NODE_ENV,
        hasKey: !!process.env.VIATOR_API_KEY,
        keyLength: (process.env.VIATOR_API_KEY || '').length
      });
      return NextResponse.json(
        { error: 'Viator API key not configured' },
        { status: 500 }
      );
    }

    // Get request body
    const body = await request.json();
    
    // Extract endpoint from the request
    const { endpoint, ...requestData } = body;
    
    if (!endpoint) {
      return NextResponse.json(
        { error: 'Missing endpoint in request' },
        { status: 400 }
      );
    }
    
    // Construct full URL for the Viator API
    const url = `${BASE_URL}/${endpoint}`;
    
    // Make request to Viator API
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json;version=2.0',
        'Accept-Language': 'en-US',
        'exp-api-key': VIATOR_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    });
    
    // Handle API errors
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Viator API error (${response.status}):`, errorText);
      return NextResponse.json(
        { error: `Viator API error: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }
    
    // Get the response data
    const data = await response.json();
    
    // Return the full API response
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Viator proxy server error:', error);
    return NextResponse.json(
      { error: 'Server error processing Viator request' },
      { status: 500 }
    );
  }
} 