import { Gauge } from 'lucide-react'

interface MPGLogoProps {
  className?: string
}

export default function MPGLogo({ className = "" }: MPGLogoProps) {
  return (
    <div className={`flex items-center ${className}`}>
      <div className="flex items-center gap-2">
        <Gauge className="h-8 w-8 sm:h-10 sm:w-10 text-blue-100" />
        <div className="flex flex-col">
          <span className="text-lg sm:text-xl font-bold text-white leading-tight">MPG Calculator</span>
          <span className="text-xs sm:text-sm text-blue-100 leading-tight">Check & compare fuel economy</span>
        </div>
      </div>
    </div>
  )
}

