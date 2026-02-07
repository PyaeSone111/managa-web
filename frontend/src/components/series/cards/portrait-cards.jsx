import { Star, BookOpen, Eye, Heart, Flame, Award } from 'lucide-react';

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

export function Card01Classic({ manga, onClick }) {
  return (
    <div role="button" tabIndex={0} onClick={onClick} onKeyDown={(e) => e.key === 'Enter' && onClick?.()} className="group cursor-pointer rounded-xl border border-slate-800 bg-slate-900/80 overflow-hidden transition-all duration-300 hover:border-cyan-500/40 flex flex-col h-full">
      <div className="relative w-full aspect-[2/3] overflow-hidden bg-slate-800">
        <img src={manga.coverUrl || '/placeholder.jpg'} alt={manga.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute top-2 right-2"><StatusBadge status={manga.status} /></div>
      </div>
      <div className="p-3 flex flex-col gap-1.5 flex-1">
        <h3 className="font-semibold text-sm text-slate-100 line-clamp-2 leading-tight group-hover:text-cyan-400 transition-colors">{manga.title}</h3>
        <p className="text-xs text-slate-400 line-clamp-1">{manga.author}</p>
        <div className="flex items-center gap-2 mt-auto pt-1">
          <StarRating rating={manga.rating} />
          <span className="text-[10px] text-slate-500">{Number(manga.rating).toFixed(1)}</span>
        </div>
        <span className="inline-block w-fit px-2 py-0.5 rounded-md text-[10px] font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">{manga.genre}</span>
      </div>
    </div>
  );
}

export function Card02Overlay({ manga, onClick }) {
  return (
    <div role="button" tabIndex={0} onClick={onClick} onKeyDown={(e) => e.key === 'Enter' && onClick?.()} className="group cursor-pointer rounded-xl overflow-hidden relative aspect-[2/3] transition-all duration-300">
      <img src={manga.coverUrl || '/placeholder.jpg'} alt={manga.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
      <div className="absolute top-3 left-3"><StatusBadge status={manga.status} /></div>
      <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-slate-950/70 backdrop-blur-sm px-2 py-1">
        <Star size={10} className="fill-cyan-400 text-cyan-400" />
        <span className="text-[11px] font-semibold text-cyan-400">{Number(manga.rating).toFixed(1)}</span>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col gap-1">
        <h3 className="font-bold text-sm text-white line-clamp-2 leading-tight drop-shadow-lg">{manga.title}</h3>
        <p className="text-[11px] text-slate-300">{manga.author}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] text-cyan-400 font-medium">{manga.genre}</span>
          <span className="text-slate-600">|</span>
          <span className="text-[10px] text-slate-400">{manga.chapters} Ch.</span>
        </div>
      </div>
    </div>
  );
}

export function Card03Neon({ manga, onClick }) {
  return (
    <div role="button" tabIndex={0} onClick={onClick} onKeyDown={(e) => e.key === 'Enter' && onClick?.()} className="group cursor-pointer rounded-xl overflow-hidden relative flex flex-col h-full border-2 border-cyan-500/20 bg-slate-900 transition-all duration-300 hover:border-cyan-400/60 hover:shadow-[0_0_30px_rgba(6,182,212,0.3)]">
      <div className="relative w-full aspect-[2/3] overflow-hidden">
        <img src={manga.coverUrl || '/placeholder.jpg'} alt={manga.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
          <div className="flex items-center gap-1 bg-slate-950/80 backdrop-blur-sm rounded-full px-2 py-1">
            <Flame size={10} className="text-orange-400" />
            <span className="text-[10px] text-slate-200 font-medium">{manga.views}</span>
          </div>
          <div className="flex items-center gap-1 bg-slate-950/80 backdrop-blur-sm rounded-full px-2 py-1">
            <Star size={10} className="fill-cyan-400 text-cyan-400" />
            <span className="text-[10px] text-cyan-400 font-semibold">{Number(manga.rating).toFixed(1)}</span>
          </div>
        </div>
      </div>
      <div className="p-3 flex flex-col gap-1 flex-1 border-t border-cyan-500/10">
        <h3 className="font-bold text-sm text-cyan-50 line-clamp-2 leading-tight group-hover:text-cyan-400 transition-colors">{manga.title}</h3>
        <p className="text-[11px] text-slate-400">{manga.author}</p>
        <div className="flex items-center gap-1.5 mt-auto pt-1.5">
          {(manga.tags || []).slice(0, 2).map((tag) => (
            <span key={tag} className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Card04Minimal({ manga, onClick }) {
  return (
    <div role="button" tabIndex={0} onClick={onClick} onKeyDown={(e) => e.key === 'Enter' && onClick?.()} className="group cursor-pointer rounded-2xl overflow-hidden flex flex-col h-full bg-slate-900/50 transition-all duration-300 hover:bg-slate-900/80">
      <div className="relative w-full aspect-[2/3] overflow-hidden rounded-2xl m-2 mb-0">
        <img src={manga.coverUrl || '/placeholder.jpg'} alt={manga.title} className="w-full h-full object-cover rounded-xl transition-transform duration-500 group-hover:scale-105" />
      </div>
      <div className="px-3 py-3 flex flex-col gap-0.5 flex-1">
        <h3 className="font-semibold text-sm text-slate-100 line-clamp-1 group-hover:text-cyan-400 transition-colors">{manga.title}</h3>
        <p className="text-[11px] text-slate-500">{manga.author}</p>
        <div className="flex items-center gap-1 mt-auto pt-1">
          <Star size={10} className="fill-cyan-400 text-cyan-400" />
          <span className="text-[11px] text-slate-400 font-medium">{Number(manga.rating).toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
}

export function Card05Badges({ manga, onClick }) {
  return (
    <div role="button" tabIndex={0} onClick={onClick} onKeyDown={(e) => e.key === 'Enter' && onClick?.()} className="group cursor-pointer rounded-xl border border-slate-800 bg-slate-900/80 overflow-hidden flex flex-col h-full transition-all duration-300 hover:border-violet-500/40">
      <div className="relative w-full aspect-[2/3] overflow-hidden">
        <img src={manga.coverUrl || '/placeholder.jpg'} alt={manga.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          <StatusBadge status={manga.status} />
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-violet-500/20 text-violet-300 border border-violet-500/30"><Flame size={9} /> HOT</span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-2">
          <div className="flex flex-wrap gap-1">
            {(manga.tags || []).map((tag) => (
              <span key={tag} className="px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-slate-950/80 backdrop-blur-sm text-slate-300 border border-slate-700/50">{tag}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="p-3 flex flex-col gap-1.5 flex-1">
        <h3 className="font-semibold text-sm text-slate-100 line-clamp-2 leading-tight group-hover:text-violet-400 transition-colors">{manga.title}</h3>
        <p className="text-xs text-slate-400">{manga.author}</p>
        <div className="flex items-center gap-2 mt-auto pt-1">
          <StarRating rating={manga.rating} />
          <span className="text-[10px] text-slate-500">({(manga.ratingCount || 0).toLocaleString()})</span>
        </div>
      </div>
    </div>
  );
}

export function Card06Stats({ manga, onClick }) {
  return (
    <div role="button" tabIndex={0} onClick={onClick} onKeyDown={(e) => e.key === 'Enter' && onClick?.()} className="group cursor-pointer rounded-xl border border-slate-800 bg-slate-900/90 overflow-hidden flex flex-col h-full transition-all duration-300 hover:border-cyan-500/30">
      <div className="relative w-full aspect-[2/3] overflow-hidden">
        <img src={manga.coverUrl || '/placeholder.jpg'} alt={manga.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
        <div className="absolute bottom-2 left-2 right-2 grid grid-cols-3 gap-1">
          <div className="flex flex-col items-center bg-slate-950/80 backdrop-blur-sm rounded-lg py-1.5 px-1">
            <Eye size={10} className="text-cyan-400 mb-0.5" />
            <span className="text-[9px] text-slate-300 font-semibold">{manga.views}</span>
          </div>
          <div className="flex flex-col items-center bg-slate-950/80 backdrop-blur-sm rounded-lg py-1.5 px-1">
            <BookOpen size={10} className="text-cyan-400 mb-0.5" />
            <span className="text-[9px] text-slate-300 font-semibold">{manga.chapters}</span>
          </div>
          <div className="flex flex-col items-center bg-slate-950/80 backdrop-blur-sm rounded-lg py-1.5 px-1">
            <Star size={10} className="fill-cyan-400 text-cyan-400 mb-0.5" />
            <span className="text-[9px] text-cyan-400 font-semibold">{Number(manga.rating).toFixed(1)}</span>
          </div>
        </div>
      </div>
      <div className="p-3 flex flex-col gap-1 flex-1">
        <h3 className="font-bold text-sm text-slate-100 line-clamp-2 leading-tight group-hover:text-cyan-400 transition-colors">{manga.title}</h3>
        <p className="text-[11px] text-slate-400">{manga.author}</p>
        <div className="flex items-center gap-1.5 mt-auto pt-1">
          <StatusBadge status={manga.status} />
          <span className="text-[10px] text-slate-500">{manga.genre}</span>
        </div>
      </div>
    </div>
  );
}

export function Card07Glass({ manga, onClick }) {
  return (
    <div role="button" tabIndex={0} onClick={onClick} onKeyDown={(e) => e.key === 'Enter' && onClick?.()} className="group cursor-pointer rounded-2xl overflow-hidden relative aspect-[2/3] transition-all duration-300">
      <img src={manga.coverUrl || '/placeholder.jpg'} alt={manga.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-slate-950/40" />
      <div className="absolute top-3 right-3">
        <div className="flex items-center gap-1 bg-white/10 backdrop-blur rounded-full px-2.5 py-1 border border-white/10">
          <Star size={11} className="fill-amber-400 text-amber-400" />
          <span className="text-[11px] font-bold text-white">{Number(manga.rating).toFixed(1)}</span>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <div className="bg-white/10 backdrop-blur rounded-xl border border-white/10 p-3 flex flex-col gap-1.5">
          <h3 className="font-bold text-sm text-white line-clamp-2 leading-tight">{manga.title}</h3>
          <p className="text-[11px] text-slate-300">{manga.author}</p>
          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-cyan-400 font-medium">{manga.genre}</span>
            <span className="text-[10px] text-slate-400">{manga.chapters} chapters</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Card08Accent({ manga, onClick }) {
  return (
    <div role="button" tabIndex={0} onClick={onClick} onKeyDown={(e) => e.key === 'Enter' && onClick?.()} className="group cursor-pointer rounded-xl overflow-hidden flex flex-col h-full bg-slate-900 border-l-4 border-l-cyan-500 border border-slate-800 transition-all duration-300 hover:border-cyan-500/40 hover:bg-slate-900/90">
      <div className="relative w-full aspect-[3/4] overflow-hidden">
        <img src={manga.coverUrl || '/placeholder.jpg'} alt={manga.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-cyan-400 to-violet-500" />
      </div>
      <div className="p-3 flex flex-col gap-1 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-sm text-slate-100 line-clamp-2 leading-tight group-hover:text-cyan-400 transition-colors flex-1">{manga.title}</h3>
          <Heart size={14} className="text-slate-600 hover:text-rose-400 transition-colors flex-shrink-0 mt-0.5" />
        </div>
        <p className="text-[11px] text-slate-400">{manga.author}</p>
        <div className="flex items-center gap-2 mt-auto pt-1">
          <div className="flex items-center gap-1">
            <Star size={10} className="fill-cyan-400 text-cyan-400" />
            <span className="text-[11px] text-cyan-400 font-semibold">{Number(manga.rating).toFixed(1)}</span>
          </div>
          <span className="text-slate-700">|</span>
          <StatusBadge status={manga.status} />
        </div>
      </div>
    </div>
  );
}

export function Card09Cinematic({ manga, onClick }) {
  return (
    <div role="button" tabIndex={0} onClick={onClick} onKeyDown={(e) => e.key === 'Enter' && onClick?.()} className="group cursor-pointer rounded-xl overflow-hidden relative flex flex-col h-full bg-slate-950 transition-all duration-300">
      <div className="relative w-full aspect-[2/3] overflow-hidden">
        <img src={manga.coverUrl || '/placeholder.jpg'} alt={manga.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 brightness-90 group-hover:brightness-100" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/30" />
        <div className="absolute top-0 left-0 right-0 h-4 bg-slate-950" />
        <div className="absolute bottom-0 left-0 right-0 h-4 bg-slate-950" />
        <div className="absolute top-5 left-3 flex items-center gap-1">
          <Award size={12} className="text-amber-400" />
          <span className="text-[10px] font-bold text-amber-400">TOP RATED</span>
        </div>
      </div>
      <div className="p-3 flex flex-col gap-1 flex-1 bg-slate-950">
        <h3 className="font-bold text-sm text-white line-clamp-2 leading-tight tracking-wide uppercase group-hover:text-cyan-400 transition-colors">{manga.title}</h3>
        <p className="text-[11px] text-slate-500 italic">{manga.author}</p>
        <p className="text-[10px] text-slate-500 line-clamp-2 mt-0.5">{manga.description}</p>
        <div className="flex items-center justify-between mt-auto pt-1.5 border-t border-slate-800">
          <StarRating rating={manga.rating} size={10} />
          <span className="text-[10px] text-slate-500">{manga.latestChapter}</span>
        </div>
      </div>
    </div>
  );
}

export function Card10Rank({ manga, rank = 0, onClick }) {
  return (
    <div role="button" tabIndex={0} onClick={onClick} onKeyDown={(e) => e.key === 'Enter' && onClick?.()} className="group cursor-pointer rounded-xl overflow-hidden relative flex flex-col h-full border border-slate-800 bg-slate-900/80 transition-all duration-300 hover:border-cyan-500/40">
      <div className="relative w-full aspect-[2/3] overflow-hidden">
        <img src={manga.coverUrl || '/placeholder.jpg'} alt={manga.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
        <div className="absolute -bottom-2 -left-1">
          <span className="text-7xl font-black leading-none" style={{ WebkitTextStroke: '2px rgba(6, 182, 212, 0.6)', color: 'transparent', textShadow: '0 0 30px rgba(6, 182, 212, 0.3)' }}>
            {String(rank || 0).padStart(2, '0')}
          </span>
        </div>
        <div className="absolute top-2 right-2"><StatusBadge status={manga.status} /></div>
      </div>
      <div className="p-3 flex flex-col gap-1 flex-1">
        <h3 className="font-bold text-sm text-slate-100 line-clamp-2 leading-tight group-hover:text-cyan-400 transition-colors">{manga.title}</h3>
        <p className="text-[11px] text-slate-400">{manga.author}</p>
        <div className="flex items-center gap-2 mt-auto pt-1">
          <div className="flex items-center gap-1">
            <Star size={10} className="fill-cyan-400 text-cyan-400" />
            <span className="text-[11px] text-cyan-400 font-semibold">{Number(manga.rating).toFixed(1)}</span>
          </div>
          <span className="text-[10px] text-slate-500">{manga.views} views</span>
        </div>
      </div>
    </div>
  );
}
