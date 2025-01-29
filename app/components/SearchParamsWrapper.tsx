'use client'

import React, { ReactNode } from 'react'
import { useSearchParams } from 'next/navigation'

interface SearchParamsChildProps {
  searchParams: ReturnType<typeof useSearchParams>
}

export default function SearchParamsWrapper({ children }: { children: React.ReactElement<SearchParamsChildProps> }) {
  const searchParams = useSearchParams()
  
  return React.cloneElement(children, { searchParams })
} 