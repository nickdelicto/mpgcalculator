import React from 'react'
import './globals.css'
import { Open_Sans, Nunito } from 'next/font/google'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import Script from 'next/script'
import { headers } from 'next/headers'
import MetaPixel from './components/MetaPixel'

// Open Sans for body text
const openSans = Open_Sans({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-open-sans'
})

// Nunito for headings
const nunito = Nunito({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-nunito'
})

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Get request headers
  const headersList = await headers()
  
  // Get path information from headers
  const pathname = headersList.get('x-pathname') || ''
  const isEmbedHeader = headersList.get('x-is-embed') === 'true'
  const referer = headersList.get('referer') || ''
  
  // Only log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Pathname:', pathname)
    console.log('Is Embed Header:', isEmbedHeader)
    console.log('Referer:', referer)
  }
  
  // Check if this is an embed route
  const isEmbed = isEmbedHeader || pathname.includes('/embed') || referer.includes('/embed')
  if (process.env.NODE_ENV === 'development') {
    console.log('Is embed page?', isEmbed)
  }

  // For embed routes, return minimal layout
  if (isEmbed) {
    if (process.env.NODE_ENV === 'development') {
      console.log('Rendering embed layout')
    }
    return (
      <html lang="en">
        <head>
          <link rel="icon" href="/favicon.ico" sizes="any" />
          <MetaPixel />
        </head>
        <body className={`${openSans.variable} ${nunito.variable} font-sans bg-white`}>
          {children}
        </body>
      </html>
    )
  }

  const isProduction = process.env.NODE_ENV === 'production'
  if (process.env.NODE_ENV === 'development') {
    console.log('Rendering full layout')
  }
  
  // For regular routes, return full layout
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        {/* Google Analytics - Only included in production */}
        {isProduction && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
              `}
            </Script>
          </>
        )}
        <MetaPixel />
      </head>
      <body className={`${openSans.variable} ${nunito.variable} font-sans text-gray-900 bg-gradient-to-br from-blue-50 to-blue-100 min-h-screen flex flex-col`}>
        <Header />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}







