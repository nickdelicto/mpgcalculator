import Link from 'next/link'
import { Button } from "../../components/ui/button"
import MPGLogo from './MPGLogo'

export function Header() {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white border-b border-gray-800 font-mono">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-3">
          <MPGLogo className="text-green-200 w-12 h-12" />
          <div className="flex flex-col">
            <span className="text-xl text-green-300 font-bold">MPG Calculator</span>
            <span className="text-base text-gray-200">Online fuel economy calculator</span>
          </div>
        </Link>
        <nav>
          <ul className="flex space-x-4">
            <li>
              <Button asChild variant="ghost" className="text-white hover:text-green-300 hover:bg-gray-900">
                <Link href="/mpg-lookup">
                  Vehicle MPG Lookup
                </Link>
              </Button>
            </li>
            <li>
              <Button asChild variant="ghost" className="text-white hover:text-green-300 hover:bg-gray-900">
                <Link href="/#">
                  Vehicle MPG Comparison
                </Link>
              </Button>
            </li>
            <li>
              <Button asChild variant="ghost" className="text-white hover:text-green-300 hover:bg-gray-900">
                <Link href="/feedback">
                  Send Feedback
                </Link>
              </Button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}

