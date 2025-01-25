'use client'

import Link from 'next/link'
import { Button } from "../../components/ui/button"
import MPGLogo from './MPGLogo'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white border-b border-gray-800 font-mono">
      <div className="container mx-auto px-4 py-4">
        {/* Desktop and Mobile Layout */}
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-3">
            <MPGLogo className="text-green-200 w-10 h-10 sm:w-12 sm:h-12" />
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl text-green-300 font-bold">MPG Calculator</span>
              <span className="text-sm sm:text-base text-gray-200">Online fuel economy calculator</span>
            </div>
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
            <ul className="flex space-x-4">
              <li>
                <Button asChild variant="ghost" className="text-white hover:text-green-300 hover:bg-gray-900">
                  <Link href="/mpg-lookup">Vehicle MPG Lookup</Link>
                </Button>
              </li>
              <li>
                <Button asChild variant="ghost" className="text-white hover:text-green-300 hover:bg-gray-900">
                  <Link href="/#">Vehicle MPG Comparison</Link>
                </Button>
              </li>
              <li>
                <Button asChild variant="ghost" className="text-white hover:text-green-300 hover:bg-gray-900">
                  <Link href="/feedback">Send Feedback</Link>
                </Button>
              </li>
            </ul>
          </nav>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-2">
            <ul className="flex flex-col space-y-2">
              <li>
                <Button asChild variant="ghost" className="w-full text-white hover:text-green-300 hover:bg-gray-900 justify-start">
                  <Link href="/mpg-lookup">Vehicle MPG Lookup</Link>
                </Button>
              </li>
              <li>
                <Button asChild variant="ghost" className="w-full text-white hover:text-green-300 hover:bg-gray-900 justify-start">
                  <Link href="/#">Vehicle MPG Comparison</Link>
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

