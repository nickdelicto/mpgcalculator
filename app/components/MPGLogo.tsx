import React from 'react'

interface MPGLogoProps {
  className?: string
}

const MPGLogo: React.FC<MPGLogoProps> = ({ className = "" }) => {
  return (
    <svg
      className={className}
      width="50"
      height="50"
      viewBox="0 0 50 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="25" cy="25" r="23" stroke="currentColor" strokeWidth="2" />
      <path d="M25 10 L25 25 L35 30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M25 25 L15 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="25" cy="25" r="3" fill="currentColor" />
      <path d="M10 40 L40 40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M15 44 L35 44" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M7 25 H10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M40 25 H43" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M25 7 V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export default MPGLogo

