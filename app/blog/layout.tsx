import { Metadata } from 'next'
import '../globals.css'

export const metadata: Metadata = {
  title: 'MPGCalculator.net Blog',
  description: 'Road trip guides, travel resources, and vehicle advice',
}

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="bg-gray-50 min-h-screen">
      {children}
    </div>
  )
} 