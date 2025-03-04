import { NextResponse } from 'next/server'
import { PREFERRED_EV_CHARGERS } from '../../../config/amazon-products'
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

export async function GET() {
  try {
    // Check cache first
    if (productCache.evChargers && 
        Date.now() - productCache.evChargers.timestamp < CACHE_DURATION) {
      return NextResponse.json(productCache.evChargers.data)
    }

    // Log credentials (remove in production)
    console.log('API Key exists:', !!process.env.AMAZON_PA_API_KEY)
    console.log('Secret Key exists:', !!process.env.AMAZON_PA_API_SECRET)
    console.log('Associate Tag exists:', !!process.env.AMAZON_ASSOCIATE_TAG)

    // Always include all preferred ASINs
    const preferredAsins = [...PREFERRED_EV_CHARGERS.preferredAsins]
    console.log('Preferred ASINs:', preferredAsins)

    // Calculate how many additional products we need
    const additionalNeeded = PREFERRED_EV_CHARGERS.settings.maxDisplay - preferredAsins.length
    
    let allProducts: AmazonProduct[] = []

    // First, get preferred products
    const preferredPayload = JSON.stringify({
      ItemIds: preferredAsins,
      Resources: [
        'Images.Primary.Large',
        'ItemInfo.Title',
        'ItemInfo.Features',
        'Offers.Listings.Price',
        'Offers.Listings.DeliveryInfo.IsPrimeEligible'
      ],
      PartnerTag: process.env.AMAZON_ASSOCIATE_TAG,
      PartnerType: 'Associates',
      Marketplace: 'www.amazon.com'
    })

    console.log('Preferred products request payload:', preferredPayload)

    // Sign and make the request for preferred products
    const preferredRequestOptions = signRequest(
      'POST',
      HOST,
      URI,
      REGION,
      SERVICE,
      preferredPayload,
      process.env.AMAZON_PA_API_KEY || '',
      process.env.AMAZON_PA_API_SECRET || ''
    )

    const preferredResponse = await fetch(`https://${HOST}${URI}`, {
      method: 'POST',
      headers: preferredRequestOptions.headers,
      body: preferredPayload
    })

    if (!preferredResponse.ok) {
      console.error('Preferred products API Error:', await preferredResponse.text())
      throw new Error('Failed to fetch preferred products')
    }

    const preferredData = await preferredResponse.json()
    if (preferredData?.ItemsResult?.Items) {
      allProducts = preferredData.ItemsResult.Items.map((item: any) => ({
        asin: item.ASIN,
        title: item.ItemInfo.Title.DisplayValue,
        imageUrl: item.Images.Primary.Large.URL,
        affiliateUrl: `https://www.amazon.com/dp/${item.ASIN}?tag=${process.env.AMAZON_ASSOCIATE_TAG}`,
        features: item.ItemInfo.Features?.DisplayValues || [],
        prime: item.Offers?.Listings?.[0]?.DeliveryInfo?.IsPrimeEligible || false
      }))
    }

    // If we need additional products and we're not in development mode
    if (additionalNeeded > 0 && process.env.NODE_ENV !== 'development') {
      try {
        const additionalProducts = await searchAdditionalProducts(additionalNeeded)
        const additionalProcessed = additionalProducts
          .filter((item: any) => !preferredAsins.includes(item.ASIN))
          .map((item: any) => ({
            asin: item.ASIN,
            title: item.ItemInfo.Title.DisplayValue,
            imageUrl: item.Images.Primary.Large.URL,
            affiliateUrl: `https://www.amazon.com/dp/${item.ASIN}?tag=${process.env.AMAZON_ASSOCIATE_TAG}`,
            features: item.ItemInfo.Features?.DisplayValues || [],
            prime: item.Offers?.Listings?.[0]?.DeliveryInfo?.IsPrimeEligible || false
          }))
          .slice(0, additionalNeeded)

        allProducts = [...allProducts, ...additionalProcessed]
      } catch (error) {
        console.error('Error fetching additional products:', error)
        // Continue with just the preferred products
      }
    }

    // Update cache
    productCache.evChargers = {
      data: allProducts,
      timestamp: Date.now()
    }

    return NextResponse.json(allProducts)

  } catch (error) {
    console.error('Amazon PA-API Error:', error)
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace')
    
    // If cache exists but is expired, use it as fallback
    if (productCache.evChargers) {
      console.log('Using expired cache as fallback')
      return NextResponse.json(productCache.evChargers.data)
    }

    // Use mock data in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Using mock data in development')
      const mockProducts = getMockProducts(PREFERRED_EV_CHARGERS.preferredAsins)
      return NextResponse.json(mockProducts)
    }

    return NextResponse.json(
      { error: 'Failed to fetch product recommendations' }, 
      { status: 500 }
    )
  }
} 