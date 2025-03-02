import React from 'react'

export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Debug log to check if this layout is being used
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 Embed Layout is being rendered')
  }

  return (
    <div className="w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white">
      {children}
    </div>
  )
} 