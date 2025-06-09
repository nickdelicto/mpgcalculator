import { NextResponse } from 'next/server';

// Add debug log to show this file is loaded
console.log('🔍 [API] Viator destinations route module loaded');

const VIATOR_API_KEY = process.env.NEXT_PUBLIC_VIATOR_API_KEY || '';
const BASE_URL = 'https://api.viator.com/partner';

export async function GET() {
  try {
    console.log('Fetching Viator destinations taxonomy');
    
    // Check for API key
    if (!VIATOR_API_KEY) {
      console.error('CRITICAL ERROR: Missing Viator API key in environment variables');
      return NextResponse.json(
        { error: 'Viator API key not configured' },
        { status: 500 }
      );
    }
    
    const response = await fetch(`${BASE_URL}/destinations`, {
      headers: {
        'Accept': 'application/json;version=2.0',
        'Accept-Language': 'en-US',
        'exp-api-key': VIATOR_API_KEY
      }
    });
    
    if (!response.ok) {
      console.error(`Viator destinations API error: ${response.status}`);
      return NextResponse.json(
        { error: `Failed to fetch destinations: ${response.status}` },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    console.log(`Retrieved ${data.destinations?.length || 0} Viator destinations`);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Server error processing destination request:', error);
    return NextResponse.json(
      { error: 'Server error processing destination request' },
      { status: 500 }
    );
  }
} 