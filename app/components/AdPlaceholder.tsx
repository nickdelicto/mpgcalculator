import React from 'react'

interface AdPlaceholderProps {
  className?: string
}

const AdPlaceholder: React.FC<AdPlaceholderProps> = ({ className }) => {
  return (
    <div className={`bg-gray-700 text-white p-4 text-center ${className}`}>
      Ad Placeholder
    </div>
  )
}

export default AdPlaceholder

