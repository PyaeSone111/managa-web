"use client"

import { Star, BookOpen, Eye, Clock, Heart, Bookmark, TrendingUp, Flame, ChevronRight, Play, Sparkles } from "lucide-react"
import type { MangaSeries } from "@/lib/manga-data"

/* Serene Winter Mountain Lake palette: quarzo #C9D0D9, dockside #9EB3BC, sidewalk #799099, ruskin #516D74, delta #2E4B4E, black-feather #0D211F */

function StarRating({ rating, size = 12 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={
            star <= Math.floor(rating)
              ? "fill-ruskin text-ruskin"
              : star <= rating
                ? "fill-ruskin/50 text-ruskin"
                : "fill-transparent text-dockside"
          }
        />
      ))}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors = {
    Ongoing: "bg-ruskin/10 text-ruskin border-ruskin/30",
    Completed: "bg-delta/10 text-delta border-delta/30",
    Hiatus: "bg-sidewalk/15 text-sidewalk border-sidewalk/30",
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${colors[status as keyof typeof colors] || colors.Ongoing}`}>
      {status}
    </span>
  )
}

// ─── Card 11: Classic Landscape ──────────────────────────────────────────
export function Card11Classic({ manga }: { manga: MangaSeries }) {
  return (
    <div className="group cursor-pointer flex rounded-xl border border-dockside bg-white overflow-hidden transition-all duration-300 hover:border-ruskin/50 hover:cosmic-glow h-full min-h-[140px] shadow-sm">
      <div className="relative flex-shrink-0 w-24 sm:w-28 overflow-hidden bg-quarzo/40">
        <img
          src={manga.coverUrl || "/placeholder.svg"}
          alt={manga.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-between p-3 bg-white">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-sm text-black-feather line-clamp-2 leading-tight group-hover:text-ruskin transition-colors">
              {manga.title}
            </h3>
            <StatusBadge status={manga.status} />
          </div>
          <p className="text-xs text-sidewalk mt-1">{manga.author}</p>
          <p className="text-[11px] text-sidewalk line-clamp-2 mt-1">{manga.description}</p>
        </div>
        <div className="flex items-center gap-3 mt-2">
          <div className="flex items-center gap-1">
            <Star size={10} className="fill-ruskin text-ruskin" />
            <span className="text-[11px] text-ruskin font-semibold">{manga.rating.toFixed(1)}</span>
          </div>
          <span className="text-[10px] text-sidewalk">{manga.chapters} Ch.</span>
          <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-medium bg-ruskin/10 text-ruskin border border-ruskin/20">
            {manga.genre}
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Card 12: Wide Cinematic ─────────────────────────────────────────────
export function Card12Cinematic({ manga }: { manga: MangaSeries }) {
  return (
    <div className="group cursor-pointer rounded-xl overflow-hidden relative min-h-[160px] transition-all duration-300 hover:cosmic-glow-strong shadow-sm">
      <img
        src={manga.coverUrl || "/placeholder.svg"}
        alt={manga.title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 brightness-75 group-hover:brightness-90"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent" />
      <div className="relative z-10 flex items-center h-full min-h-[160px] p-5">
        <div className="flex flex-col gap-2 max-w-[65%]">
          <div className="flex items-center gap-2">
            <StatusBadge status={manga.status} />
            <span className="text-[10px] text-quarzo font-medium">{manga.genre}</span>
          </div>
          <h3 className="font-bold text-lg text-white line-clamp-1 leading-tight tracking-wide">
            {manga.title}
          </h3>
          <p className="text-[11px] text-quarzo">{manga.author}</p>
          <p className="text-[11px] text-white/90 line-clamp-2">{manga.description}</p>
          <div className="flex items-center gap-4 mt-1">
            <div className="flex items-center gap-1">
              <Star size={12} className="fill-quarzo text-quarzo" />
              <span className="text-xs text-quarzo font-bold">{manga.rating.toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-1 text-white/80">
              <Eye size={12} />
              <span className="text-[11px]">{manga.views}</span>
            </div>
            <div className="flex items-center gap-1 text-white/80">
              <BookOpen size={12} />
              <span className="text-[11px]">{manga.chapters}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Card 13: Glass Landscape ────────────────────────────────────────────
export function Card13Glass({ manga }: { manga: MangaSeries }) {
  return (
    <div className="group cursor-pointer flex rounded-2xl overflow-hidden glass border border-dockside/60 transition-all duration-300 hover:border-ruskin/40 hover:cosmic-glow h-full min-h-[140px] shadow-sm">
      <div className="relative flex-shrink-0 w-28 overflow-hidden">
        <img
          src={manga.coverUrl || "/placeholder.svg"}
          alt={manga.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-quarzo/30" />
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-between p-3 gap-1 bg-white/90">
        <div>
          <h3 className="font-bold text-sm text-black-feather line-clamp-1 leading-tight group-hover:text-ruskin transition-colors">
            {manga.title}
          </h3>
          <p className="text-[11px] text-sidewalk mt-0.5">{manga.author}</p>
        </div>
        <div className="flex flex-wrap gap-1">
          {manga.tags.map((tag) => (
            <span key={tag} className="px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-ruskin/10 text-ruskin border border-ruskin/20">
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Star size={10} className="fill-ruskin text-ruskin" />
            <span className="text-[11px] font-semibold text-black-feather">{manga.rating.toFixed(1)}</span>
            <span className="text-[10px] text-sidewalk">({manga.ratingCount.toLocaleString()})</span>
          </div>
          <span className="text-[10px] text-sidewalk">{manga.latestChapter}</span>
        </div>
      </div>
    </div>
  )
}

// ─── Card 14: Action CTA ────────────────────────────────────────────────
export function Card14Action({ manga }: { manga: MangaSeries }) {
  return (
    <div className="group cursor-pointer flex rounded-xl border border-dockside bg-white overflow-hidden transition-all duration-300 hover:border-ruskin/50 h-full min-h-[140px] shadow-sm">
      <div className="relative flex-shrink-0 w-24 sm:w-28 overflow-hidden">
        <img
          src={manga.coverUrl || "/placeholder.svg"}
          alt={manga.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors">
          <Play size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
        </div>
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-between p-3 bg-white">
        <div>
          <h3 className="font-bold text-sm text-black-feather line-clamp-1 leading-tight group-hover:text-ruskin transition-colors">
            {manga.title}
          </h3>
          <p className="text-[11px] text-sidewalk mt-0.5">{manga.author}</p>
          <p className="text-[10px] text-sidewalk line-clamp-1 mt-1">{manga.description}</p>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-ruskin text-white text-[11px] font-bold hover:bg-delta transition-colors">
            Read Now
            <ChevronRight size={12} />
          </span>
          <span className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-quarzo/60 text-black-feather text-[11px] font-medium border border-dockside">
            <Bookmark size={11} />
            Save
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Card 15: Compact Row ───────────────────────────────────────────────
export function Card15Compact({ manga, rank }: { manga: MangaSeries; rank: number }) {
  return (
    <div className="group cursor-pointer flex items-center gap-3 rounded-lg border border-dockside bg-quarzo/30 p-2.5 transition-all duration-300 hover:border-ruskin/40 hover:bg-quarzo/50 shadow-sm">
      <span className="text-lg font-black text-sidewalk group-hover:text-ruskin transition-colors w-6 text-center flex-shrink-0">
        {rank}
      </span>
      <div className="relative flex-shrink-0 w-12 h-16 rounded-md overflow-hidden bg-quarzo/50">
        <img
          src={manga.coverUrl || "/placeholder.svg"}
          alt={manga.title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-sm text-black-feather line-clamp-1 group-hover:text-ruskin transition-colors">
          {manga.title}
        </h3>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[11px] text-sidewalk">{manga.author}</span>
          <span className="text-dockside">|</span>
          <span className="text-[11px] text-sidewalk">{manga.genre}</span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <div className="flex items-center gap-1">
          <Star size={10} className="fill-ruskin text-ruskin" />
          <span className="text-[11px] text-ruskin font-semibold">{manga.rating.toFixed(1)}</span>
        </div>
        <StatusBadge status={manga.status} />
      </div>
    </div>
  )
}

// ─── Card 16: Neon Landscape (soft accent) ────────────────────────────────────────────
export function Card16Neon({ manga }: { manga: MangaSeries }) {
  return (
    <div className="group cursor-pointer flex rounded-xl overflow-hidden border-2 border-ruskin/20 bg-white transition-all duration-300 hover:border-ruskin/40 hover:cosmic-glow-strong h-full min-h-[140px] shadow-sm">
      <div className="relative flex-shrink-0 w-28 overflow-hidden">
        <img
          src={manga.coverUrl || "/placeholder.svg"}
          alt={manga.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent" />
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-between p-3 border-l border-dockside/60 bg-white">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={10} className="text-ruskin" />
            <span className="text-[10px] text-ruskin font-semibold uppercase tracking-wider">{manga.genre}</span>
          </div>
          <h3 className="font-bold text-sm text-black-feather line-clamp-1 leading-tight group-hover:text-ruskin transition-colors">
            {manga.title}
          </h3>
          <p className="text-[11px] text-sidewalk mt-0.5">{manga.author}</p>
        </div>
        <div className="flex items-center justify-between mt-2">
          <StarRating rating={manga.rating} size={10} />
          <div className="flex items-center gap-1">
            <Clock size={10} className="text-sidewalk" />
            <span className="text-[10px] text-sidewalk">{manga.updatedAt}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Card 17: Info Dense ────────────────────────────────────────────────
export function Card17Dense({ manga }: { manga: MangaSeries }) {
  return (
    <div className="group cursor-pointer flex rounded-xl border border-dockside bg-white overflow-hidden transition-all duration-300 hover:border-ruskin/40 h-full min-h-[160px] shadow-sm">
      <div className="relative flex-shrink-0 w-28 overflow-hidden bg-quarzo/40">
        <img
          src={manga.coverUrl || "/placeholder.svg"}
          alt={manga.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex-1 min-w-0 flex flex-col p-3 gap-2 bg-white">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-sm text-black-feather line-clamp-1 leading-tight group-hover:text-ruskin transition-colors">
            {manga.title}
          </h3>
          <div className="flex gap-1 flex-shrink-0">
            <Heart size={14} className="text-dockside hover:text-ruskin transition-colors" />
            <Bookmark size={14} className="text-dockside hover:text-ruskin transition-colors" />
          </div>
        </div>
        <p className="text-[11px] text-sidewalk">{manga.author}{manga.artist && ` / ${manga.artist}`}</p>
        <p className="text-[10px] text-sidewalk line-clamp-2">{manga.description}</p>
        <div className="flex flex-wrap gap-1 mt-auto">
          {manga.tags.map((tag) => (
            <span key={tag} className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-ruskin/10 text-ruskin border border-ruskin/20">
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between pt-1 border-t border-quarzo">
          <div className="flex items-center gap-1">
            <Star size={10} className="fill-ruskin text-ruskin" />
            <span className="text-[11px] text-ruskin font-semibold">{manga.rating.toFixed(1)}</span>
            <span className="text-[10px] text-sidewalk">({manga.ratingCount.toLocaleString()})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-sidewalk">{manga.chapters} Ch.</span>
            <StatusBadge status={manga.status} />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Card 18: Featured Banner ───────────────────────────────────────────
export function Card18Banner({ manga }: { manga: MangaSeries }) {
  return (
    <div className="group cursor-pointer rounded-xl overflow-hidden relative min-h-[180px] transition-all duration-300 hover:cosmic-glow shadow-sm">
      <img
        src={manga.coverUrl || "/placeholder.svg"}
        alt={manga.title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 brightness-60 group-hover:brightness-70"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-delta/95 via-delta/80 to-delta/40" />
      <div className="relative z-10 flex h-full min-h-[180px] p-5 gap-4">
        <div className="relative flex-shrink-0 w-24 h-32 rounded-lg overflow-hidden shadow-2xl border-2 border-quarzo/80 self-center">
          <img
            src={manga.coverUrl || "/placeholder.svg"}
            alt={manga.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex flex-col justify-center gap-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-ruskin text-white">FEATURED</span>
            <StatusBadge status={manga.status} />
          </div>
          <h3 className="font-bold text-xl text-white line-clamp-1 leading-tight tracking-tight">
            {manga.title}
          </h3>
          <p className="text-xs text-quarzo">{manga.author}</p>
          <p className="text-[11px] text-white/90 line-clamp-2">{manga.description}</p>
          <div className="flex items-center gap-4 mt-1">
            <StarRating rating={manga.rating} />
            <span className="text-xs text-quarzo font-semibold">{manga.rating.toFixed(1)}</span>
            <div className="flex items-center gap-1 text-white/80">
              <Eye size={12} />
              <span className="text-[11px]">{manga.views}</span>
            </div>
            <span className="text-[11px] text-white/80">{manga.chapters} chapters</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Card 19: Timeline / Update Card ────────────────────────────────────
export function Card19Timeline({ manga }: { manga: MangaSeries }) {
  return (
    <div className="group cursor-pointer flex rounded-xl border border-dockside bg-white overflow-hidden transition-all duration-300 hover:border-ruskin/40 h-full min-h-[120px] shadow-sm">
      <div className="flex-shrink-0 w-1.5 bg-gradient-to-b from-ruskin to-delta group-hover:from-ruskin group-hover:to-delta transition-colors" />
      <div className="relative flex-shrink-0 w-20 overflow-hidden bg-quarzo/40">
        <img
          src={manga.coverUrl || "/placeholder.svg"}
          alt={manga.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-between p-3 bg-white">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Clock size={10} className="text-ruskin" />
            <span className="text-[10px] text-ruskin font-medium">{manga.updatedAt}</span>
          </div>
          <h3 className="font-semibold text-sm text-black-feather line-clamp-1 group-hover:text-ruskin transition-colors">
            {manga.title}
          </h3>
          <p className="text-[11px] text-sidewalk mt-0.5">{manga.author}</p>
        </div>
        <div className="flex items-center justify-between mt-1.5">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-ruskin/10 border border-ruskin/20">
            <BookOpen size={10} className="text-ruskin" />
            <span className="text-[10px] text-ruskin font-medium">{manga.latestChapter}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star size={10} className="fill-ruskin text-ruskin" />
            <span className="text-[11px] text-ruskin font-semibold">{manga.rating.toFixed(1)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Card 20: Trending Card ─────────────────────────────────────────────
export function Card20Trending({ manga }: { manga: MangaSeries }) {
  return (
    <div className="group cursor-pointer flex rounded-xl border border-dockside bg-white overflow-hidden transition-all duration-300 hover:border-ruskin/50 hover:cosmic-glow h-full min-h-[140px] shadow-sm">
      <div className="relative flex-shrink-0 w-28 overflow-hidden bg-quarzo/40">
        <img
          src={manga.coverUrl || "/placeholder.svg"}
          alt={manga.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-2 left-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-delta/15 text-delta border border-delta/30 backdrop-blur-sm">
            <TrendingUp size={9} />
            TRENDING
          </span>
        </div>
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-between p-3 bg-white">
        <div>
          <h3 className="font-bold text-sm text-black-feather line-clamp-1 leading-tight group-hover:text-ruskin transition-colors">
            {manga.title}
          </h3>
          <p className="text-[11px] text-sidewalk mt-0.5">{manga.author}</p>
          <p className="text-[10px] text-sidewalk line-clamp-2 mt-1">{manga.description}</p>
        </div>
        <div className="flex items-center gap-3 mt-2">
          <div className="flex items-center gap-1">
            <Star size={10} className="fill-ruskin text-ruskin" />
            <span className="text-[11px] text-ruskin font-semibold">{manga.rating.toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-1 text-sidewalk">
            <Eye size={10} />
            <span className="text-[10px]">{manga.views}</span>
          </div>
          <div className="flex items-center gap-1 text-sidewalk">
            <Flame size={10} className="text-ruskin" />
            <span className="text-[10px]">{manga.chapters} Ch.</span>
          </div>
          <StatusBadge status={manga.status} />
        </div>
      </div>
    </div>
  )
}
