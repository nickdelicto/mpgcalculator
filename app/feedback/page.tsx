import React from 'react'
import { Button } from '../../components/ui/button'
import Link from 'next/link'

export default function Feedback() {
  const emailSubject = encodeURIComponent("MPG Calculator Feedback")
  const emailBody = encodeURIComponent("I'd like to provide feedback on the MPG Calculator:")
  const mailtoLink = `mailto:delictodelight@gmail.com?subject=${emailSubject}&body=${emailBody}`

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-gray-800 rounded-lg shadow-md text-white">
      <h1 className="text-3xl font-bold mb-4">Send Feedback</h1>
      <p className="mb-6">We value your input! Click the button below to send us your thoughts, suggestions, or report any issues you've encountered while using the MPG Calculator.</p>
      <Button asChild className="w-full">
        <Link href={mailtoLink}>
          Open Email Client to Send Feedback
        </Link>
      </Button>
      <p className="mt-4 text-sm text-gray-400">
        Note: This will open your default email client. If it doesn't work, please send your feedback directly to the developer at delictodelight at gmail dot com
      </p>
    </div>
  )
}

