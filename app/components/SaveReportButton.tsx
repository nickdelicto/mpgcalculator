import { useState } from 'react'
import { Mail, X } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog"
import { Input } from "../../components/ui/input"
import { Button } from "../../components/ui/button"
import { trackFacebookEvent } from '../utils/analytics'

interface SaveReportButtonProps {
  onSaveReport: (email: string) => Promise<void>
  hasNewResults: boolean
  hasEmailedResults: boolean
}

export default function SaveReportButton({ 
  onSaveReport, 
  hasNewResults, 
  hasEmailedResults 
}: SaveReportButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await onSaveReport(email)
      setSuccess(true)
      
      // Enhanced tracking with more detailed parameters
      trackFacebookEvent('Lead', {
        content_name: 'fuel_savings_report',
        content_category: 'calculator_results',
        status: 'success',
        value: 1,
        currency: 'USD',
        lead_type: 'email_report',
        lead_source: hasEmailedResults ? 'updated_results' : 'first_time',
        success: true
      })
      
      // Close modal after 2 seconds
      setTimeout(() => {
        setIsOpen(false)
        // Reset form state after modal closes
        setTimeout(() => {
          setSuccess(false)
          setEmail('')
        }, 300) // Wait for modal close animation
      }, 2000)
    } catch (err) {
      setError('Failed to send report. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Hide button if we've emailed results before and there are no new results
  // OR if we just had a successful submission
  if (hasEmailedResults && !hasNewResults || success) {
    return null
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Open email form to save fuel savings report"
        className={`fixed bottom-6 right-6 flex items-center gap-2 px-6 py-3.5 text-white font-medium rounded-full
          bg-orange-600 hover:bg-orange-600 
          shadow-[0_4px_10px_rgba(0,0,0,0.2)] hover:shadow-[0_8px_15px_rgba(0,0,0,0.3)]
          transform translate-y-0 hover:-translate-y-1 
          transition-all duration-400 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-offset-2
          ${(!isOpen || (isOpen && !success)) ? 'animate-pulse hover:animate-none' : ''}`}
      >
        <Mail className="w-5 h-5" strokeWidth={2} />
        <span>{hasEmailedResults ? 'Email Updated Results' : 'Email My Fuel Savings Results'}</span>
      </button>

      {/* Email Collection Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center mb-2 text-gray-800">
              Get Your Fuel Savings Results
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <p className="text-gray-600 text-center mb-6">
              We'll email you a detailed report of your fuel savings comparison that you can reference anytime.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white text-gray-800 placeholder-gray-400"
                  disabled={isSubmitting || success}
                />
              </div>

              {error && (
                <p className="text-red-500 text-sm mt-2">{error}</p>
              )}

              <Button
                type="submit"
                disabled={isSubmitting || success}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg
                  transition-all duration-200 shadow-md hover:shadow-lg
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Sending...' : success ? 'Sent! ✓' : 'Get Results'}
              </Button>

              <p className="text-xs text-gray-500 text-center mt-4">
                We respect your privacy and will never share your email.
                You can unsubscribe at any time.
              </p>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 