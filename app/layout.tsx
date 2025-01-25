import React from 'react'
import './globals.css'
import { Inter, Share_Tech_Mono } from 'next/font/google'
import { Header } from './components/Header'
import { Footer } from './components/Footer'

const inter = Inter({ subsets: ['latin'] })
const digital = Share_Tech_Mono({ 
  weight: '400',
  subsets: ['latin'],
  variable: '--font-digital',
  display: 'swap'
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className={`${inter.className} ${digital.variable} bg-gradient-to-br from-gray-700 to-gray-600 min-h-screen flex flex-col`}>
        <Header />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}







