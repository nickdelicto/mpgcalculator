import { NextRequest, NextResponse } from 'next/server'
import { getPriceSnapshot, previousWeekGas } from '../../../lib/energyPrices'
import { buildGasAlertEmail } from '../../../lib/gasAlertEmail'

// Development only: renders the alert email in the browser for review.
// /api/gas-alerts/preview?state=OH&fuel=gas&eff=28&miles=250&welcome=1
export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV !== 'development') return new NextResponse('Not found', { status: 404 })
  const q = req.nextUrl.searchParams
  const state = (q.get('state') || 'OH').toUpperCase()
  const fuel = q.get('fuel') === 'ev' ? 'ev' : 'gas'
  const mail = buildGasAlertEmail(
    { fuel, efficiency: Number(q.get('eff') || (fuel === 'ev' ? 3.5 : 28)), weeklyMiles: Number(q.get('miles') || 250), state, unsubscribeUrl: '#unsubscribe', isWelcome: q.get('welcome') === '1' },
    getPriceSnapshot(),
    previousWeekGas(state),
  )
  return new NextResponse(`<!-- Subject: ${mail.subject} -->` + mail.html.replace('<body', `<body data-subject="${mail.subject.replace(/"/g, '')}"`), { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
}
