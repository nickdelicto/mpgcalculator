/**
 * IndexNow Background Process Starter
 * 
 * This script launches the IndexNow submission process in the background,
 * allowing the build process to complete immediately.
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Create log file with timestamp
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const logFile = path.join(logsDir, `indexnow-${timestamp}.log`);
const logStream = fs.createWriteStream(logFile, { flags: 'a' });

// Log the start of the process
logStream.write(`IndexNow background process started at ${new Date().toISOString()}\n`);

console.log(`Starting IndexNow submission process in the background...`);
console.log(`Logs will be written to: ${logFile}`);

// Create the background process
const child = spawn('node', [path.join(__dirname, 'auto-indexnow.js')], {
  detached: true,
  stdio: ['ignore', logStream, logStream]
});

// Allow the parent process to exit independently
child.unref();

console.log('IndexNow process started in background. Build process complete.'); 