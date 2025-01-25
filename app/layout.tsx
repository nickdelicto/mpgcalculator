import React from 'react'
import './globals.css'
import { Open_Sans, Nunito } from 'next/font/google'
import { Header } from './components/Header'
import { Footer } from './components/Footer'

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
      <body className={`${openSans.variable} ${nunito.variable} font-sans bg-gradient-to-br from-gray-700 to-gray-600 min-h-screen flex flex-col`}>
        <Header />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}







