/**
 * IndexNow Live Submission Test
 * 
 * This script tests a real submission to IndexNow with a single URL.
 * It's useful for verifying your IndexNow configuration works correctly
 * before running the full process.
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuration - Update these values with your actual domain info
const config = {
  host: "mpgcalculator.net", // Replace with your actual domain
  key: "e527a7fa63b5479f99538336bdcc2fe9", // Your IndexNow API key
  keyLocation: "https://mpgcalculator.net/e527a7fa63b5479f99538336bdcc2fe9.txt", // Replace with your actual domain
};

/**
 * Test a real submission to IndexNow with a single URL
 * @returns {Promise} Promise that resolves when submission is complete
 */
function testSubmission() {
  return new Promise((resolve, reject) => {
    // The URL to submit - using the homepage for the test
    const testUrl = `https://${config.host}/`;
    
    console.log(`Testing submission with URL: ${testUrl}`);
    
    // Prepare request data
    const data = JSON.stringify({
      host: config.host,
      key: config.key,
      keyLocation: config.keyLocation,
      urlList: [testUrl]
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
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        console.log(`Response Status: ${res.statusCode}`);
        console.log(`Response Body: ${responseData}`);
        
        if (res.statusCode === 200 || res.statusCode === 202) {
          console.log('✅ Test successful! Your IndexNow setup is working correctly.');
          resolve();
        } else {
          console.error('❌ Test failed. Please check your IndexNow configuration.');
          reject(new Error(`HTTP Error: ${res.statusCode}`));
        }
      });
    });

    req.on('error', (error) => {
      console.error(`Error submitting to IndexNow: ${error}`);
      reject(error);
    });

    // Write data to request body
    req.write(data);
    req.end();
  });
}

// Run the test
console.log('='.repeat(50));
console.log('INDEXNOW SUBMISSION TEST');
console.log('='.repeat(50));
console.log(`Testing configuration for domain: ${config.host}`);
console.log(`API Key: ${config.key}`);
console.log(`Key Location: ${config.keyLocation}`);
console.log('-'.repeat(50));

testSubmission()
  .then(() => {
    console.log('\nTest completed successfully! Your IndexNow setup is working.');
    console.log('You can now safely use the full auto-indexnow.js script.');
  })
  .catch((error) => {
    console.error('\nTest failed with error:', error.message);
    console.error('Please check your IndexNow configuration and try again.');
  }); 