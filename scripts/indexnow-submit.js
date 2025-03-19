/**
 * IndexNow URL Submission Script
 * 
 * This script submits URLs to search engines via the IndexNow protocol.
 * It allows bulk submission of URLs that have been added, updated, or deleted.
 */

const https = require('https');

// Configuration - Update these values with your actual domain info
const config = {
  host: "mpgcalculator.net", // Replace with your actual domain
  key: "e527a7fa63b5479f99538336bdcc2fe9", // Your IndexNow API key
  keyLocation: "https://mpgcalculator.net/e527a7fa63b5479f99538336bdcc2fe9.txt" // Replace with your actual domain
};

/**
 * Submits a list of URLs to IndexNow API
 * @param {Array} urlList - List of URLs to submit
 */
function submitUrlsToIndexNow(urlList) {
  // Validate URLs belong to configured host
  const validUrls = urlList.filter(url => {
    try {
      const urlObj = new URL(url);
      return urlObj.host === config.host;
    } catch (e) {
      console.error(`Invalid URL: ${url}`);
      return false;
    }
  });

  if (validUrls.length === 0) {
    console.error('No valid URLs to submit');
    return;
  }

  // Prepare request data
  const data = JSON.stringify({
    host: config.host,
    key: config.key,
    keyLocation: config.keyLocation,
    urlList: validUrls
  });

  // Configure request options
  const options = {
    hostname: 'api.indexnow.org',
    port: 443,
    path: '/IndexNow',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Length': data.length
    }
  };

  // Send request
  const req = https.request(options, (res) => {
    console.log(`StatusCode: ${res.statusCode}`);
    
    res.on('data', (chunk) => {
      console.log(`Response: ${chunk}`);
    });
  });

  req.on('error', (error) => {
    console.error(`Error submitting to IndexNow: ${error}`);
  });

  // Write data to request body
  req.write(data);
  req.end();

  console.log(`Submitted ${validUrls.length} URLs to IndexNow`);
}

// Example usage (remove or modify for your actual implementation)
// Pass URLs as command line arguments: node indexnow-submit.js https://your-domain.com/page1 https://your-domain.com/page2
if (process.argv.length > 2) {
  const urlsToSubmit = process.argv.slice(2);
  submitUrlsToIndexNow(urlsToSubmit);
} else {
  console.log('Usage: node indexnow-submit.js URL1 URL2 URL3 ...');
} 