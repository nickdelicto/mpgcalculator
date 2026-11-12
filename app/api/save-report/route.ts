import { NextRequest, NextResponse } from 'next/server'
import { generateEmailTemplate, getVehicleDisplayName } from '../../utils/email-template'
import { sendEmail } from '../../utils/email'
import { recordReportEmail, markReportEmail } from '../../lib/reportEmails'

export async function POST(request: NextRequest) {
  try {
    const { email, reportData } = await request.json()

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      )
    }

    if (!reportData) {
      return NextResponse.json(
        { error: 'Report data is required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address format' },
        { status: 400 }
      )
    }

    const annualSavings = Math.abs((reportData.costs?.vehicle1?.annual || 0) - (reportData.costs?.vehicle2?.annual || 0))

    // Keep the address in our own database before sending
    const rowId = await recordReportEmail({
      email,
      vehicle1: reportData.vehicle1 ? getVehicleDisplayName(reportData.vehicle1) : null,
      vehicle2: reportData.vehicle2 ? getVehicleDisplayName(reportData.vehicle2) : null,
      annualMileage: Number.isFinite(reportData.annualMileage) ? Math.round(reportData.annualMileage) : null,
      annualSavings: Number.isFinite(annualSavings) ? annualSavings : null,
      report: reportData,
      country: request.headers.get('cf-ipcountry'),
      referrer: request.headers.get('referer'),
    })

    try {
      // Generate the email HTML
      const emailHtml = generateEmailTemplate(reportData)

      // Send the email
      const emailResult = await sendEmail({
        to: email,
        subject: `Your Personalized Fuel Savings Results - Save ${annualSavings.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} Annually`,
        html: emailHtml
      })
      await markReportEmail(rowId, { messageId: emailResult?.messageId })

      return NextResponse.json({ 
        success: true,
        message: 'Report sent successfully',
        data: emailResult
      })
    } catch (emailError) {
      console.error('Email sending failed:', emailError)
      await markReportEmail(rowId, { error: emailError instanceof Error ? emailError.message : 'Unknown error' })
      return NextResponse.json(
        { 
          error: 'Failed to send email',
          details: emailError instanceof Error ? emailError.message : 'Unknown error'
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Request processing failed:', error)
    return NextResponse.json(
      { 
        error: 'Failed to process request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 