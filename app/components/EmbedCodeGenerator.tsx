'use client'

import React, { useState } from 'react'
import { Button } from "../../components/ui/button"
import { Card } from "../../components/ui/card"
import { Label } from "../../components/ui/label"
import { Input } from "../../components/ui/input"
import { Check, Copy, Share2, ChevronDown, ChevronUp } from 'lucide-react'

interface EmbedSize {
  width: string
  height: string
  label: string
}

const EMBED_SIZES: EmbedSize[] = [
  { width: "100%", height: "800", label: "Full Size" },
  { width: "100%", height: "600", label: "Compact" },
  { width: "500", height: "700", label: "Fixed Width" },
]

export default function EmbedCodeGenerator() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedSize, setSelectedSize] = useState<EmbedSize>(EMBED_SIZES[0])
  const [copied, setCopied] = useState(false)
  const [customWidth, setCustomWidth] = useState("")
  const [customHeight, setCustomHeight] = useState("")

  const embedUrl = process.env.NEXT_PUBLIC_SITE_URL 
    ? `${process.env.NEXT_PUBLIC_SITE_URL}/embed/fuel-savings`
    : 'https://your-site.com/embed/fuel-savings'

  const getEmbedCode = (size: EmbedSize) => {
    return `<iframe
  src="${embedUrl}"
  width="${size.width}"
  height="${size.height}"
  frameborder="0"
  scrolling="no"
  style="border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);"
  title="Fuel Savings Calculator"
></iframe>`
  }

  const handleCopy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleCustomSize = () => {
    if (customWidth && customHeight) {
      setSelectedSize({
        width: customWidth,
        height: customHeight,
        label: "Custom"
      })
    }
  }

  return (
    <div className="w-full">
      <Button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full md:w-auto bg-white text-blue-900 hover:bg-blue-50 font-semibold"
      >
        <Share2 className="h-4 w-4 mr-2" />
        Get Embed Code
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 ml-2" />
        ) : (
          <ChevronDown className="h-4 w-4 ml-2" />
        )}
      </Button>

      {isExpanded && (
        <Card className="mt-4 bg-white p-6 border border-gray-200 shadow-lg rounded-xl">
          <div className="space-y-6">
            {/* Size Selection */}
            <div className="space-y-4">
              <Label className="text-sm font-medium text-gray-700">
                Choose Display Size
              </Label>
              <div className="grid grid-cols-3 gap-3">
                {EMBED_SIZES.map((size) => (
                  <Button
                    key={size.label}
                    variant={selectedSize.label === size.label ? "default" : "outline"}
                    onClick={() => setSelectedSize(size)}
                    className={`w-full ${
                      selectedSize.label === size.label 
                        ? 'bg-blue-100 text-blue-900 border-blue-200 hover:bg-blue-200' 
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {size.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Size */}
            <div className="space-y-4">
              <Label className="text-sm font-medium text-gray-700">
                Custom Size (Optional)
              </Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="width" className="text-xs text-gray-500">
                    Width
                  </Label>
                  <Input
                    id="width"
                    placeholder="e.g., 100% or 500"
                    value={customWidth}
                    onChange={(e) => setCustomWidth(e.target.value)}
                    className="border-gray-200 focus:border-blue-300 focus:ring-blue-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height" className="text-xs text-gray-500">
                    Height
                  </Label>
                  <Input
                    id="height"
                    placeholder="e.g., 600"
                    value={customHeight}
                    onChange={(e) => setCustomHeight(e.target.value)}
                    className="border-gray-200 focus:border-blue-300 focus:ring-blue-200"
                  />
                </div>
              </div>
              <Button 
                onClick={handleCustomSize}
                variant="outline" 
                className="w-full bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
              >
                Apply Custom Size
              </Button>
            </div>

            {/* Embed Code */}
            <div className="space-y-4">
              <Label className="text-sm font-medium text-gray-700">
                Your Embed Code
              </Label>
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                <pre className="text-sm text-gray-600 whitespace-pre-wrap break-all font-mono">
                  {getEmbedCode(selectedSize)}
                </pre>
              </div>
              <Button
                onClick={() => handleCopy(getEmbedCode(selectedSize))}
                className="w-full bg-green-500 hover:bg-green-600 text-white"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copied to Clipboard!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Code
                  </>
                )}
              </Button>
            </div>

            {/* Instructions */}
            <div className="text-sm text-gray-600 space-y-2 bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900">How to Add to Your Site:</h3>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Copy the embed code above</li>
                <li>Paste it into your website's HTML where you want the calculator to appear</li>
                <li>The calculator will automatically adjust to your site's theme</li>
              </ol>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
} 