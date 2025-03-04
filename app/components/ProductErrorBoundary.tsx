import React from 'react'
import { Card } from "../../components/ui/card"
import { Info } from 'lucide-react'

interface Props {
  children: React.ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ProductErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to your error tracking service
    console.error('Product recommendations error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="mt-8 p-6 bg-gray-900/50 rounded-lg border border-gray-700">
          <div className="flex items-center gap-3 text-gray-400">
            <Info className="h-5 w-5" />
            <p className="text-sm">
              Product recommendations are temporarily unavailable. Please try again later.
            </p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
} 