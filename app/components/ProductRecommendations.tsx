'use client'

import React, { useState, useEffect } from 'react'
import { Card } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../components/ui/tooltip"
import { Info, ChevronLeft, ChevronRight } from 'lucide-react'

interface AmazonProduct {
  asin: string
  title: string
  imageUrl: string
  affiliateUrl: string
  features: string[]
  prime: boolean
}

interface ProductRecommendationsProps {
  usesElectricity: boolean
}

export default function ProductRecommendations({ usesElectricity }: ProductRecommendationsProps) {
  const [products, setProducts] = useState<AmazonProduct[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [windowWidth, setWindowWidth] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  // Get visible count based on window width
  const getVisibleCount = (width: number) => {
    if (width === 0) return 3 // Default for SSR
    if (width < 640) return 1  // Mobile
    if (width < 1024) return 2 // Tablet
    return 3 // Desktop
  }

  const [visibleCount, setVisibleCount] = useState(3) // Default for SSR

  // Handle window width changes
  useEffect(() => {
    // Set initial width
    setWindowWidth(window.innerWidth)
    setVisibleCount(getVisibleCount(window.innerWidth))

    // Debounced resize handler
    let timeoutId: NodeJS.Timeout
    const handleResize = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        const width = window.innerWidth
        setWindowWidth(width)
        const newVisibleCount = getVisibleCount(width)
        setVisibleCount(newVisibleCount)
        
        // Adjust currentIndex if needed
        if (currentIndex > products.length - newVisibleCount) {
          setCurrentIndex(Math.max(0, products.length - newVisibleCount))
        }
      }, 250)
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(timeoutId)
    }
  }, [currentIndex, products.length])

  // Mouse and touch event handlers for dragging
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true)
    setStartX(e.pageX - e.currentTarget.offsetLeft)
    setScrollLeft(e.currentTarget.scrollLeft)
  }

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setIsDragging(true)
    setStartX(e.touches[0].pageX - e.currentTarget.offsetLeft)
    setScrollLeft(e.currentTarget.scrollLeft)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return
    e.preventDefault()
    const x = e.pageX - e.currentTarget.offsetLeft
    const walk = (x - startX) * 2
    const containerWidth = e.currentTarget.offsetWidth
    const maxScroll = (products.length - visibleCount) * (containerWidth / visibleCount)
    const newScrollLeft = Math.max(0, Math.min(scrollLeft - walk, maxScroll))
    const newIndex = Math.round(newScrollLeft / (containerWidth / visibleCount))
    setCurrentIndex(newIndex)
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging) return
    const x = e.touches[0].pageX - e.currentTarget.offsetLeft
    const walk = (x - startX) * 2
    const containerWidth = e.currentTarget.offsetWidth
    const maxScroll = (products.length - visibleCount) * (containerWidth / visibleCount)
    const newScrollLeft = Math.max(0, Math.min(scrollLeft - walk, maxScroll))
    const newIndex = Math.round(newScrollLeft / (containerWidth / visibleCount))
    setCurrentIndex(newIndex)
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/amazon/products')
        if (!response.ok) throw new Error('Failed to fetch products')
        const data = await response.json()
        setProducts(data)
      } catch (err) {
        setError('Unable to load product recommendations')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [usesElectricity])

  // Navigation handlers
  const nextSlide = () => {
    setCurrentIndex(prev => Math.min(prev + 1, products.length - visibleCount))
  }

  const prevSlide = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1))
  }

  // Truncate title based on current window width
  const truncateTitle = (title: string) => {
    const maxLength = windowWidth < 640 ? 75 : 
                     windowWidth < 1024 ? 75 : 75
    if (title.length <= maxLength) return title
    return title.substring(0, maxLength).trim() + '...'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <div className="h-6 w-48 bg-gray-800 rounded animate-pulse"></div>
          <div className="h-4 w-4 bg-gray-800 rounded-full animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="overflow-hidden bg-gray-900/50 border border-gray-800">
              <div className="aspect-square bg-gray-800/50 animate-pulse"></div>
              <div className="p-4 space-y-4">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-800 rounded w-3/4 animate-pulse"></div>
                  <div className="h-4 bg-gray-800 rounded w-1/2 animate-pulse"></div>
                </div>
                <div className="h-10 bg-gray-800 rounded animate-pulse"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return null
  }

  return (
    <div className="relative space-y-4">
      <h3 className="text-lg font-semibold text-gray-300 flex items-center gap-2">
        Featured Items
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4 text-gray-400" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-sm">These items might be useful to you.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </h3>

      <div className="relative group touch-pan-y">
        {products.length > visibleCount && (
          <>
            <button
              onClick={prevSlide}
              disabled={currentIndex === 0}
              className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 
                       bg-white/90 p-2 rounded-full shadow-lg 
                       transition-all duration-200
                       ${currentIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white cursor-pointer'}
                       sm:opacity-0 sm:group-hover:opacity-100 sm:-translate-x-2 sm:group-hover:translate-x-0
                       -left-2 sm:-left-4`}
              aria-label="Previous products"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={nextSlide}
              disabled={currentIndex >= products.length - visibleCount}
              className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 
                       bg-white/90 p-2 rounded-full shadow-lg 
                       transition-all duration-200
                       ${currentIndex >= products.length - visibleCount ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white cursor-pointer'}
                       sm:opacity-0 sm:group-hover:opacity-100 sm:translate-x-2 sm:group-hover:translate-x-0
                       -right-2 sm:-right-4`}
              aria-label="Next products"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        <div 
          className="overflow-hidden px-2 sm:px-0 cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleDragEnd}
        >
          <div 
            className={`flex transition-transform duration-500 ${isDragging ? 'ease-out' : 'ease-in-out'}`}
            style={{ transform: `translateX(-${currentIndex * (100 / visibleCount)}%)` }}
          >
            {products.map((product, index) => (
              <div 
                key={product.asin}
                className="w-full min-w-[100%] sm:min-w-[50%] lg:min-w-[33.333%] p-2 
                          transition-opacity duration-300"
                style={{ 
                  opacity: Math.abs(index - currentIndex) >= visibleCount ? 0 : 1,
                  flex: `0 0 ${100 / visibleCount}%`
                }}
              >
                <Card className="h-full overflow-hidden hover:shadow-lg transition-all duration-300 
                               transform hover:scale-[1.02] hover:-translate-y-1
                               bg-white/95 border border-gray-200">
                  <div className="aspect-square overflow-hidden bg-white p-4">
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="w-full h-full object-contain transition-transform duration-300
                                hover:scale-110"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-4 space-y-4">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <h4 className="font-medium text-gray-900 line-clamp-2 min-h-[3rem]
                                       transition-colors duration-200 hover:text-blue-600
                                       text-sm sm:text-base cursor-pointer text-left">
                            {truncateTitle(product.title)}
                          </h4>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="max-w-xs">
                          <p className="text-sm">{product.title}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <Button 
                      asChild
                      className="w-full bg-orange-600 hover:bg-orange-700 
                               transition-all duration-300 transform hover:scale-[1.02]
                               text-sm sm:text-base py-2 sm:py-3"
                    >
                      <a 
                        href={product.affiliateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                          console.log('Product clicked:', product.asin)
                        }}
                      >
                        Shop on Amazon
                      </a>
                    </Button>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination Indicators */}
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: Math.ceil(products.length / visibleCount) }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i * visibleCount)}
              className={`w-2 h-2 rounded-full transition-all duration-200 
                ${i === Math.floor(currentIndex / visibleCount) 
                  ? 'bg-blue-500 w-4' 
                  : 'bg-gray-400 hover:bg-gray-500'}`}
              aria-label={`Go to page ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Amazon Associates Disclosure */}
      <p className="mt-4 text-xs italic text-gray-400 text-center">
        As an Amazon Associate, we may earn commissions from qualifying purchases on this page at no additional cost to you.
      </p>
    </div>
  )
} 