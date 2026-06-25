import { Star, BookOpen, Eye, Clock, Heart, Bookmark, TrendingUp, Flame, ChevronRight, Play, Sparkles } from 'lucide-react';

/* Navy, Almond, Red-orange, Mango palette */

function StarRating({ rating, size = 12 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={
            star <= Math.floor(rating)
              ? 'fill-delta-green text-delta-green'
              : star <= rating
                ? 'fill-delta-green/50 text-delta-green'
                : 'fill-transparent text-dockside-blue'
          }
        />
      ))}
    </div>
  );
}

function StatusBadge({ status }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#1e3d59] text-white border border-[#1e3d59]">
      {status}
    </span>
  );
}

export function Card11Classic({ manga }) {
  return (
    <div className="group cursor-pointer flex rounded-xl border border-dockside-blue bg-white overflow-hidden transition-all duration-300 hover:border-delta-green/50 hover:cosmic-glow h-full min-h-[140px] shadow-sm">
      <div className="relative flex-shrink-0 w-24 sm:w-28 overflow-hidden bg-quarzo/40">
        <img src={manga.coverUrl || '/placeholder.svg'} alt={manga.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-between p-3 bg-white">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-sm text-black-feather line-clamp-2 leading-tight group-hover:text-delta-green transition-colors">{manga.title}</h3>
            <StatusBadge status={manga.status} />
          </div>
          <p className="text-xs text-sidewalk-grey mt-1">{manga.author}</p>
          <p className="text-[11px] text-sidewalk-grey line-clamp-2 mt-1">{manga.description}</p>
        </div>
        <div className="flex items-center gap-3 mt-2">
          <div className="flex items-center gap-1">
            <Star size={10} className="fill-delta-green text-delta-green" />
            <span className="text-[11px] text-delta-green font-semibold">{manga.rating.toFixed(1)}</span>
          </div>
          <span className="text-[10px] text-sidewalk-grey">{manga.chapters} Ch.</span>
          <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-medium bg-delta-green/10 text-delta-green border border-delta-green/20">{manga.genre}</span>
        </div>
      </div>
    </div>
  );
}

export function Card12Cinematic({ manga }) {
  const imgUrl = manga.coverImageUrl || manga.coverUrl || '/placeholder.svg';
  return (
    <div className="group cursor-pointer rounded-xl overflow-hidden relative min-h-[160px] transition-all duration-300 hover:cosmic-glow-strong shadow-sm">
      <img src={imgUrl} alt={manga.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 brightness-75 group-hover:brightness-90" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent" />
      <div className="relative z-10 flex items-center h-full min-h-[160px] p-5">
        <div className="flex flex-col gap-2 max-w-[65%]">
          <div className="flex items-center gap-2">
            <StatusBadge status={manga.status} />
            <span className="text-[10px] text-quarzo font-medium">{manga.genre}</span>
          </div>
          <h3 className="font-bold text-lg text-white line-clamp-1 leading-tight tracking-wide">{manga.title}</h3>
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
  );
}

export function Card13Glass({ manga }) {
  return (
    <div className="group cursor-pointer flex rounded-2xl overflow-hidden glass border border-dockside-blue/60 transition-all duration-300 hover:border-delta-green/40 hover:cosmic-glow h-full min-h-[140px] shadow-sm">
      <div className="relative flex-shrink-0 w-28 overflow-hidden">
        <img src={manga.coverUrl || '/placeholder.svg'} alt={manga.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-quarzo/30" />
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-between p-3 gap-1 bg-white/90">
        <div>
          <h3 className="font-bold text-sm text-black-feather line-clamp-1 leading-tight group-hover:text-delta-green transition-colors">{manga.title}</h3>
          <p className="text-[11px] text-sidewalk-grey mt-0.5">{manga.author}</p>
        </div>
        <div className="flex flex-wrap gap-1">
          {(manga.tags || []).map((tag) => (
            <span key={tag} className="px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-delta-green/10 text-delta-green border border-delta-green/20">{tag}</span>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Star size={10} className="fill-delta-green text-delta-green" />
            <span className="text-[11px] font-semibold text-black-feather">{manga.rating.toFixed(1)}</span>
            <span className="text-[10px] text-sidewalk-grey">({(manga.ratingCount || 0).toLocaleString()})</span>
          </div>
          <span className="text-[10px] text-sidewalk-grey">{manga.latestChapter}</span>
        </div>
      </div>
    </div>
  );
}

export function Card14Action({ manga }) {
  return (
    <div className="group cursor-pointer flex rounded-xl border border-dockside-blue bg-white overflow-hidden transition-all duration-300 hover:border-delta-green/50 h-full min-h-[140px] shadow-sm">
      <div className="relative flex-shrink-0 w-24 sm:w-28 overflow-hidden">
        <img src={manga.coverUrl || '/placeholder.svg'} alt={manga.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors">
          <Play size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
        </div>
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-between p-3 bg-white">
        <div>
          <h3 className="font-bold text-sm text-black-feather line-clamp-1 leading-tight group-hover:text-delta-green transition-colors">{manga.title}</h3>
          <p className="text-[11px] text-sidewalk-grey mt-0.5">{manga.author}</p>
          <p className="text-[10px] text-sidewalk-grey line-clamp-1 mt-1">{manga.description}</p>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-delta-green text-white text-[11px] font-bold hover:bg-delta-green transition-colors">Read Now <ChevronRight size={12} /></span>
          <span className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-quarzo/60 text-black-feather text-[11px] font-medium border border-dockside-blue"><Bookmark size={11} /> Save</span>
        </div>
      </div>
    </div>
  );
}

export function Card15Compact({ manga, rank }) {
  return (
    <div className="group cursor-pointer flex items-center gap-3 rounded-lg border border-dockside-blue bg-quarzo/30 p-2.5 transition-all duration-300 hover:border-delta-green/40 hover:bg-quarzo/50 shadow-sm">
      <span className="inline-flex items-center justify-center min-w-[1.75rem] text-sm font-black flex-shrink-0" style={{ color: '#1e3d59', WebkitTextStroke: '1.5px white', paintOrder: 'stroke fill' }}>{rank ?? 0}</span>
      <div className="relative flex-shrink-0 w-12 h-16 rounded-md overflow-hidden bg-quarzo/50">
        <img src={manga.coverUrl || '/placeholder.svg'} alt={manga.title} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-sm text-black-feather line-clamp-1 group-hover:text-delta-green transition-colors">{manga.title}</h3>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[11px] text-sidewalk-grey">{manga.author}</span>
          <span className="text-dockside-blue">|</span>
          <span className="text-[11px] text-sidewalk-grey">{manga.genre}</span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <div className="flex items-center gap-1">
          <Star size={10} className="fill-delta-green text-delta-green" />
          <span className="text-[11px] text-delta-green font-semibold">{manga.rating.toFixed(1)}</span>
        </div>
        <StatusBadge status={manga.status} />
      </div>
    </div>
  );
}

export function Card16Neon({ manga }) {
  return (
    <div className="group cursor-pointer flex rounded-xl overflow-hidden border-2 border-delta-green/20 bg-white transition-all duration-300 hover:border-delta-green/40 hover:cosmic-glow-strong h-full min-h-[140px] shadow-sm">
      <div className="relative flex-shrink-0 w-28 overflow-hidden">
        <img src={manga.coverUrl || '/placeholder.svg'} alt={manga.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent" />
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-between p-3 border-l border-dockside-blue/60 bg-white">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={10} className="text-delta-green" />
            <span className="text-[10px] text-delta-green font-semibold uppercase tracking-wider">{manga.genre}</span>
          </div>
          <h3 className="font-bold text-sm text-black-feather line-clamp-1 leading-tight group-hover:text-delta-green transition-colors">{manga.title}</h3>
          <p className="text-[11px] text-sidewalk-grey mt-0.5">{manga.author}</p>
        </div>
        <div className="flex items-center justify-between mt-2">
          <StarRating rating={manga.rating} size={10} />
          <div className="flex items-center gap-1">
            <Clock size={10} className="text-sidewalk-grey" />
            <span className="text-[10px] text-sidewalk-grey">{manga.updatedAt}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Card17Dense({ manga }) {
  return (
    <div className="group cursor-pointer flex rounded-xl border border-dockside-blue bg-white overflow-hidden transition-all duration-300 hover:border-delta-green/40 h-full min-h-[160px] shadow-sm">
      <div className="relative flex-shrink-0 w-28 overflow-hidden bg-quarzo/40">
        <img src={manga.coverUrl || '/placeholder.svg'} alt={manga.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
      </div>
      <div className="flex-1 min-w-0 flex flex-col p-3 gap-2 bg-white">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-sm text-black-feather line-clamp-1 leading-tight group-hover:text-delta-green transition-colors">{manga.title}</h3>
          <div className="flex gap-1 flex-shrink-0">
            <Heart size={14} className="text-dockside-blue hover:text-delta-green transition-colors" />
            <Bookmark size={14} className="text-dockside-blue hover:text-delta-green transition-colors" />
          </div>
        </div>
        <p className="text-[11px] text-sidewalk-grey">{manga.author}{manga.artist ? ` / ${manga.artist}` : ''}</p>
        <p className="text-[10px] text-sidewalk-grey line-clamp-2">{manga.description}</p>
        <div className="flex flex-wrap gap-1 mt-auto">
          {(manga.tags || []).map((tag) => (
            <span key={tag} className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-delta-green/10 text-delta-green border border-delta-green/20">{tag}</span>
          ))}
        </div>
        <div className="flex items-center justify-between pt-1 border-t border-quarzo">
          <div className="flex items-center gap-1">
            <Star size={10} className="fill-delta-green text-delta-green" />
            <span className="text-[11px] text-delta-green font-semibold">{manga.rating.toFixed(1)}</span>
            <span className="text-[10px] text-sidewalk-grey">({(manga.ratingCount || 0).toLocaleString()})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-sidewalk-grey">{manga.chapters} Ch.</span>
            <StatusBadge status={manga.status} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function Card18Banner({ manga }) {
  const imgUrl = manga.coverImageUrl || manga.coverUrl || '/placeholder.svg';
  return (
    <div className="group cursor-pointer rounded-xl overflow-hidden relative min-h-[180px] transition-all duration-300 hover:cosmic-glow shadow-sm">
      <img src={imgUrl} alt={manga.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 brightness-60 group-hover:brightness-70" />
      <div className="absolute inset-0 bg-gradient-to-r from-delta-green/95 via-delta-green/80 to-delta-green/40" />
      <div className="relative z-10 flex h-full min-h-[180px] p-5 gap-4">
        <div className="relative flex-shrink-0 w-24 h-32 rounded-lg overflow-hidden shadow-2xl border-2 border-quarzo/80 self-center">
          <img src={imgUrl} alt={manga.title} className="w-full h-full object-cover" />
        </div>
        <div className="flex flex-col justify-center gap-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#1e3d59] text-white border border-[#1e3d59]">FEATURED</span>
            <StatusBadge status={manga.status} />
          </div>
          <h3 className="font-bold text-xl text-white line-clamp-1 leading-tight tracking-tight">{manga.title}</h3>
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
  );
}

export function Card19Timeline({ manga }) {
  return (
    <div className="group cursor-pointer flex rounded-xl border border-dockside-blue bg-white overflow-hidden transition-all duration-300 hover:border-delta-green/40 h-full min-h-[120px] shadow-sm">
      <div className="flex-shrink-0 w-1.5 bg-gradient-to-b from-delta-green to-delta-green group-hover:from-delta-green group-hover:to-delta-green transition-colors" />
      <div className="relative flex-shrink-0 w-20 overflow-hidden bg-quarzo/40">
        <img src={manga.coverUrl || '/placeholder.svg'} alt={manga.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-between p-3 bg-white">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Clock size={10} className="text-delta-green" />
            <span className="text-[10px] text-delta-green font-medium">{manga.updatedAt}</span>
          </div>
          <h3 className="font-semibold text-sm text-black-feather line-clamp-1 leading-tight group-hover:text-delta-green transition-colors">{manga.title}</h3>
          <p className="text-[11px] text-sidewalk-grey mt-0.5">{manga.author}</p>
        </div>
        <div className="flex items-center justify-between mt-1.5">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-delta-green/10 border border-delta-green/20">
            <BookOpen size={10} className="text-delta-green" />
            <span className="text-[10px] text-delta-green font-medium">{manga.latestChapter}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star size={10} className="fill-delta-green text-delta-green" />
            <span className="text-[11px] text-delta-green font-semibold">{manga.rating.toFixed(1)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Card20Trending({ manga }) {
  return (
    <div className="group cursor-pointer flex rounded-xl border border-dockside-blue bg-white overflow-hidden transition-all duration-300 hover:border-delta-green/50 hover:cosmic-glow h-full min-h-[140px] shadow-sm">
      <div className="relative flex-shrink-0 w-28 overflow-hidden bg-quarzo/40">
        <img src={manga.coverUrl || '/placeholder.svg'} alt={manga.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute top-2 left-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#1e3d59] text-white border border-[#1e3d59] backdrop-blur-sm">
            <TrendingUp size={9} /> TRENDING
          </span>
        </div>
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-between p-3 bg-white">
        <div>
          <h3 className="font-bold text-sm text-black-feather line-clamp-1 leading-tight group-hover:text-delta-green transition-colors">{manga.title}</h3>
          <p className="text-[11px] text-sidewalk-grey mt-0.5">{manga.author}</p>
          <p className="text-[10px] text-sidewalk-grey line-clamp-2 mt-1">{manga.description}</p>
        </div>
        <div className="flex items-center gap-3 mt-2">
          <div className="flex items-center gap-1">
            <Star size={10} className="fill-delta-green text-delta-green" />
            <span className="text-[11px] text-delta-green font-semibold">{manga.rating.toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-1 text-sidewalk-grey">
            <Eye size={10} />
            <span className="text-[10px]">{manga.views}</span>
          </div>
          <div className="flex items-center gap-1 text-sidewalk-grey">
            <Flame size={10} className="text-delta-green" />
            <span className="text-[10px]">{manga.chapters} Ch.</span>
          </div>
          <StatusBadge status={manga.status} />
        </div>
      </div>
    </div>
  );
}
