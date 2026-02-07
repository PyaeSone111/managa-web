import React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"

import "./globals.css"

const _inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Manga Card Designs | Serene Winter",
  description: "20 unique manga card UI designs in portrait and landscape layouts with a Serene Winter Mountain Lake light theme",
}

export const viewport: Viewport = {
  themeColor: "#516D74",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-quarzo/30 text-black-feather">{children}</body>
    </html>
  )
}
