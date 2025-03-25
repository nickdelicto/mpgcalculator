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
  
  // Maximum number of URLs to submit in a single request (reduced from 10000 to 50)
  maxUrlsPerBatch: 50,
  
  // Delay between batch submissions in milliseconds (3 minutes)
  delayBetweenBatches: 180000,
  
  // Set to true to test without actually submitting URLs to search engines
  dryRun: false
};

/**
 * Helper function to introduce a delay between actions
 * @param {number} ms - Time to delay in milliseconds
 * @returns {Promise} Promise that resolves after the delay
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Verify that the key file is accessible and valid
 * @returns {Promise<boolean>} Whether the key file is valid
 */
async function verifyKeyFile() {
  return new Promise((resolve) => {
    const keyUrl = config.keyLocation;
    console.log(`Verifying key file at ${keyUrl}`);
    
    exec(`curl -s ${keyUrl}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error checking key file: ${error.message}`);
        resolve(false);
        return;
      }
      
      if (stderr) {
        console.error(`Error in curl command: ${stderr}`);
      }
      
      // Check if the response contains the correct key
      if (stdout.trim() === config.key) {
        console.log('Key file verification successful');
        resolve(true);
      } else {
        console.error(`Key file verification failed. Expected: ${config.key}, Got: ${stdout.trim()}`);
        resolve(false);
      }
    });
  });
}

/**
 * Get the list of all current URLs on your site from the Next.js generated sitemap.xml
 * @returns {Promise<Array<string>>} List of all current URLs
 */
async function getAllCurrentUrls() {
  return new Promise((resolve, reject) => {
    // Most reliable approach is to fetch the XML sitemap after build is complete
    const sitemapUrl = `https://${config.host}/sitemap.xml`;
    
    console.log(`Attempting to fetch sitemap from ${sitemapUrl}`);
    
    // Use curl with increased buffer size to fetch the sitemap
    exec(`curl -s ${sitemapUrl}`, { maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error fetching remote sitemap: ${error.message}`);
        
        // Try multiple potential locations for the local sitemap file
        const possibleSitemapPaths = [
          path.join(__dirname, '../.next/server/app/sitemap.xml'),
          path.join(__dirname, '../.next/server/pages/sitemap.xml'),
          path.join(__dirname, '../public/sitemap.xml')
        ];
        
        console.log('Attempting to find local sitemap file...');
        for (const sitemapPath of possibleSitemapPaths) {
          console.log(`Checking ${sitemapPath}`);
          try {
            if (fs.existsSync(sitemapPath) && fs.lstatSync(sitemapPath).isFile()) {
              console.log(`Found sitemap at ${sitemapPath}`);
              const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
              const urls = parseSitemapXml(sitemapContent);
              console.log(`Parsed ${urls.length} URLs from local sitemap`);
              resolve(urls);
              return;
            }
          } catch (err) {
            console.error(`Error checking ${sitemapPath}:`, err);
          }
        }

        // If we can't find the sitemap file, let's try to search for it
        console.log('Searching for sitemap.xml in build output directory...');
        try {
          const findSitemap = (dir) => {
            const files = fs.readdirSync(dir);
            for (const file of files) {
              const fullPath = path.join(dir, file);
              try {
                const stat = fs.statSync(fullPath);
                if (stat.isDirectory()) {
                  const found = findSitemap(fullPath);
                  if (found) return found;
                } else if (file === 'sitemap.xml') {
                  return fullPath;
                }
              } catch (err) {
                // Skip files we can't access
              }
            }
            return null;
          };
          
          const sitemapPath = findSitemap(path.join(__dirname, '../.next'));
          if (sitemapPath) {
            console.log(`Found sitemap at ${sitemapPath}`);
            const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
            const urls = parseSitemapXml(sitemapContent);
            console.log(`Parsed ${urls.length} URLs from found sitemap`);
            resolve(urls);
            return;
          }
        } catch (err) {
          console.error('Error searching for sitemap:', err);
        }
        
        // If all else fails, let's create a minimal list of known URLs
        console.log('Could not find sitemap. Using fallback URLs...');
        const fallbackUrls = [
          `https://${config.host}/`,
          `https://${config.host}/vehicles`,
          `https://${config.host}/fuel-savings-calculator`,
          `https://${config.host}/fuel-economy-compare`
        ];
        console.log(`Using ${fallbackUrls.length} fallback URLs`);
        resolve(fallbackUrls);
        return;
      }
      
      if (stderr) {
        console.error(`Error in curl command: ${stderr}`);
      }
      
      // Parse the XML to extract URLs
      const urls = parseSitemapXml(stdout);
      console.log(`Parsed ${urls.length} URLs from remote sitemap`);
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
    // In dry run mode, just log and don't actually submit
    if (config.dryRun) {
      console.log(`[DRY RUN] Would submit these URLs to IndexNow:`);
      urlList.forEach(url => console.log(`[DRY RUN] - ${url}`));
      console.log(`[DRY RUN] Successfully simulated submission of ${urlList.length} URLs`);
      resolve();
      return;
    }
    
    // Regular submission code continues below
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
        // 202 (Accepted) should be treated as success
        // This is Bing's way of saying "I've accepted your submission and will process it asynchronously"
        if (res.statusCode === 200 || res.statusCode === 202) {
          console.log(`Successfully submitted batch of ${urlList.length} URLs (Status: ${res.statusCode})`);
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
    
    if (config.dryRun) {
      console.log(`
=======================================================
RUNNING IN DRY RUN MODE
-------------------------------------------------------
URLs will be processed but NOT actually submitted to search engines.
This is perfect for testing. Set config.dryRun = false for real submissions.
=======================================================
`);
    }
    
    console.log(`Using streaming approach with batch size of ${config.maxUrlsPerBatch} URLs and ${config.delayBetweenBatches/1000} second delays`);
    
    // First verify the key file is accessible
    const isKeyValid = await verifyKeyFile();
    if (!isKeyValid) {
      console.error(`
=======================================================
ERROR: Your key file could not be verified!
-------------------------------------------------------
1. Make sure the file ${config.key}.txt exists at the root of your website
2. The file should contain only: ${config.key}
3. The file should be accessible at: ${config.keyLocation}

Until this is fixed, search engines won't accept your IndexNow submissions.
=======================================================
`);
      // Continue with the process, but warn that submissions might fail
    }
    
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
    
    // For initial testing, limit to a small batch to avoid overwhelming the API
    const isInitialTest = previousUrls.length === 0 && newUrls.length > 10;
    const batchSize = isInitialTest ? 5 : config.maxUrlsPerBatch;
    
    if (isInitialTest) {
      console.log(`TESTING MODE: Limiting initial submission to ${batchSize} URLs for testing`);
    }
    
    // Calculate total number of batches
    const totalBatches = Math.ceil(
      (isInitialTest ? batchSize : newUrls.length) / batchSize
    );
    console.log(`URLs will be submitted in ${totalBatches} batch(es)`);
    
    // Track successfully submitted URLs
    const submittedUrls = [];
    
    // Submit URLs in batches to avoid hitting IndexNow limits
    for (let i = 0; i < (isInitialTest ? batchSize : newUrls.length); i += batchSize) {
      const batch = newUrls.slice(i, i + batchSize);
      const batchNumber = Math.floor(i/batchSize) + 1;
      
      console.log(`Submitting batch ${batchNumber} of ${totalBatches} (${batch.length} URLs)...`);
      
      try {
        await submitUrlBatch(batch);
        
        // Add batch URLs to the submitted list
        submittedUrls.push(...batch);
        
        // If we're in test mode and the first batch succeeds, save just these URLs
        if (isInitialTest) {
          console.log('Test submission successful! Saving these URLs as submitted.');
          saveSubmittedUrls(batch);
          console.log(`
=======================================================
SUCCESS! Test submission of ${batch.length} URLs was accepted.
-------------------------------------------------------
To submit all ${newUrls.length} URLs, run this script again.
Each run will submit more URLs until all are processed.
=======================================================
`);
          return;
        }
        
        // Add delay between batches (except for the last one)
        if (i + batchSize < (isInitialTest ? batchSize : newUrls.length)) {
          console.log(`Waiting ${config.delayBetweenBatches/1000} seconds before next batch...`);
          await delay(config.delayBetweenBatches);
        }
      } catch (error) {
        console.error(`Error submitting batch: ${error.message}`);
        if (i === 0) {
          // If the first batch fails, stop the process
          throw error;
        } else {
          // If a later batch fails, save what we've submitted so far
          console.log('Saving successfully submitted URLs up to this point');
          if (submittedUrls.length > 0) {
            saveSubmittedUrls([...previousUrls, ...submittedUrls]);
          }
          return;
        }
      }
    }
    
    // Save the current URLs as "previously submitted"
    saveSubmittedUrls([...previousUrls, ...submittedUrls]);
    
    console.log('IndexNow submission completed successfully');
  } catch (error) {
    console.error('Error in IndexNow submission process:', error);
  }
}

// Run the main function
main(); 