'use client'

import Link from 'next/link'
import { Button } from "../../components/ui/button"
import MPGLogo from './MPGLogo'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white border-b border-gray-800">
      <div className="container mx-auto px-4 py-4">
        {/* Desktop and Mobile Layout */}
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <MPGLogo />
          </Link>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 hover:bg-blue-700 rounded-lg"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:block">
            <ul className="flex space-x-4 font-sans">
              <li>
                <Button asChild variant="ghost" className="text-white hover:text-green-300 hover:bg-gray-900">
                  <Link href="/vehicles">Vehicle MPG Checker</Link>
                </Button>
              </li>
              <li>
                <Button asChild variant="ghost" className="text-white hover:text-green-300 hover:bg-gray-900">
                  <Link href="/fuel-economy-compare">Compare Vehicle MPG</Link>
                </Button>
              </li>
              <li>
                <Button asChild variant="ghost" className="text-white hover:text-green-300 hover:bg-gray-900">
                  <Link href="/fuel-savings-calculator">Fuel Savings Calculator</Link>
                </Button>
              </li>
              <li>
                <Button asChild variant="ghost" className="text-white hover:text-green-300 hover:bg-gray-900 font-nunito">
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
                <Button asChild variant="ghost" className="w-full text-white hover:text-green-300 hover:bg-gray-900 justify-start">
                  <Link href="/vehicles">Vehicle MPG Lookup</Link>
                </Button>
              </li>
              <li>
                <Button asChild variant="ghost" className="w-full text-white hover:text-green-300 hover:bg-gray-900 justify-start">
                  <Link href="/fuel-economy-compare">Vehicle MPG Comparison</Link>
                </Button>
              </li>
              <li>
                <Button asChild variant="ghost" className="w-full text-white hover:text-green-300 hover:bg-gray-900 justify-start">
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

