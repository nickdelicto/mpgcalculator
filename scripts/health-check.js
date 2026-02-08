/**
 * Multi-Site Health Check Monitor
 * Pings multiple sites every 3 minutes and sends email alerts via Brevo when any go down.
 * Sends a recovery email when they come back up.
 *
 * Usage: node scripts/health-check.js
 * Or with PM2: pm2 start scripts/health-check.js --name site-monitor
 */

const CHECK_INTERVAL = 3 * 60 * 1000; // 3 minutes
const ALERT_EMAIL = process.env.ALERT_EMAIL || '';
const BREVO_API_KEY = process.env.BREVO_API_KEY || '';
const BREVO_FROM_EMAIL = process.env.BREVO_FROM_EMAIL || 'news@mpgcalculator.net';
const BREVO_FROM_NAME = process.env.BREVO_FROM_NAME || 'Site Monitor';
const ALERT_AFTER_FAILURES = 2; // Alert after 2 consecutive failures (~6 min)

// Sites to monitor
const SITES = [
  'https://mpgcalculator.net',
  'https://intelliresume.net',
  'https://theofficevibes.com'
];

// Track state per site
const siteState = {};
SITES.forEach(url => {
  siteState[url] = {
    isDown: false,
    downSince: null,
    consecutiveFailures: 0
  };
});

async function checkSite(url) {
  const timestamp = new Date().toISOString();
  const state = siteState[url];
  const siteName = new URL(url).hostname;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'SiteMonitor-HealthCheck/1.0' }
    });
    clearTimeout(timeout);

    if (response.ok) {
      if (state.isDown) {
        const downDuration = Math.round((Date.now() - state.downSince) / 1000 / 60);
        console.log(`[${timestamp}] ✅ ${siteName} RECOVERED after ${downDuration} min`);
        await sendAlert(
          `✅ ${siteName} is back up`,
          `${url} recovered at ${timestamp}.\nWas down for approximately ${downDuration} minutes.`
        );
        state.isDown = false;
        state.downSince = null;
        state.consecutiveFailures = 0;
      } else {
        console.log(`[${timestamp}] ✅ ${siteName} OK`);
      }
    } else {
      handleFailure(url, timestamp, `HTTP ${response.status}`);
    }
  } catch (error) {
    handleFailure(url, timestamp, error.message);
  }
}

function handleFailure(url, timestamp, reason) {
  const state = siteState[url];
  const siteName = new URL(url).hostname;
  state.consecutiveFailures++;
  console.log(`[${timestamp}] ❌ ${siteName} FAIL #${state.consecutiveFailures}: ${reason}`);

  if (!state.isDown && state.consecutiveFailures >= ALERT_AFTER_FAILURES) {
    state.isDown = true;
    state.downSince = Date.now();
    console.log(`[${timestamp}] 🚨 ALERTING - ${siteName} appears down`);
    sendAlert(
      `🚨 ${siteName} is DOWN`,
      `${url} is unreachable since ${timestamp}.\nReason: ${reason}\nFailed ${state.consecutiveFailures} consecutive checks.`
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

async function checkAllSites() {
  for (const url of SITES) {
    await checkSite(url);
  }
}

// Startup
console.log('=== Multi-Site Health Check Monitor ===');
console.log(`Sites: ${SITES.join(', ')}`);
console.log(`Check interval: ${CHECK_INTERVAL / 1000}s`);
console.log(`Alert email: ${ALERT_EMAIL || '⚠️ NOT SET (set ALERT_EMAIL env var)'}`);
console.log(`Brevo key: ${BREVO_API_KEY ? 'configured' : '⚠️ NOT SET'}`);
console.log(`Alert after: ${ALERT_AFTER_FAILURES} consecutive failures`);
console.log('=======================================\n');

// Run immediately, then on interval
checkAllSites();
setInterval(checkAllSites, CHECK_INTERVAL);
