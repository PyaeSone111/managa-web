import React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"

import "./globals.css"

const _inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Manga Card Designs | Cosmic Night",
  description: "20 unique manga card UI designs in portrait and landscape layouts with a Cosmic Night dark theme",
}

export const viewport: Viewport = {
  themeColor: "#060a14",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-[#060a14] text-slate-100">{children}</body>
    </html>
  )
}
