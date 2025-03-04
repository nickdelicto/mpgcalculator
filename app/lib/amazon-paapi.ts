import crypto from 'crypto'

interface RequestOptions {
  method: string
  headers: Record<string, string>
  body?: string
}

// AWS Signature V4 helper functions
function getAmzDate(date: Date) {
  return date.toISOString().replace(/[:-]|\.\d{3}/g, '')
}

function getDateStamp(date: Date) {
  return date.toISOString().split('T')[0].replace(/-/g, '')
}

function hmac(key: string | Buffer, string: string) {
  return crypto.createHmac('sha256', key).update(string).digest()
}

function hash(string: string) {
  return crypto.createHash('sha256').update(string).digest('hex')
}

// Create canonical request
function createCanonicalRequest(
  method: string,
  canonicalUri: string,
  canonicalQuerystring: string,
  canonicalHeaders: string,
  signedHeaders: string,
  payload: string
) {
  return [
    method,
    canonicalUri,
    canonicalQuerystring,
    canonicalHeaders,
    signedHeaders,
    hash(payload)
  ].join('\n')
}

// Create string to sign
function createStringToSign(
  amzDate: string,
  dateStamp: string,
  region: string,
  service: string,
  canonicalRequest: string
) {
  return [
    'AWS4-HMAC-SHA256',
    amzDate,
    `${dateStamp}/${region}/${service}/aws4_request`,
    hash(canonicalRequest)
  ].join('\n')
}

// Calculate signature
function calculateSignature(
  dateStamp: string,
  region: string,
  service: string,
  secretKey: string,
  stringToSign: string
) {
  const kDate = hmac(`AWS4${secretKey}`, dateStamp)
  const kRegion = hmac(kDate, region)
  const kService = hmac(kRegion, service)
  const kSigning = hmac(kService, 'aws4_request')
  return crypto.createHmac('sha256', kSigning).update(stringToSign).digest('hex')
}

// Main function to sign request
export function signRequest(
  method: string,
  host: string,
  uri: string,
  region: string,
  service: string,
  payload: string,
  accessKey: string,
  secretKey: string
): RequestOptions {
  const date = new Date()
  const amzDate = getAmzDate(date)
  const dateStamp = getDateStamp(date)

  // Create canonical headers (must be sorted)
  const headers = {
    'content-encoding': 'amz-1.0',
    'content-type': 'application/json; charset=utf-8',
    'host': host,
    'x-amz-date': amzDate,
    'x-amz-target': 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.GetItems'
  }

  const canonicalHeaders = Object.entries(headers)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}:${value}`)
    .join('\n') + '\n'

  const signedHeaders = Object.keys(headers)
    .sort()
    .join(';')

  // Create canonical request
  const canonicalRequest = createCanonicalRequest(
    method,
    uri,
    '',
    canonicalHeaders,
    signedHeaders,
    payload
  )

  // Create string to sign
  const stringToSign = createStringToSign(
    amzDate,
    dateStamp,
    region,
    service,
    canonicalRequest
  )

  // Calculate signature
  const signature = calculateSignature(
    dateStamp,
    region,
    service,
    secretKey,
    stringToSign
  )

  // Create authorization header
  const authorizationHeader = 'AWS4-HMAC-SHA256 ' + [
    `Credential=${accessKey}/${dateStamp}/${region}/${service}/aws4_request`,
    `SignedHeaders=${signedHeaders}`,
    `Signature=${signature}`
  ].join(', ')

  return {
    method,
    headers: {
      ...headers,
      'Authorization': authorizationHeader
    }
  }
} 