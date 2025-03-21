'use client'

import Link from 'next/link'
import { Button } from "../../components/ui/button"
import MPGLogo from './MPGLogo'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="bg-gradient-to-r from-[#057C57] to-[#046A4A] text-[#EDEDED] border-b border-[#046A4A]">
      <div className="container mx-auto px-4 py-2">
        {/* Desktop and Mobile Layout */}
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <div className="bg-[#EFF6FF] bg-opacity-100 px-3 py-1 rounded-md border border-[#EDEDED] border-opacity-30">
              <MPGLogo />
            </div>
          </Link>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 hover:bg-[#E77C00] rounded-lg text-[#EDEDED]"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:block">
            <ul className="flex space-x-4 font-sans">
              <li>
                <Button asChild variant="ghost" className="text-[#EDEDED] hover:text-[#EDEDED] hover:bg-[#E77C00]">
                  <Link href="/vehicles">Vehicle MPG Checker</Link>
                </Button>
              </li>
              <li>
                <Button asChild variant="ghost" className="text-[#EDEDED] hover:text-[#EDEDED] hover:bg-[#E77C00]">
                  <Link href="/fuel-economy-compare">Compare Vehicle MPG</Link>
                </Button>
              </li>
              <li>
                <Button asChild variant="ghost" className="text-[#EDEDED] hover:text-[#EDEDED] hover:bg-[#E77C00]">
                  <Link href="/fuel-savings-calculator">Fuel Savings Calculator</Link>
                </Button>
              </li>
              <li>
                <Button asChild variant="ghost" className="text-[#EDEDED] hover:text-[#EDEDED] hover:bg-[#E77C00] font-nunito">
                  <Link href="/feedback">Send Feedback</Link>
                </Button>
              </li>
            </ul>
          </nav>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-2">
            <ul className="flex flex-col space-y-2 font-heading">
              <li>
                <Button asChild variant="ghost" className="w-full text-[#EDEDED] hover:text-[#EDEDED] hover:bg-[#E77C00] justify-start">
                  <Link href="/vehicles">Vehicle MPG Lookup</Link>
                </Button>
              </li>
              <li>
                <Button asChild variant="ghost" className="w-full text-[#EDEDED] hover:text-[#EDEDED] hover:bg-[#E77C00] justify-start">
                  <Link href="/fuel-economy-compare">Vehicle MPG Comparison</Link>
                </Button>
              </li>
              <li>
                <Button asChild variant="ghost" className="w-full text-[#EDEDED] hover:text-[#EDEDED] hover:bg-[#E77C00] justify-start">
                  <Link href="/fuel-savings-calculator">Fuel Savings Calculator</Link>
                </Button>
              </li>
              <li>
                <Button asChild variant="ghost" className="w-full text-[#EDEDED] hover:text-[#EDEDED] hover:bg-[#E77C00] justify-start">
                  <Link href="/feedback">Send Feedback</Link>
                </Button>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </header>
  )
}

