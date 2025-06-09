import { NextResponse } from 'next/server';

// Add debug log to show this file is loaded
console.log('🔍 [API] Viator product route module loaded');

const VIATOR_API_KEY = process.env.NEXT_PUBLIC_VIATOR_API_KEY || '';
const BASE_URL = 'https://api.viator.com/partner';

export async function GET(request: Request) {
  // Add immediate debug log when route is called
  console.log('🔍 [API] Viator product route called with GET method');

  try {
    console.log('Viator product API proxy request received');
    
    // Check for API key
    if (!VIATOR_API_KEY) {
      console.error('CRITICAL ERROR: Missing Viator API key in environment variables');
      return NextResponse.json(
        { error: 'Viator API key not configured' },
        { status: 500 }
      );
    }

    // Get the product code from URL search params
    const { searchParams } = new URL(request.url);
    const productCode = searchParams.get('productCode');
    
    if (!productCode) {
      return NextResponse.json(
        { error: 'Missing productCode parameter' },
        { status: 400 }
      );
    }
    
    // Construct full URL for the Viator API
    const url = `${BASE_URL}/products/${productCode}`;
    console.log(`Making Viator product API request to: ${url}`);
    
    // Make request to Viator API
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json;version=2.0',
        'Accept-Language': 'en-US',
        'exp-api-key': VIATOR_API_KEY
      }
    });
    
    // Handle API errors
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Viator product API error (${response.status}):`, errorText);
      return NextResponse.json(
        { error: `Viator API error: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }
    
    // Get the response data
    const data = await response.json();
    
    // Log a summary of the response
    console.log(`Viator product API response for ${productCode}:`, 'Product details received');
    
    // Return the full API response
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Viator product API error:', error);
    return NextResponse.json(
      { error: 'Server error processing Viator product request' },
      { status: 500 }
    );
  }
} 