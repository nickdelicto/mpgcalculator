import { NextRequest, NextResponse } from 'next/server'
import { generateEmailTemplate } from '../../utils/email-template'
import { sendEmail } from '../../utils/email'

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

    try {
      // Generate the email HTML
      const emailHtml = generateEmailTemplate(reportData)

      // Send the email
      const emailResult = await sendEmail({
        to: email,
        subject: `Your Personalized Fuel Savings Results - Save ${Math.abs(reportData.costs.vehicle1.annual - reportData.costs.vehicle2.annual).toLocaleString('en-US', { style: 'currency', currency: 'USD' })} Annually`,
        html: emailHtml
      })

      return NextResponse.json({ 
        success: true,
        message: 'Report sent successfully',
        data: emailResult
      })
    } catch (emailError) {
      console.error('Email sending failed:', emailError)
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