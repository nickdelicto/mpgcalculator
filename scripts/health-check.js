/**
 * Site Health Check Monitor
 * Pings the site every 3 minutes and sends an email alert via Brevo if it's down.
 * Sends a recovery email when it comes back up.
 *
 * Usage: node scripts/health-check.js
 * Or with PM2: pm2 start scripts/health-check.js --name site-monitor
 */

const SITE_URL = process.env.SITE_MONITOR_URL || 'https://mpgcalculator.net';
const CHECK_INTERVAL = 3 * 60 * 1000; // 3 minutes
const ALERT_EMAIL = process.env.ALERT_EMAIL || '';
const BREVO_API_KEY = process.env.BREVO_API_KEY || '';
const BREVO_FROM_EMAIL = process.env.BREVO_FROM_EMAIL || 'news@mpgcalculator.net';
const BREVO_FROM_NAME = process.env.BREVO_FROM_NAME || 'MPGCalculator.net';

let isDown = false;
let downSince = null;
let consecutiveFailures = 0;
const ALERT_AFTER_FAILURES = 2; // Alert after 2 consecutive failures (~6 min)

async function checkSite() {
  const timestamp = new Date().toISOString();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout

    const response = await fetch(SITE_URL, {
      signal: controller.signal,
      headers: { 'User-Agent': 'MPGCalculator-HealthCheck/1.0' }
    });
    clearTimeout(timeout);

    if (response.ok) {
      if (isDown) {
        // Site recovered
        const downDuration = Math.round((Date.now() - downSince) / 1000 / 60);
        console.log(`[${timestamp}] ✅ RECOVERED after ${downDuration} minutes`);
        await sendAlert(
          `✅ ${SITE_URL} is back up`,
          `Site recovered at ${timestamp}.\nWas down for approximately ${downDuration} minutes.`
        );
        isDown = false;
        downSince = null;
        consecutiveFailures = 0;
      } else {
        console.log(`[${timestamp}] ✅ OK (${response.status})`);
      }
    } else {
      handleFailure(timestamp, `HTTP ${response.status}`);
    }
  } catch (error) {
    handleFailure(timestamp, error.message);
  }
}

function handleFailure(timestamp, reason) {
  consecutiveFailures++;
  console.log(`[${timestamp}] ❌ FAIL #${consecutiveFailures}: ${reason}`);

  if (!isDown && consecutiveFailures >= ALERT_AFTER_FAILURES) {
    isDown = true;
    downSince = Date.now();
    console.log(`[${timestamp}] 🚨 ALERTING - site appears down`);
    sendAlert(
      `🚨 ${SITE_URL} is DOWN`,
      `Site is unreachable since ${timestamp}.\nReason: ${reason}\nFailed ${consecutiveFailures} consecutive checks.`
    );
  }
}

async function sendAlert(subject, body) {
  if (!BREVO_API_KEY || !ALERT_EMAIL) {
    console.log('⚠️  No BREVO_API_KEY or ALERT_EMAIL configured, skipping email alert');
    console.log(`Would have sent: ${subject}`);
    return;
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: { name: BREVO_FROM_NAME, email: BREVO_FROM_EMAIL },
        to: [{ email: ALERT_EMAIL }],
        subject: subject,
        textContent: body
      })
    });

    if (response.ok) {
      console.log('📧 Alert email sent successfully');
    } else {
      const err = await response.text();
      console.error('📧 Failed to send alert email:', err);
    }
  } catch (error) {
    console.error('📧 Error sending alert email:', error.message);
  }
}

// Startup
console.log('=== Site Health Check Monitor ===');
console.log(`URL: ${SITE_URL}`);
console.log(`Check interval: ${CHECK_INTERVAL / 1000}s`);
console.log(`Alert email: ${ALERT_EMAIL || '⚠️ NOT SET (set ALERT_EMAIL env var)'}`);
console.log(`Brevo key: ${BREVO_API_KEY ? 'configured' : '⚠️ NOT SET'}`);
console.log(`Alert after: ${ALERT_AFTER_FAILURES} consecutive failures`);
console.log('================================\n');

// Run immediately, then on interval
checkSite();
setInterval(checkSite, CHECK_INTERVAL);
