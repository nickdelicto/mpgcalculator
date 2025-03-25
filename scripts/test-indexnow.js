/**
 * IndexNow Test Runner
 * 
 * This script runs the IndexNow process in dry run mode to test
 * the implementation without making actual submissions.
 */

const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

// Create a temporary backup of the original tracking file
const trackingFilePath = path.join(__dirname, 'last-submitted-urls.json');
let hasBackup = false;
let backupContent = null;

if (fs.existsSync(trackingFilePath)) {
  console.log('Backing up existing tracking file...');
  backupContent = fs.readFileSync(trackingFilePath, 'utf8');
  fs.writeFileSync(`${trackingFilePath}.bak`, backupContent);
  hasBackup = true;
}

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Create log file with timestamp
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const logFile = path.join(logsDir, `test-indexnow-${timestamp}.log`);

console.log(`Starting IndexNow TEST process...`);
console.log(`Logs will be written to: ${logFile}`);

// Copy the auto-indexnow.js to a temp file
const originalFilePath = path.join(__dirname, 'auto-indexnow.js');
const tempFilePath = path.join(__dirname, 'auto-indexnow-test.js');

// Read the original file
const originalContent = fs.readFileSync(originalFilePath, 'utf8');

// Modify the content to set dryRun to true
const modifiedContent = originalContent.replace(/dryRun: false/, 'dryRun: true');

// Write the modified content to the temp file
fs.writeFileSync(tempFilePath, modifiedContent);

console.log('Created temporary test script with dry run mode enabled');

// Add initial entry to the log file
fs.appendFileSync(logFile, `IndexNow TEST process started at ${new Date().toISOString()}\n`);

// Run the temporary script and pipe output to the log file
const logOut = fs.openSync(logFile, 'a');
const logErr = fs.openSync(logFile, 'a');

// Run the temporary script with output redirected to our log file
const child = spawn('node', [tempFilePath], {
  stdio: ['ignore', logOut, logErr],
  detached: false
});

// Wait for the test to complete
child.on('close', (code) => {
  // Close the file descriptors
  fs.closeSync(logOut);
  fs.closeSync(logErr);
  
  // Clean up
  console.log(`Test completed with exit code ${code}`);
  console.log(`Check ${logFile} for detailed logs`);

  // Delete the temp file
  fs.unlinkSync(tempFilePath);
  console.log('Temporary test script removed');
  
  // If we need to restore the backup tracking file
  if (hasBackup) {
    console.log('Restoring tracking file from backup...');
    fs.writeFileSync(trackingFilePath, backupContent);
  }
  
  console.log('\nTest completed! The script found all URLs that would be submitted,');
  console.log('but did NOT actually submit them to search engines.');
  console.log('\nIf everything looks good in the logs, you can run the real process');
  console.log('with npm run indexnow or during your next build.');
}); 