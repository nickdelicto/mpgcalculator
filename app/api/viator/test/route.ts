import { NextResponse } from 'next/server';

// Add debug log to show this file is loaded
console.log('🔍 [API] Viator test route module loaded');

export async function GET() {
  console.log('🔍 [API] Viator test route called with GET method');
  
  return NextResponse.json({ 
    message: 'Viator API test endpoint is working',
    timestamp: new Date().toISOString()
  });
} 