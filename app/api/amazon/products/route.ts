import { NextResponse } from 'next/server'
import { VEHICLE_PAGES_PRODUCTS as PREFERRED_EV_CHARGERS } from '../../../config/amazon-products'
import { signRequest } from '../../../lib/amazon-paapi'

// Types
interface AmazonProduct {
  asin: string
  title: string
  imageUrl: string
  affiliateUrl: string
  features: string[]
  prime: boolean
}

interface CacheItem {
  data: AmazonProduct[]
  timestamp: number
}

interface ProductCache {
  [key: string]: CacheItem
}

const CACHE_DURATION = 6 * 60 * 60 * 1000  // 6 hours
let productCache: ProductCache = {}

// PA-API constants
const HOST = 'webservices.amazon.com'
const REGION = 'us-east-1'
const SERVICE = 'ProductAdvertisingAPI'
const URI = '/paapi5/getitems'
const SEARCH_URI = '/paapi5/searchitems'

// Add mock data at the top of the file
const MOCK_PRODUCTS: Record<string, { title: string, features: string[] }> = {
  'B0C6YMS4KH': {
    title: 'ChargePoint Home Flex Electric Vehicle (EV) Charger',
    features: ['Up to 50 Amp output', 'WiFi enabled', 'Indoor/Outdoor']
  },
  'B0BZRTD9VS': {
    title: 'EVIQO Level 2 EV Charger',
    features: ['40 Amp charging', 'Smart features', 'UL certified']
  },
  'B0DGQ5MXGK': {
    title: 'Elecq Level 2 EV Charger',
    features: ['50 Amp max output', 'App control', 'NEMA 14-50']
  }
}

// Add this function before the GET handler
function getMockProducts(asins: string[]): AmazonProduct[] {
  return asins.map(asin => ({
    asin,
    title: MOCK_PRODUCTS[asin]?.title || `Product ${asin}`,
    imageUrl: `https://images-na.ssl-images-amazon.com/images/P/${asin}.01.LZZZZZZZ.jpg`,
    affiliateUrl: `https://www.amazon.com/dp/${asin}?tag=${process.env.AMAZON_ASSOCIATE_TAG || ''}`,
    features: MOCK_PRODUCTS[asin]?.features || [],
    prime: true
  }))
}

async function searchAdditionalProducts(count: number) {
  const { searchTerm, searchFilters } = PREFERRED_EV_CHARGERS.settings

  const payload = JSON.stringify({
    Keywords: searchTerm,
    SearchIndex: "All",
    ItemCount: count,
    Resources: [
      'Images.Primary.Large',
      'ItemInfo.Title',
      'ItemInfo.Features',
      'Offers.Listings.Price',
      'Offers.Listings.DeliveryInfo.IsPrimeEligible',
      'CustomerReviews.Count',
      'CustomerReviews.StarRating'
    ],
    MinReviewsCount: searchFilters.minReviews,
    MinRating: searchFilters.minRating,
    MinPrice: searchFilters.priceRange.min,
    MaxPrice: searchFilters.priceRange.max,
    PartnerTag: process.env.AMAZON_ASSOCIATE_TAG,
    PartnerType: 'Associates',
    Marketplace: 'www.amazon.com'
  })

  // Sign the request
  const requestOptions = signRequest(
    'POST',
    HOST,
    SEARCH_URI,
    REGION,
    SERVICE,
    payload,
    process.env.AMAZON_PA_API_KEY || '',
    process.env.AMAZON_PA_API_SECRET || ''
  )

  // Make the request
  const response = await fetch(`https://${HOST}${SEARCH_URI}`, {
    method: 'POST',
    headers: requestOptions.headers,
    body: payload
  })

  if (!response.ok) {
    console.error('Search API Error:', await response.text())
    return []
  }

  const data = await response.json()
  return data?.SearchResult?.Items || []
}

// Add this helper function for shuffling arrays
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// Add this function to arrange products according to rules
function arrangeProducts(preferred: AmazonProduct[], additional: AmazonProduct[]): AmazonProduct[] {
  const shuffledPreferred = shuffleArray(preferred)
  const shuffledAdditional = shuffleArray(additional)
  
  // Initialize array with 7 empty slots
  const result: (AmazonProduct | null)[] = Array(7).fill(null)
  
  // Place preferred products in required positions (1st, 5th, and 7th)
  result[0] = shuffledPreferred[0] // 1st position
  result[2] = shuffledPreferred[1] // 5th position
  result[6] = shuffledPreferred[2] // 7th position
  
  // Fill remaining positions with mix of additional and remaining preferred
  const remainingProducts = [...shuffledPreferred.slice(3), ...shuffledAdditional]
  const shuffledRemaining = shuffleArray(remainingProducts)
  
  let remainingIndex = 0
  for (let i = 0; i < 7; i++) {
    if (result[i] === null) {
      result[i] = shuffledRemaining[remainingIndex]
      remainingIndex++
    }
  }
  
  return result as AmazonProduct[]
}

export async function GET() {
  try {
    // Check cache first
    if (productCache.evChargers && 
        Date.now() - productCache.evChargers.timestamp < CACHE_DURATION) {
      return NextResponse.json(productCache.evChargers.data)
    }

    // Get all ASINs
    const preferredAsins = [...PREFERRED_EV_CHARGERS.preferredAsins]
    const additionalAsins = [...PREFERRED_EV_CHARGERS.additionalAsins]
    
    // First, get preferred products
    const preferredPayload = JSON.stringify({
      ItemIds: preferredAsins,
      Resources: [
        'Images.Primary.Large',
        'ItemInfo.Title',
        'ItemInfo.Features',
        'Offers.Listings.Price',
        'Offers.Listings.DeliveryInfo.IsPrimeEligible',
        'CustomerReviews.Count',
        'CustomerReviews.StarRating'
      ],
      PartnerTag: process.env.AMAZON_ASSOCIATE_TAG,
      PartnerType: 'Associates',
      Marketplace: 'www.amazon.com'
    })

    // Get additional products
    const additionalPayload = JSON.stringify({
      ItemIds: additionalAsins,
      Resources: [
        'Images.Primary.Large',
        'ItemInfo.Title',
        'ItemInfo.Features',
        'Offers.Listings.Price',
        'Offers.Listings.DeliveryInfo.IsPrimeEligible',
        'CustomerReviews.Count',
        'CustomerReviews.StarRating'
      ],
      PartnerTag: process.env.AMAZON_ASSOCIATE_TAG,
      PartnerType: 'Associates',
      Marketplace: 'www.amazon.com'
    })

    // Make both requests in parallel
    const [preferredResponse, additionalResponse] = await Promise.all([
      fetch(`https://${HOST}${URI}`, {
        method: 'POST',
        headers: signRequest('POST', HOST, URI, REGION, SERVICE, preferredPayload, 
          process.env.AMAZON_PA_API_KEY || '', process.env.AMAZON_PA_API_SECRET || '').headers,
        body: preferredPayload
      }),
      fetch(`https://${HOST}${URI}`, {
        method: 'POST',
        headers: signRequest('POST', HOST, URI, REGION, SERVICE, additionalPayload,
          process.env.AMAZON_PA_API_KEY || '', process.env.AMAZON_PA_API_SECRET || '').headers,
        body: additionalPayload
      })
    ])

    if (!preferredResponse.ok || !additionalResponse.ok) {
      throw new Error('Failed to fetch products')
    }

    const preferredData = await preferredResponse.json()
    const additionalData = await additionalResponse.json()

    // Process preferred products
    const preferredProducts = preferredData?.ItemsResult?.Items?.map((item: any) => ({
      asin: item.ASIN,
      title: item.ItemInfo.Title.DisplayValue,
      imageUrl: item.Images.Primary.Large.URL,
      affiliateUrl: `https://www.amazon.com/dp/${item.ASIN}?tag=${process.env.AMAZON_ASSOCIATE_TAG}`,
      features: item.ItemInfo.Features?.DisplayValues || [],
      prime: item.Offers?.Listings?.[0]?.DeliveryInfo?.IsPrimeEligible || false,
      rating: item.CustomerReviews?.StarRating || null,
      reviewCount: item.CustomerReviews?.Count || 0
    })) || []

    // Process additional products
    const additionalProducts = additionalData?.ItemsResult?.Items?.map((item: any) => ({
      asin: item.ASIN,
      title: item.ItemInfo.Title.DisplayValue,
      imageUrl: item.Images.Primary.Large.URL,
      affiliateUrl: `https://www.amazon.com/dp/${item.ASIN}?tag=${process.env.AMAZON_ASSOCIATE_TAG}`,
      features: item.ItemInfo.Features?.DisplayValues || [],
      prime: item.Offers?.Listings?.[0]?.DeliveryInfo?.IsPrimeEligible || false,
      rating: item.CustomerReviews?.StarRating || null,
      reviewCount: item.CustomerReviews?.Count || 0
    })) || []

    // Arrange products according to rules
    const arrangedProducts = arrangeProducts(preferredProducts, additionalProducts)

    // Update cache
    productCache.evChargers = {
      data: arrangedProducts,
      timestamp: Date.now()
    }

    return NextResponse.json(arrangedProducts)

  } catch (error) {
    console.error('Amazon PA-API Error:', error)
    
    // If in development, return mock data with proper arrangement
    if (process.env.NODE_ENV === 'development') {
      const mockPreferred = getMockProducts(PREFERRED_EV_CHARGERS.preferredAsins)
      const mockAdditional = getMockProducts(PREFERRED_EV_CHARGERS.additionalAsins)
      const arrangedMock = arrangeProducts(mockPreferred, mockAdditional)
      return NextResponse.json(arrangedMock)
    }

    return NextResponse.json(
      { error: 'Failed to fetch product recommendations' }, 
      { status: 500 }
    )
  }
} 