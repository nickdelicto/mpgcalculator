import React from 'react'
import Link from 'next/link'

export function Footer() {
  const currentYear = new Date().getFullYear()
  const version = "1.2.0" // This should be updated as the calculator evolves

  return (
    <footer className="bg-[#03543D] text-[#EDEDED] py-8 mt-12 font-heading">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-heading font-semibold mb-4">Fine Print</h3>
            <ul className="space-y-2">
              <li><Link href="/terms" className="hover:text-[#E77C00]">Terms of Use</Link></li>
              <li><Link href="/privacy" className="hover:text-[#E77C00]">Privacy Policy</Link></li>
              <li><Link href="/disclaimer" className="hover:text-[#E77C00]">Disclaimer</Link></li>
              <li><Link href="/feedback" className="hover:text-[#E77C00]">Contact Us</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-heading font-semibold mb-4">Useful Tools</h3>
            <ul className="space-y-2">
              <li><Link href="/road-trip-cost-calculator" className="hover:text-[#E77C00]">Road Trip Cost Calculator</Link></li>
              <li><Link href="/fuel-savings-calculator" className="hover:text-[#E77C00]">Fuel Savings Calculator</Link></li>
              <li><Link href="/vehicles" className="hover:text-[#E77C00]">Vehicle MPG Checker</Link></li>
              <li><Link href="/fuel-economy-compare" className="hover:text-[#E77C00]">Compare Fuel Economy</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-heading font-semibold mb-4">About</h3>
            <p>MPGCalculator.net provides useful fuel efficiency tools and content to help you make informed decisions about vehicles.</p>
            {/* <p className="mt-4">Version: {version}</p> */}
            <p>Last Updated: {new Date().toLocaleDateString()}</p>
            </div>
          </div>
        <div className="mt-8 pt-8 border-t border-[#024735] text-center">
          <p>&copy; {currentYear} MPGCalculator.net. All rights reserved.</p>
          {/* <p className="mt-2">Calculation methodology based on standard MPG formulas.</p> */}
        </div>
      </div>
    </footer>
  )
}

