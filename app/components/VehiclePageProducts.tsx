import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Star, ShoppingCart } from 'lucide-react'
import { Button } from "../../components/ui/button"

export interface AmazonProduct {
  asin: string
  title: string
  imageUrl: string
  affiliateUrl: string
  features: string[]
  prime: boolean
  rating?: {
    value: number
    displayValue: string
  }
  reviewCount?: number
}

interface VehiclePageProductsProps {
  title: string
  subtitle?: string
  products: AmazonProduct[]
}

export default function VehiclePageProducts({ title, subtitle, products }: VehiclePageProductsProps) {
  return (
    <div className="mb-12">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
        {subtitle && <p className="text-blue-300 mt-2 text-base">{subtitle}</p>}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Card 
            key={product.asin} 
            className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-gray-700 
                     hover:border-blue-400 hover:shadow-xl hover:shadow-blue-900/20 
                     transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="aspect-square p-6 bg-white rounded-t-lg flex items-center justify-center">
              <img
                src={product.imageUrl}
                alt={product.title}
                className="max-h-full w-auto object-contain hover:scale-110 transition-transform duration-300"
              />
            </div>
            <CardContent className="p-5 space-y-4">
              <h4 className="font-semibold text-white line-clamp-2 min-h-[2.5rem] text-sm">
                {product.title}
              </h4>
              
              {/* Ratings */}
              {product.rating && (
                <div className="flex items-center gap-2">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating?.value || 0) 
                            ? 'fill-current' 
                            : 'fill-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                  {product.reviewCount && (
                    <span className="text-blue-300 text-sm font-medium">
                      ({product.reviewCount.toLocaleString()})
                    </span>
                  )}
                </div>
              )}

              <Button 
                asChild
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 
                         hover:to-orange-700 text-white font-medium shadow-lg shadow-orange-900/20 
                         hover:shadow-orange-900/40 transition-all duration-300"
              >
                <a 
                  href={product.affiliateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  View on Amazon
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Amazon Disclosure */}
      <p className="text-gray-400 text-xs mt-6 text-center">
        <em>*As an Amazon Associate, we earn from qualifying purchases.</em>
      </p>
    </div>
  )
} 