"use client"

import { mangaData } from "@/lib/manga-data"
import {
  Card01Classic,
  Card02Overlay,
  Card03Neon,
  Card04Minimal,
  Card05Badges,
  Card06Stats,
  Card07Glass,
  Card08Accent,
  Card09Cinematic,
  Card10Rank,
} from "./portrait-cards"
import {
  Card11Classic,
  Card12Cinematic,
  Card13Glass,
  Card14Action,
  Card15Compact,
  Card16Neon,
  Card17Dense,
  Card18Banner,
  Card19Timeline,
  Card20Trending,
} from "./landscape-cards"

function SectionTitle({ number, title, subtitle }: { number: string; title: string; subtitle: string }) {
  return (
    <div className="flex items-end gap-3 mb-6">
      <span className="text-5xl font-black text-ruskin/20 leading-none">{number}</span>
      <div>
        <h2 className="text-xl font-bold text-black-feather tracking-tight">{title}</h2>
        <p className="text-sm text-sidewalk">{subtitle}</p>
      </div>
    </div>
  )
}

export function MangaCardShowcase() {
  return (
    <div className="min-h-screen bg-quarzo/30">
      {/* Header */}
      <header className="border-b border-dockside/60 bg-white/90 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-ruskin flex items-center justify-center">
              <span className="text-sm font-black text-white">M</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-black-feather tracking-tight">Manga Card Designs</h1>
              <p className="text-[11px] text-sidewalk">20 UI variations — Serene Winter theme</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-ruskin/10 text-ruskin border border-ruskin/20">
              10 Portrait
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-delta/10 text-delta border border-delta/20">
              10 Landscape
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-10 flex flex-col gap-16">
        {/* ═══ PORTRAIT SECTION ═══════════════════════════════════════════ */}
        <section>
          <div className="mb-8">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-ruskin/10 text-ruskin border border-ruskin/20">
              Portrait Cards
            </span>
          </div>

          {/* Card 01 - Classic */}
          <SectionTitle number="01" title="Classic Portrait" subtitle="Clean card with image, title, rating stars and genre badge" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-14">
            {mangaData.slice(0, 5).map((m) => (
              <Card01Classic key={m.id} manga={m} />
            ))}
          </div>

          {/* Card 02 - Overlay */}
          <SectionTitle number="02" title="Overlay Gradient" subtitle="Full-bleed image with gradient overlay and floating info" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-14">
            {mangaData.slice(1, 6).map((m) => (
              <Card02Overlay key={m.id} manga={m} />
            ))}
          </div>

          {/* Card 03 - Neon */}
          <SectionTitle number="03" title="Neon Glow" subtitle="Glowing cyan borders with floating stats and tag chips" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-14">
            {mangaData.slice(2, 7).map((m) => (
              <Card03Neon key={m.id} manga={m} />
            ))}
          </div>

          {/* Card 04 - Minimal */}
          <SectionTitle number="04" title="Minimal Clean" subtitle="Ultra-minimal with soft backgrounds and subtle hover effects" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-14">
            {mangaData.slice(3, 8).map((m) => (
              <Card04Minimal key={m.id} manga={m} />
            ))}
          </div>

          {/* Card 05 - Badges */}
          <SectionTitle number="05" title="Badge Heavy" subtitle="Multiple status badges, HOT label, and tag collection on image" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-14">
            {mangaData.slice(4, 9).map((m) => (
              <Card05Badges key={m.id} manga={m} />
            ))}
          </div>

          {/* Card 06 - Stats */}
          <SectionTitle number="06" title="Stats Focus" subtitle="Stats grid overlay showing views, chapters, and rating" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-14">
            {mangaData.slice(5, 10).map((m) => (
              <Card06Stats key={m.id} manga={m} />
            ))}
          </div>

          {/* Card 07 - Glass */}
          <SectionTitle number="07" title="Glassmorphism" subtitle="Full-bleed image with frosted glass info panel overlay" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-14">
            {mangaData.slice(6, 11).map((m) => (
              <Card07Glass key={m.id} manga={m} />
            ))}
          </div>

          {/* Card 08 - Accent */}
          <SectionTitle number="08" title="Bordered Accent" subtitle="Left accent border with heart action and rating/status combo" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-14">
            {mangaData.slice(7, 12).map((m) => (
              <Card08Accent key={m.id} manga={m} />
            ))}
          </div>

          {/* Card 09 - Cinematic */}
          <SectionTitle number="09" title="Cinematic" subtitle="Letterbox bars with TOP RATED label and description preview" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-14">
            {mangaData.slice(8, 13).map((m) => (
              <Card09Cinematic key={m.id} manga={m} />
            ))}
          </div>

          {/* Card 10 - Rank */}
          <SectionTitle number="10" title="Rank Card" subtitle="Large outlined rank number with glowing stroke effect" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-14">
            {mangaData.slice(9, 14).map((m, i) => (
              <Card10Rank key={m.id} manga={m} rank={i + 1} />
            ))}
          </div>
        </section>

        {/* ═══ LANDSCAPE SECTION ═════════════════════════════════════════ */}
        <section>
          <div className="mb-8">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-delta/10 text-delta border border-delta/20">
              Landscape Cards
            </span>
          </div>

          {/* Card 11 - Classic Landscape */}
          <SectionTitle number="11" title="Classic Landscape" subtitle="Horizontal layout with thumbnail, info, and description" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-14">
            {mangaData.slice(0, 4).map((m) => (
              <Card11Classic key={m.id} manga={m} />
            ))}
          </div>

          {/* Card 12 - Wide Cinematic */}
          <SectionTitle number="12" title="Wide Cinematic" subtitle="Full-width hero with background image and gradient overlay" />
          <div className="grid grid-cols-1 gap-4 mb-14">
            {mangaData.slice(0, 3).map((m) => (
              <Card12Cinematic key={m.id} manga={m} />
            ))}
          </div>

          {/* Card 13 - Glass Landscape */}
          <SectionTitle number="13" title="Glass Landscape" subtitle="Frosted glass panel with tag pills and amber star rating" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-14">
            {mangaData.slice(3, 7).map((m) => (
              <Card13Glass key={m.id} manga={m} />
            ))}
          </div>

          {/* Card 14 - Action CTA */}
          <SectionTitle number="14" title="Action CTA" subtitle="Read Now and Save buttons with play icon hover overlay" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-14">
            {mangaData.slice(4, 8).map((m) => (
              <Card14Action key={m.id} manga={m} />
            ))}
          </div>

          {/* Card 15 - Compact Row */}
          <SectionTitle number="15" title="Compact Row" subtitle="Dense list-style card with rank number and minimal footprint" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-14">
            {mangaData.slice(0, 10).map((m, i) => (
              <Card15Compact key={m.id} manga={m} rank={i + 1} />
            ))}
          </div>

          {/* Card 16 - Neon Landscape */}
          <SectionTitle number="16" title="Neon Landscape" subtitle="Cyan neon accent with sparkle icon and update timestamp" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-14">
            {mangaData.slice(5, 9).map((m) => (
              <Card16Neon key={m.id} manga={m} />
            ))}
          </div>

          {/* Card 17 - Info Dense */}
          <SectionTitle number="17" title="Info Dense" subtitle="Detailed view with description, all tags, heart/bookmark actions" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-14">
            {mangaData.slice(6, 10).map((m) => (
              <Card17Dense key={m.id} manga={m} />
            ))}
          </div>

          {/* Card 18 - Featured Banner */}
          <SectionTitle number="18" title="Featured Banner" subtitle="Wide banner with inset cover art, FEATURED badge, and full stats" />
          <div className="grid grid-cols-1 gap-4 mb-14">
            {mangaData.slice(10, 13).map((m) => (
              <Card18Banner key={m.id} manga={m} />
            ))}
          </div>

          {/* Card 19 - Timeline */}
          <SectionTitle number="19" title="Timeline / Update" subtitle="Gradient accent bar with update timestamp and chapter badge" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-14">
            {mangaData.slice(12, 18).map((m) => (
              <Card19Timeline key={m.id} manga={m} />
            ))}
          </div>

          {/* Card 20 - Trending */}
          <SectionTitle number="20" title="Trending Card" subtitle="Green accent with TRENDING badge, view counts, and fire icon" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-14">
            {mangaData.slice(14, 20).map((m) => (
              <Card20Trending key={m.id} manga={m} />
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-dockside/60 py-6 bg-white/50">
        <p className="text-center text-xs text-sidewalk">20 Manga Card UI Designs — Serene Winter Mountain Lake</p>
      </footer>
    </div>
  )
}
