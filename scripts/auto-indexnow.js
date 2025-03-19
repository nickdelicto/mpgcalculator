/**
 * Auto IndexNow Submission Script
 * 
 * This script can be integrated with your site's build or update process
 * to automatically submit new or changed URLs to IndexNow.
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Configuration - Update these values with your actual domain info
const config = {
  host: "mpgcalculator.net", // Replace with your actual domain
  key: "e527a7fa63b5479f99538336bdcc2fe9", // Your IndexNow API key
  keyLocation: "https://mpgcalculator.net/e527a7fa63b5479f99538336bdcc2fe9.txt", // Replace with your actual domain
  
  // Path to store the list of previously submitted URLs
  lastSubmittedUrlsFile: path.join(__dirname, 'last-submitted-urls.json'),
  
  // Maximum number of URLs to submit in a single request (IndexNow limit)
  maxUrlsPerBatch: 10000
};

/**
 * Get the list of all current URLs on your site from the Next.js generated sitemap.xml
 * @returns {Promise<Array<string>>} List of all current URLs
 */
async function getAllCurrentUrls() {
  return new Promise((resolve, reject) => {
    // Most reliable approach is to fetch the XML sitemap after build is complete
    const sitemapUrl = `https://${config.host}/sitemap.xml`;
    
    // Use curl to fetch the sitemap
    exec(`curl -s ${sitemapUrl}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error fetching sitemap: ${error.message}`);
        // Fallback to local file if we can't fetch the live sitemap
        try {
          // Check if the sitemap exists locally after build (in .next/server/app)
          const localSitemapPath = path.join(__dirname, '../.next/server/app/sitemap.xml');
          if (fs.existsSync(localSitemapPath)) {
            const sitemapContent = fs.readFileSync(localSitemapPath, 'utf8');
            const urls = parseSitemapXml(sitemapContent);
            resolve(urls);
            return;
          }
        } catch (err) {
          console.error('Error reading local sitemap:', err);
        }
        // If all else fails, return an empty array
        resolve([]);
        return;
      }
      
      if (stderr) {
        console.error(`Error in curl command: ${stderr}`);
      }
      
      // Parse the XML to extract URLs
      const urls = parseSitemapXml(stdout);
      resolve(urls);
    });
  });
}

/**
 * Simple function to parse sitemap XML and extract URLs
 * @param {string} xml - The sitemap XML content
 * @returns {Array<string>} List of URLs from the sitemap
 */
function parseSitemapXml(xml) {
  const urls = [];
  const regex = /<url>[\s\S]*?<loc>(.*?)<\/loc>[\s\S]*?<\/url>/g;
  let match;
  
  while ((match = regex.exec(xml)) !== null) {
    if (match[1]) {
      urls.push(match[1]);
    }
  }
  
  return urls;
}

/**
 * Read the list of previously submitted URLs
 * @returns {Array} List of previously submitted URLs or empty array if none
 */
function getPreviouslySubmittedUrls() {
  try {
    if (fs.existsSync(config.lastSubmittedUrlsFile)) {
      const data = fs.readFileSync(config.lastSubmittedUrlsFile, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading previously submitted URLs:', error);
  }
  return [];
}

/**
 * Save the list of submitted URLs for future comparison
 * @param {Array} urls - List of URLs that were submitted
 */
function saveSubmittedUrls(urls) {
  try {
    fs.writeFileSync(config.lastSubmittedUrlsFile, JSON.stringify(urls, null, 2));
  } catch (error) {
    console.error('Error saving submitted URLs:', error);
  }
}

/**
 * Submit a batch of URLs to IndexNow API
 * @param {Array} urlList - List of URLs to submit
 * @returns {Promise} Promise that resolves when submission is complete
 */
function submitUrlBatch(urlList) {
  return new Promise((resolve, reject) => {
    // Prepare request data
    const data = JSON.stringify({
      host: config.host,
      key: config.key,
      keyLocation: config.keyLocation,
      urlList: urlList
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
        if (res.statusCode === 200) {
          console.log(`Successfully submitted batch of ${urlList.length} URLs`);
          resolve();
        } else {
          console.error(`Error submitting URLs: ${res.statusCode} - ${responseData}`);
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

/**
 * Main function to find new/changed URLs and submit them to IndexNow
 */
async function main() {
  try {
    console.log('Starting IndexNow URL submission process...');
    
    // Get all current URLs
    console.log('Fetching current URLs from sitemap...');
    const currentUrls = await getAllCurrentUrls();
    console.log(`Found ${currentUrls.length} total URLs in sitemap`);
    
    if (currentUrls.length === 0) {
      console.error('No URLs found in sitemap. Aborting.');
      return;
    }
    
    // Get previously submitted URLs
    const previousUrls = getPreviouslySubmittedUrls();
    console.log(`Found ${previousUrls.length} previously submitted URLs`);
    
    // Find new or changed URLs
    const newUrls = currentUrls.filter(url => !previousUrls.includes(url));
    
    if (newUrls.length === 0) {
      console.log('No new URLs to submit');
      return;
    }
    
    console.log(`Found ${newUrls.length} new URLs to submit to search engines`);
    
    // Submit URLs in batches to avoid hitting IndexNow limits
    for (let i = 0; i < newUrls.length; i += config.maxUrlsPerBatch) {
      const batch = newUrls.slice(i, i + config.maxUrlsPerBatch);
      console.log(`Submitting batch ${Math.floor(i/config.maxUrlsPerBatch) + 1} (${batch.length} URLs)...`);
      await submitUrlBatch(batch);
    }
    
    // Save the current URLs as "previously submitted"
    saveSubmittedUrls(currentUrls);
    
    console.log('IndexNow submission completed successfully');
  } catch (error) {
    console.error('Error in IndexNow submission process:', error);
  }
}

// Run the main function
main(); 