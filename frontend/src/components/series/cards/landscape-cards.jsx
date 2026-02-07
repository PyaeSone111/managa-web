import { Star, BookOpen, Eye, Clock, Heart, Bookmark, TrendingUp, Flame, ChevronRight, Play } from 'lucide-react';

function StarRating({ rating, size = 12 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={
            star <= Math.floor(rating)
              ? 'fill-cyan-400 text-cyan-400'
              : star <= rating
                ? 'fill-cyan-400/50 text-cyan-400'
                : 'fill-transparent text-slate-600'
          }
        />
      ))}
    </div>
  );
}

function StatusBadge({ status }) {
  const colors = {
    Ongoing: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    Completed: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    Hiatus: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${colors[status] || colors.Ongoing}`}>
      {status}
    </span>
  );
}

export function Card11Classic({ manga, onClick }) {
  return (
    <div role="button" tabIndex={0} onClick={onClick} onKeyDown={(e) => e.key === 'Enter' && onClick?.()} className="group cursor-pointer flex rounded-xl border border-slate-800 bg-slate-900/80 overflow-hidden transition-all duration-300 hover:border-cyan-500/40 h-full min-h-[140px]">
      <div className="relative flex-shrink-0 w-24 sm:w-28 overflow-hidden">
        <img src={manga.coverUrl || '/placeholder.jpg'} alt={manga.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-between p-3">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-sm text-slate-100 line-clamp-2 leading-tight group-hover:text-cyan-400 transition-colors">{manga.title}</h3>
            <StatusBadge status={manga.status} />
          </div>
          <p className="text-xs text-slate-400 mt-1">{manga.author}</p>
          <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">{manga.description}</p>
        </div>
        <div className="flex items-center gap-3 mt-2">
          <div className="flex items-center gap-1">
            <Star size={10} className="fill-cyan-400 text-cyan-400" />
            <span className="text-[11px] text-cyan-400 font-semibold">{Number(manga.rating).toFixed(1)}</span>
          </div>
          <span className="text-[10px] text-slate-500">{manga.chapters} Ch.</span>
          <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">{manga.genre}</span>
        </div>
      </div>
    </div>
  );
}

export function Card12Cinematic({ manga, onClick }) {
  return (
    <div role="button" tabIndex={0} onClick={onClick} onKeyDown={(e) => e.key === 'Enter' && onClick?.()} className="group cursor-pointer rounded-xl overflow-hidden relative min-h-[160px] transition-all duration-300">
      <img src={manga.coverUrl || '/placeholder.jpg'} alt={manga.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 brightness-50 group-hover:brightness-75" />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/60 to-transparent" />
      <div className="relative z-10 flex items-center h-full min-h-[160px] p-5">
        <div className="flex flex-col gap-2 max-w-[65%]">
          <div className="flex items-center gap-2">
            <StatusBadge status={manga.status} />
            <span className="text-[10px] text-cyan-400 font-medium">{manga.genre}</span>
          </div>
          <h3 className="font-bold text-lg text-white line-clamp-1 leading-tight tracking-wide">{manga.title}</h3>
          <p className="text-[11px] text-slate-300">{manga.author}</p>
          <p className="text-[11px] text-slate-400 line-clamp-2">{manga.description}</p>
          <div className="flex items-center gap-4 mt-1">
            <div className="flex items-center gap-1">
              <Star size={12} className="fill-cyan-400 text-cyan-400" />
              <span className="text-xs text-cyan-400 font-bold">{Number(manga.rating).toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-1 text-slate-400"><Eye size={12} /><span className="text-[11px]">{manga.views}</span></div>
            <div className="flex items-center gap-1 text-slate-400"><BookOpen size={12} /><span className="text-[11px]">{manga.chapters}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Card13Glass({ manga, onClick }) {
  return (
    <div role="button" tabIndex={0} onClick={onClick} onKeyDown={(e) => e.key === 'Enter' && onClick?.()} className="group cursor-pointer flex rounded-2xl overflow-hidden bg-white/5 border border-white/10 transition-all duration-300 hover:border-cyan-500/30 h-full min-h-[140px]">
      <div className="relative flex-shrink-0 w-28 overflow-hidden">
        <img src={manga.coverUrl || '/placeholder.jpg'} alt={manga.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-slate-900/30" />
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-between p-3 gap-1">
        <div>
          <h3 className="font-bold text-sm text-white line-clamp-1 leading-tight group-hover:text-cyan-400 transition-colors">{manga.title}</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">{manga.author}</p>
        </div>
        <div className="flex flex-wrap gap-1">
          {(manga.tags || []).map((tag) => (
            <span key={tag} className="px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-white/5 text-slate-300 border border-white/10">{tag}</span>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Star size={10} className="fill-amber-400 text-amber-400" />
            <span className="text-[11px] font-semibold text-white">{Number(manga.rating).toFixed(1)}</span>
            <span className="text-[10px] text-slate-500">({(manga.ratingCount || 0).toLocaleString()})</span>
          </div>
          <span className="text-[10px] text-slate-400">{manga.latestChapter}</span>
        </div>
      </div>
    </div>
  );
}

export function Card14Action({ manga, onClick }) {
  return (
    <div role="button" tabIndex={0} onClick={onClick} onKeyDown={(e) => e.key === 'Enter' && onClick?.()} className="group cursor-pointer flex rounded-xl border border-slate-800 bg-slate-900/90 overflow-hidden transition-all duration-300 hover:border-cyan-500/40 h-full min-h-[140px]">
      <div className="relative flex-shrink-0 w-24 sm:w-28 overflow-hidden">
        <img src={manga.coverUrl || '/placeholder.jpg'} alt={manga.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/0 group-hover:bg-slate-950/40 transition-colors">
          <Play size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
        </div>
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-between p-3">
        <div>
          <h3 className="font-bold text-sm text-slate-100 line-clamp-1 leading-tight group-hover:text-cyan-400 transition-colors">{manga.title}</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">{manga.author}</p>
          <p className="text-[10px] text-slate-500 line-clamp-1 mt-1">{manga.description}</p>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-500 text-slate-950 text-[11px] font-bold hover:bg-cyan-400 transition-colors">Read Now <ChevronRight size={12} /></span>
          <span className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-[11px] font-medium border border-slate-700"><Bookmark size={11} /> Save</span>
        </div>
      </div>
    </div>
  );
}

export function Card15Compact({ manga, rank = 0, onClick }) {
  return (
    <div role="button" tabIndex={0} onClick={onClick} onKeyDown={(e) => e.key === 'Enter' && onClick?.()} className="group cursor-pointer flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-900/60 p-2.5 transition-all duration-300 hover:border-cyan-500/30 hover:bg-slate-900/90">
      <span className="text-lg font-black text-slate-700 group-hover:text-cyan-500/50 transition-colors w-6 text-center flex-shrink-0">{rank || 0}</span>
      <div className="relative flex-shrink-0 w-12 h-16 rounded-md overflow-hidden">
        <img src={manga.coverUrl || '/placeholder.jpg'} alt={manga.title} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-sm text-slate-100 line-clamp-1 group-hover:text-cyan-400 transition-colors">{manga.title}</h3>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[11px] text-slate-400">{manga.author}</span>
          <span className="text-slate-700">|</span>
          <span className="text-[11px] text-slate-500">{manga.genre}</span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <div className="flex items-center gap-1">
          <Star size={10} className="fill-cyan-400 text-cyan-400" />
          <span className="text-[11px] text-cyan-400 font-semibold">{Number(manga.rating).toFixed(1)}</span>
        </div>
        <StatusBadge status={manga.status} />
      </div>
    </div>
  );
}

export function Card16Neon({ manga, onClick }) {
  return (
    <div role="button" tabIndex={0} onClick={onClick} onKeyDown={(e) => e.key === 'Enter' && onClick?.()} className="group cursor-pointer flex rounded-xl overflow-hidden border-2 border-cyan-500/20 bg-slate-900 transition-all duration-300 hover:border-cyan-400/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.25)] h-full min-h-[140px]">
      <div className="relative flex-shrink-0 w-28 overflow-hidden">
        <img src={manga.coverUrl || '/placeholder.jpg'} alt={manga.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-slate-900 to-transparent" />
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-between p-3 border-l border-cyan-500/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] text-cyan-400 font-semibold uppercase tracking-wider">{manga.genre}</span>
          </div>
          <h3 className="font-bold text-sm text-cyan-50 line-clamp-1 leading-tight group-hover:text-cyan-400 transition-colors">{manga.title}</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">{manga.author}</p>
        </div>
        <div className="flex items-center justify-between mt-2">
          <StarRating rating={manga.rating} size={10} />
          <div className="flex items-center gap-1">
            <Clock size={10} className="text-slate-500" />
            <span className="text-[10px] text-slate-500">{manga.updatedAt}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Card17Dense({ manga, onClick }) {
  return (
    <div role="button" tabIndex={0} onClick={onClick} onKeyDown={(e) => e.key === 'Enter' && onClick?.()} className="group cursor-pointer flex rounded-xl border border-slate-800 bg-slate-900/80 overflow-hidden transition-all duration-300 hover:border-cyan-500/30 h-full min-h-[160px]">
      <div className="relative flex-shrink-0 w-28 overflow-hidden">
        <img src={manga.coverUrl || '/placeholder.jpg'} alt={manga.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
      </div>
      <div className="flex-1 min-w-0 flex flex-col p-3 gap-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-sm text-slate-100 line-clamp-1 leading-tight group-hover:text-cyan-400 transition-colors">{manga.title}</h3>
          <div className="flex gap-1 flex-shrink-0">
            <Heart size={14} className="text-slate-600 hover:text-rose-400 transition-colors" />
            <Bookmark size={14} className="text-slate-600 hover:text-cyan-400 transition-colors" />
          </div>
        </div>
        <p className="text-[11px] text-slate-400">{manga.author}{manga.artist ? ` / ${manga.artist}` : ''}</p>
        <p className="text-[10px] text-slate-500 line-clamp-2">{manga.description}</p>
        <div className="flex flex-wrap gap-1 mt-auto">
          {(manga.tags || []).map((tag) => (
            <span key={tag} className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">{tag}</span>
          ))}
        </div>
        <div className="flex items-center justify-between pt-1 border-t border-slate-800">
          <div className="flex items-center gap-1">
            <Star size={10} className="fill-cyan-400 text-cyan-400" />
            <span className="text-[11px] text-cyan-400 font-semibold">{Number(manga.rating).toFixed(1)}</span>
            <span className="text-[10px] text-slate-500">({(manga.ratingCount || 0).toLocaleString()})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500">{manga.chapters} Ch.</span>
            <StatusBadge status={manga.status} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function Card18Banner({ manga, onClick }) {
  return (
    <div role="button" tabIndex={0} onClick={onClick} onKeyDown={(e) => e.key === 'Enter' && onClick?.()} className="group cursor-pointer rounded-xl overflow-hidden relative min-h-[180px] transition-all duration-300">
      <img src={manga.coverUrl || '/placeholder.jpg'} alt={manga.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 brightness-40" />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-slate-950/30" />
      <div className="relative z-10 flex h-full min-h-[180px] p-5 gap-4">
        <div className="relative flex-shrink-0 w-24 h-32 rounded-lg overflow-hidden shadow-2xl border border-white/10 self-center">
          <img src={manga.coverUrl || '/placeholder.jpg'} alt={manga.title} className="w-full h-full object-cover" />
        </div>
        <div className="flex flex-col justify-center gap-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500 text-slate-950">FEATURED</span>
            <StatusBadge status={manga.status} />
          </div>
          <h3 className="font-bold text-xl text-white line-clamp-1 leading-tight tracking-tight">{manga.title}</h3>
          <p className="text-xs text-slate-300">{manga.author}</p>
          <p className="text-[11px] text-slate-400 line-clamp-2">{manga.description}</p>
          <div className="flex items-center gap-4 mt-1">
            <StarRating rating={manga.rating} />
            <span className="text-xs text-cyan-400 font-semibold">{Number(manga.rating).toFixed(1)}</span>
            <div className="flex items-center gap-1 text-slate-400"><Eye size={12} /><span className="text-[11px]">{manga.views}</span></div>
            <span className="text-[11px] text-slate-500">{manga.chapters} chapters</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Card19Timeline({ manga, onClick }) {
  return (
    <div role="button" tabIndex={0} onClick={onClick} onKeyDown={(e) => e.key === 'Enter' && onClick?.()} className="group cursor-pointer flex rounded-xl border border-slate-800 bg-slate-900/80 overflow-hidden transition-all duration-300 hover:border-cyan-500/30 h-full min-h-[120px]">
      <div className="flex-shrink-0 w-1.5 bg-gradient-to-b from-cyan-400 to-violet-500 group-hover:from-cyan-300 group-hover:to-violet-400 transition-colors" />
      <div className="relative flex-shrink-0 w-20 overflow-hidden">
        <img src={manga.coverUrl || '/placeholder.jpg'} alt={manga.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-between p-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Clock size={10} className="text-cyan-400" />
            <span className="text-[10px] text-cyan-400 font-medium">{manga.updatedAt}</span>
          </div>
          <h3 className="font-semibold text-sm text-slate-100 line-clamp-1 group-hover:text-cyan-400 transition-colors">{manga.title}</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">{manga.author}</p>
        </div>
        <div className="flex items-center justify-between mt-1.5">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
            <BookOpen size={10} className="text-cyan-400" />
            <span className="text-[10px] text-cyan-400 font-medium">{manga.latestChapter}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star size={10} className="fill-cyan-400 text-cyan-400" />
            <span className="text-[11px] text-cyan-400 font-semibold">{Number(manga.rating).toFixed(1)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Card20Trending({ manga, onClick }) {
  return (
    <div role="button" tabIndex={0} onClick={onClick} onKeyDown={(e) => e.key === 'Enter' && onClick?.()} className="group cursor-pointer flex rounded-xl border border-slate-800 bg-slate-900/80 overflow-hidden transition-all duration-300 hover:border-emerald-500/30 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] h-full min-h-[140px]">
      <div className="relative flex-shrink-0 w-28 overflow-hidden">
        <img src={manga.coverUrl || '/placeholder.jpg'} alt={manga.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute top-2 left-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 backdrop-blur-sm">
            <TrendingUp size={9} /> TRENDING
          </span>
        </div>
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-between p-3">
        <div>
          <h3 className="font-bold text-sm text-slate-100 line-clamp-1 leading-tight group-hover:text-emerald-400 transition-colors">{manga.title}</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">{manga.author}</p>
          <p className="text-[10px] text-slate-500 line-clamp-2 mt-1">{manga.description}</p>
        </div>
        <div className="flex items-center gap-3 mt-2">
          <div className="flex items-center gap-1">
            <Star size={10} className="fill-cyan-400 text-cyan-400" />
            <span className="text-[11px] text-cyan-400 font-semibold">{Number(manga.rating).toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-1 text-slate-500"><Eye size={10} /><span className="text-[10px]">{manga.views}</span></div>
          <div className="flex items-center gap-1 text-slate-500"><Flame size={10} className="text-orange-400" /><span className="text-[10px]">{manga.chapters} Ch.</span></div>
          <StatusBadge status={manga.status} />
        </div>
      </div>
    </div>
  );
}
