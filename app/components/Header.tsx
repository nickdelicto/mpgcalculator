import Link from 'next/link'
import { Button } from "../../components/ui/button"
import MPGLogo from './MPGLogo'

export function Header() {
  return (
    <header className="bg-gradient-to-r from-gray-900 to-gray-800 text-white border-b border-gray-800">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-3">
          <MPGLogo className="text-blue-400 w-12 h-12" />
          <div className="flex flex-col">
            <span className="text-xl font-bold">MPG Calculator</span>
            <span className="text-base text-gray-400">Online fuel economy calculator</span>
          </div>
        </Link>
        <nav>
          <ul className="flex space-x-4">
            <li>
              <Button asChild variant="ghost" className="text-white hover:text-gray-300 hover:bg-gray-700">
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

