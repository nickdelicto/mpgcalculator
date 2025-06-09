import { NextResponse } from 'next/server';

// Add debug log to show this file is loaded
console.log('🔍 [API] Viator search route module loaded');

const VIATOR_API_KEY = process.env.NEXT_PUBLIC_VIATOR_API_KEY || '';
const BASE_URL = 'https://api.viator.com/partner';

export async function POST(request: Request) {
  // Add immediate debug log when route is called
  console.log('🔍 [API] Viator search route called with POST method');
  
  try {
    console.log('Viator API proxy request received');
    
    // Check for API key
    if (!VIATOR_API_KEY) {
      console.error('CRITICAL ERROR: Missing Viator API key in environment variables');
      console.error('Environment check:', {
        nodeEnv: process.env.NODE_ENV,
        hasKey: !!process.env.NEXT_PUBLIC_VIATOR_API_KEY,
        keyLength: (process.env.NEXT_PUBLIC_VIATOR_API_KEY || '').length
      });
      return NextResponse.json(
        { error: 'Viator API key not configured' },
        { status: 500 }
      );
    }

    // Get request body
    const body = await request.json();
    console.log('Viator proxy request body:', JSON.stringify(body, null, 2));
    
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
    console.log(`Making Viator API request to: ${url}`);
    
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
    
    // Log a summary of the response
    console.log(`Viator API response for ${endpoint}:`, 
      data.products ? 
        `Found ${data.products.length} products` : 
        'Response received (no products array)');
    
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