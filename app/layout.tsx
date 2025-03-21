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
          {/* Google AdSense */}
          <Script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4543471446143087"
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
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
        {/* Google AdSense */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4543471446143087"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        
        {/* Google Analytics - Only included in production */}
        {isProduction && (
          <>
            {/* Internal traffic detection script - runs before GA loads */}
            <Script id="internal-traffic-detection" strategy="beforeInteractive">
              {`
                (function() {
                  // Check various conditions that might indicate localhost/internal traffic
                  var isInternal = false;
                  
                  // Check referrer for localhost or specific port patterns
                  if (document.referrer.indexOf('localhost') !== -1 || 
                      document.referrer.indexOf(':8080') !== -1) {
                    isInternal = true;
                    console.log('Internal traffic detected via referrer:', document.referrer);
                  }
                  
                  // Check URL parameters (useful if you want to manually flag traffic)
                  var urlParams = new URLSearchParams(window.location.search);
                  if (urlParams.get('internal_traffic') === 'true') {
                    isInternal = true;
                    console.log('Internal traffic detected via URL parameter');
                  }
                  
                  // If internal traffic detected, disable analytics
                  if (isInternal) {
                    // Disable GA4 - using your actual measurement ID
                    window['ga-disable-${process.env.NEXT_PUBLIC_GA_ID}'] = true;
                    console.log('Analytics disabled due to internal traffic detection');
                    
                    // Optional: Set a cookie to remember this for the session
                    document.cookie = "analytics_disabled=true; path=/; max-age=3600";
                  }
                })();
              `}
            </Script>
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







