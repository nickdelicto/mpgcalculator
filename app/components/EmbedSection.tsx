'use client'

import { Share2, ClipboardCopy, Check, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

export default function EmbedSection() {
  const [copied, setCopied] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const embedCode = `<div style="position: relative;">
  <!-- SEO-friendly description for search engines -->
  <div class="calculator-seo-content" style="display: none" aria-hidden="true">
    <h2>Best Fuel Savings Calculator by mpgcalculator.net</h2>
    <p>Compare fuel costs and calculate potential savings between different vehicles. Make informed decisions about fuel efficiency and cost savings over time.</p>
    <meta name="description" content="Use our interactive fuel savings calculator to compare fuel costs between 2 cars and see fuel savings over time.">
    <meta name="keywords" content="fuel savings calculator, gas savings calculator, fuel efficiency comparison, ev savings calculator, electric car savings calculator, phev savings calculator, hybrid car savings calculator">
  </div>

  <!-- Structured Data -->
  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Fuel Savings Calculator",
      "applicationCategory": "CalculatorApplication",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "provider": {
        "@type": "Organization",
        "name": "MPGCalculator.net",
        "url": "https://mpgcalculator.net"
      },
      "description": "Compare fuel costs and calculate potential savings between different vehicles. Make informed decisions about fuel efficiency and fuel cost savings over time.",
      "operatingSystem": "Any",
      "browserRequirements": "Requires JavaScript"
    }
  </script>

  <iframe 
    src="https://mpgcalculator.net/embed/fuel-savings-calculator"
    style="width: 100%; height: 100vh; border: none;"
    scrolling="yes"
    title="mpgcalculator.net - Interactive Fuel Savings Calculator"
    loading="lazy"
    aria-label="Interactive comprehensive calculator to compare fuel costs and calculate fuel savings between two cars"
    importance="high"
  ></iframe>
</div>`

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-gradient-to-br from-blue-950 via-indigo-950 to-blue-900 rounded-xl border border-blue-800/30 shadow-lg">
      <div className="p-4 sm:p-6 md:p-8 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-blue-500/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-indigo-500/10 blur-3xl rounded-full translate-y-1/2 -translate-x-1/2" />
        
        {/* Content */}
        <div className="relative">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-500/20 backdrop-blur-sm border border-blue-500/20 shrink-0">
                <Share2 className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white mb-1">
                  Embed Calculator
                </h2>
                <p className="text-blue-200/80 text-sm">
                  Share this calculator on your website
                </p>
              </div>
            </div>
          </div>

          {/* Code Block */}
          <div className="relative backdrop-blur-sm">
            <pre className={`bg-gray-950/70 rounded-lg p-3 sm:p-4 text-xs sm:text-sm text-blue-100 font-mono border border-blue-800/30 shadow-inner overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-[800px]' : 'max-h-[150px]'}`}>
              <code className="whitespace-pre-wrap break-all sm:break-normal">{embedCode}</code>
              {!isExpanded && (
                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-950/90 to-transparent pointer-events-none" />
              )}
            </pre>
            
            {/* Expand/Collapse Button */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-md
                       bg-blue-600/90 hover:bg-blue-500/90 backdrop-blur
                       border border-blue-400/50 hover:border-blue-400/70
                       text-blue-50 hover:text-white shadow-lg
                       flex items-center gap-1.5 text-xs font-medium transition-all duration-200"
            >
              {isExpanded ? (
                <>Show Less <ChevronUp className="h-3 w-3" /></>
              ) : (
                <>Show More <ChevronDown className="h-3 w-3" /></>
              )}
            </button>

            {/* Copy Button */}
            <button 
              onClick={handleCopy}
              className="absolute top-2 sm:top-3 right-2 sm:right-3 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-md transition-all duration-200
                       bg-blue-600/90 hover:bg-blue-500/90 backdrop-blur
                       border border-blue-400/50 hover:border-blue-400/70
                       text-blue-50 hover:text-white shadow-lg
                       flex items-center gap-1.5 sm:gap-2 group"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 sm:h-4 w-3.5 sm:w-4 text-emerald-400" />
                  <span className="text-xs sm:text-sm font-medium whitespace-nowrap">Copied!</span>
                </>
              ) : (
                <>
                  <ClipboardCopy className="h-3.5 sm:h-4 w-3.5 sm:w-4 group-hover:scale-110 transition-transform" />
                  <span className="text-xs sm:text-sm font-medium whitespace-nowrap">Copy code</span>
                </>
              )}
            </button>
          </div>

          {/* Footer */}
          <p className="mt-4 text-xs sm:text-sm text-blue-200/70">
            Simply copy and paste this code into your HTML where you'd like the calculator to appear.
          </p>
        </div>
      </div>
    </div>
  )
}