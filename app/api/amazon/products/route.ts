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

// Always run at request time: caching and backoff are handled in memory below.
// (Without this, Next prerenders the route at build time and bakes in whatever Amazon answered then.)
export const dynamic = 'force-dynamic'

const CACHE_DURATION = 6 * 60 * 60 * 1000  // 6 hours
let productCache: ProductCache = {}

// Failure handling: when Amazon refuses, stop calling it for a while instead of
// hitting it (and logging) on every page view.
const LOG_DEDUPE_WINDOW = 60 * 60 * 1000          // log each distinct error at most once an hour
const BACKOFF_ACCOUNT = 6 * 60 * 60 * 1000        // auth / eligibility refusals (403, 401, AssociateNotEligible...)
const BACKOFF_THROTTLED = 10 * 60 * 1000          // 429 TooManyRequests
const BACKOFF_TRANSIENT = 5 * 60 * 1000           // 5xx, network errors, unexpected responses

// Error codes that mean the account/credentials are refused, not a passing hiccup
const ACCOUNT_ERROR_CODES = new Set([
  'AssociateNotEligible',
  'AccessDenied',
  'AccessDeniedException',
  'InvalidSignature',
  'IncompleteSignature',
  'InvalidPartnerTag',
  'InvalidAssociate',
  'UnrecognizedClient',
  'UnrecognizedClientException',
  'MissingAuthenticationToken'
])

interface PaapiFailure {
  status: number
  code: string
  message: string
}

let backoffUntil = 0
const loggedErrors = new Map<string, number>()
let inFlight: Promise<AmazonProduct[]> | null = null

function logOnce(failure: PaapiFailure, backoffMs: number) {
  const key = `${failure.status}:${failure.code}`
  const now = Date.now()
  const last = loggedErrors.get(key)
  if (last && now - last < LOG_DEDUPE_WINDOW) return
  loggedErrors.set(key, now)
  console.error(
    `Amazon PA-API ${failure.status} ${failure.code}: ${failure.message} ` +
    `(pausing Amazon calls for ${Math.round(backoffMs / 60000)} min)`
  )
}

function backoffFor(failure: PaapiFailure): number {
  if (failure.status === 429 || failure.code === 'TooManyRequests') return BACKOFF_THROTTLED
  if (failure.status === 401 || failure.status === 403 || ACCOUNT_ERROR_CODES.has(failure.code)) {
    return BACKOFF_ACCOUNT
  }
  return BACKOFF_TRANSIENT
}

function recordFailure(failure: PaapiFailure) {
  const backoffMs = backoffFor(failure)
  backoffUntil = Date.now() + backoffMs
  logOnce(failure, backoffMs)
}

// Read Amazon's error body ({ Errors: [{ Code, Message }] }) without throwing
async function parseFailure(response: Response): Promise<PaapiFailure> {
  let code = 'UnknownError'
  let message = response.statusText || 'No error message'
  try {
    const body = await response.json()
    const first = body?.Errors?.[0]
    if (first?.Code) code = first.Code
    if (first?.Message) message = first.Message
  } catch {
    // Non-JSON body, keep the status text
  }
  return { status: response.status, code, message }
}

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
    process.env.AMAZON_PA_API_SECRET || '',
    'SearchItems'
  )

  // Make the request
  const response = await fetch(`https://${HOST}${SEARCH_URI}`, {
    method: 'POST',
    headers: requestOptions.headers,
    body: payload
  })

  if (!response.ok) {
    recordFailure(await parseFailure(response))
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

const ITEM_RESOURCES = [
  'Images.Primary.Large',
  'ItemInfo.Title',
  'ItemInfo.Features',
  'Offers.Listings.Price',
  'Offers.Listings.DeliveryInfo.IsPrimeEligible',
  'CustomerReviews.Count',
  'CustomerReviews.StarRating'
]

// Fetch a list of ASINs via GetItems. Returns null (and records the failure) when Amazon refuses.
async function getItems(asins: string[]): Promise<any[] | null> {
  const payload = JSON.stringify({
    ItemIds: asins,
    Resources: ITEM_RESOURCES,
    PartnerTag: process.env.AMAZON_ASSOCIATE_TAG,
    PartnerType: 'Associates',
    Marketplace: 'www.amazon.com'
  })

  const response = await fetch(`https://${HOST}${URI}`, {
    method: 'POST',
    headers: signRequest('POST', HOST, URI, REGION, SERVICE, payload,
      process.env.AMAZON_PA_API_KEY || '', process.env.AMAZON_PA_API_SECRET || '', 'GetItems').headers,
    body: payload
  })

  if (!response.ok) {
    recordFailure(await parseFailure(response))
    return null
  }

  const data = await response.json()
  return data?.ItemsResult?.Items || []
}

function toProduct(item: any): AmazonProduct | null {
  const title = item?.ItemInfo?.Title?.DisplayValue
  const imageUrl = item?.Images?.Primary?.Large?.URL
  if (!item?.ASIN || !title || !imageUrl) return null
  return {
    asin: item.ASIN,
    title,
    imageUrl,
    affiliateUrl: `https://www.amazon.com/dp/${item.ASIN}?tag=${process.env.AMAZON_ASSOCIATE_TAG}`,
    features: item.ItemInfo.Features?.DisplayValues || [],
    prime: item.Offers?.Listings?.[0]?.DeliveryInfo?.IsPrimeEligible || false,
    rating: item.CustomerReviews?.StarRating || null,
    reviewCount: item.CustomerReviews?.Count || 0
  } as AmazonProduct
}

async function fetchProducts(): Promise<AmazonProduct[]> {
  const [preferredItems, additionalItems] = await Promise.all([
    getItems([...PREFERRED_EV_CHARGERS.preferredAsins]),
    getItems([...PREFERRED_EV_CHARGERS.additionalAsins])
  ])

  if (!preferredItems || !additionalItems) return []

  const preferredProducts = preferredItems.map(toProduct).filter((p): p is AmazonProduct => p !== null)
  const additionalProducts = additionalItems.map(toProduct).filter((p): p is AmazonProduct => p !== null)

  // Arrange products according to rules
  const arrangedProducts = arrangeProducts(preferredProducts, additionalProducts).filter(Boolean)

  if (!arrangedProducts.length) {
    // 200 but nothing usable (e.g. every ASIN unavailable): treat as transient so we retry later
    recordFailure({ status: 200, code: 'NoItems', message: 'GetItems returned no usable products' })
    return []
  }

  productCache.evChargers = { data: arrangedProducts, timestamp: Date.now() }
  return arrangedProducts
}

function getDevMockProducts(): AmazonProduct[] {
  const mockPreferred = getMockProducts(PREFERRED_EV_CHARGERS.preferredAsins)
  const mockAdditional = getMockProducts(PREFERRED_EV_CHARGERS.additionalAsins)
  return arrangeProducts(mockPreferred, mockAdditional)
}

// Always answers 200 with an array: an empty array means "no products right now",
// and the pages simply hide the products box.
export async function GET() {
  // Check cache first
  if (productCache.evChargers &&
      Date.now() - productCache.evChargers.timestamp < CACHE_DURATION) {
    return NextResponse.json(productCache.evChargers.data)
  }

  // Amazon refused recently: don't call it again until the backoff expires
  if (Date.now() < backoffUntil) {
    return NextResponse.json(process.env.NODE_ENV === 'development' ? getDevMockProducts() : [])
  }

  try {
    // Concurrent page views share one Amazon request instead of each firing their own
    if (!inFlight) {
      inFlight = fetchProducts().finally(() => { inFlight = null })
    }
    const products = await inFlight

    if (!products.length && process.env.NODE_ENV === 'development') {
      return NextResponse.json(getDevMockProducts())
    }
    return NextResponse.json(products)
  } catch (error) {
    recordFailure({
      status: 0,
      code: error instanceof Error ? error.name : 'UnknownError',
      message: error instanceof Error ? error.message : String(error)
    })
    return NextResponse.json(process.env.NODE_ENV === 'development' ? getDevMockProducts() : [])
  }
}
