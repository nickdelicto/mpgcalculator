'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'

export default function MPGCalculatorSchema() {
  const [host, setHost] = useState('')

  useEffect(() => {
    setHost(window.location.origin)
  }, [])

  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "MPG Calculator",
    "url": `${host}/`,
    "applicationCategory": "CalculatorApplication",
    "browserRequirements": "Requires JavaScript. Requires HTML5.",
    "softwareVersion": "1.0",
    "operatingSystem": "All",
    "description": "This free MPG Calculator estimates your vehicle\'s fuel economy & cost of a trip based on distance and gas price. Get detailed cost analysis and fuel efficiency metrics.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
      "Simple and Advanced calculation modes",
      "Support for miles/gallons and kilometers/liters",
      "Multiple trip calculations",
      "Fuel cost analysis"
    ],
    "screenshot": `${host}/mpg-calculator-screenshot.jpg`,
    "creator": {
      "@type": "Organization",
      "name": "MPG Calculator Team"
    }
  }

  return (
    <Script id="mpg-calculator-schema" type="application/ld+json">
      {JSON.stringify(schema)}
    </Script>
  )
}

