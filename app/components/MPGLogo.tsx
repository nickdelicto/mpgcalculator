import Image from 'next/image'

interface MPGLogoProps {
  className?: string
}

export default function MPGLogo({ className = "" }: MPGLogoProps) {
  return (
    <div className={`flex items-center ${className}`}>
      <Image 
        src="/Website-Logo.png" 
        alt="MPG Calculator Logo" 
        width={130} 
        height={36} 
        className="h-auto"
        priority
      />
    </div>
  )
}

