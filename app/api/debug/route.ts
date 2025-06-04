import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.NEXT_PUBLIC_ORS_API_KEY || '';
  
  // Only log that the key exists and its length, never the actual key
  const debugInfo = {
    hasApiKey: !!apiKey,
    apiKeyLength: apiKey.length,
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    // Check if API key matches expected pattern (if it's a known format)
    // For OpenRouteService, keys are usually 40 characters
    possiblyValidFormat: apiKey.length >= 30,
  };
  
  console.log('ORS API Debug info:', debugInfo);
  
  return NextResponse.json(debugInfo);
} 