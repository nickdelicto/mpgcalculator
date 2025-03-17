interface EmailParams {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: EmailParams) {
  const BREVO_API_KEY = process.env.BREVO_API_KEY
  const BREVO_FROM_NAME = process.env.BREVO_FROM_NAME || 'MPGCalculator.net'
  const BREVO_FROM_EMAIL = process.env.BREVO_FROM_EMAIL || 'news@mpgcalculator.net'

  // Validate required configuration
  if (!BREVO_API_KEY) {
    throw new Error('BREVO_API_KEY is not configured')
  }

  try {
    console.log('Attempting to send email via Brevo API...')
    console.log('To Email:', to)
    
    const endpoint = 'https://api.brevo.com/v3/smtp/email'
    
    const payload = {
      sender: {
        name: BREVO_FROM_NAME,
        email: BREVO_FROM_EMAIL
      },
      to: [{
        email: to
      }],
      subject: subject,
      htmlContent: html,
      // Add text version for email clients that don't support HTML
      textContent: 'Your fuel savings results are attached. If you cannot view the HTML version, please visit MPGCalculator.net'
    }
    
    console.log('Sending email with payload:', JSON.stringify(payload, null, 2))
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY
      },
      body: JSON.stringify(payload)
    })

    console.log('Response status:', response.status)
    
    const data = await response.json()

    if (!response.ok) {
      console.error('Brevo API error:', data)
      throw new Error(data.message || 'Failed to send email')
    }

    console.log('Email sent successfully:', data)
    return data
  } catch (error) {
    console.error('Email sending failed:', error)
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      })
    }
    throw new Error(error instanceof Error ? error.message : 'Failed to send email')
  }
} 