import { NextRequest, NextResponse } from 'next/server'
import { unsubscribe } from '../../../lib/gasAlerts'

// One-click unsubscribe. GET = link in the email footer; POST = RFC 8058
// "List-Unsubscribe-Post" button in Gmail/Apple Mail.
const page = (title: string, msg: string) => new NextResponse(
  `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${title}</title></head>
<body style="font-family:Arial,sans-serif;background:#eef4ff;margin:0;padding:48px 16px;color:#111827"><div style="max-width:480px;margin:auto;background:#fff;border-radius:14px;padding:28px">
<h1 style="font-size:22px;margin:0 0 10px">${title}</h1><p style="font-size:16px;color:#374151">${msg}</p>
<p><a href="https://mpgcalculator.net/" style="color:#1d4ed8">Back to MPGCalculator.net</a></p></div></body></html>`,
  { headers: { 'Content-Type': 'text/html; charset=utf-8' } },
)

async function handle(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token') || ''
  if (!/^[A-Za-z0-9_-]{20,64}$/.test(token)) return page('Link not valid', 'This unsubscribe link looks incomplete. Please use the link from your latest email.')
  try {
    const email = await unsubscribe(token)
    return email
      ? page("You're unsubscribed", 'You won’t get any more weekly gas price alerts. Changed your mind? You can sign up again any time on our site.')
      : page('Link not valid', 'We couldn’t find this subscription. You may already be unsubscribed.')
  } catch (e) {
    console.error('gas alert unsubscribe failed:', e instanceof Error ? e.message : e)
    return page('Something went wrong', 'Please try the link again in a minute.')
  }
}

export const GET = handle
export const POST = handle
