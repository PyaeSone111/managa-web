import { Star, BookOpen, Eye, Flame, Heart, Award } from 'lucide-react';

/* Serene Winter: primary UI = delta-green (#2e4b4e); quarzo, dockside-blue, sidewalk-grey, black-feather */

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
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#2e4b4e] text-white border border-[#2e4b4e]">
      {status}
    </span>
  );
}

export function Card01Classic({ manga }) {
  return (
    <div className="group cursor-pointer rounded-xl border border-dockside-blue bg-white overflow-hidden transition-all duration-300 hover:border-delta-green/60 hover:cosmic-glow flex flex-col h-full shadow-sm">
      <div className="relative w-full aspect-[2/3] overflow-hidden bg-quarzo/50">
        <img src={manga.coverUrl || '/placeholder.svg'} alt={manga.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute top-2 right-2">
          <StatusBadge status={manga.status} />
        </div>
      </div>
      <div className="p-3 flex flex-col gap-1.5 flex-1 bg-white">
        <h3 className="font-semibold text-sm text-black-feather line-clamp-2 leading-tight group-hover:text-delta-green transition-colors">{manga.title}</h3>
        <p className="text-xs text-sidewalk-grey line-clamp-1">{manga.author}</p>
        <div className="flex items-center gap-2 mt-auto pt-1">
          <StarRating rating={manga.rating} />
          <span className="text-[10px] text-sidewalk-grey">{manga.rating.toFixed(1)}</span>
        </div>
        <span className="inline-block w-fit px-2 py-0.5 rounded-md text-[10px] font-medium bg-delta-green/10 text-delta-green border border-delta-green/20">{manga.genre}</span>
      </div>
    </div>
  );
}

export function Card02Overlay({ manga }) {
  const imgUrl = manga.coverImageUrl || manga.coverUrl || '/placeholder.svg';
  return (
    <div className="group cursor-pointer rounded-xl overflow-hidden relative aspect-[2/3] transition-all duration-300 hover:cosmic-glow-strong shadow-sm">
      <img src={imgUrl} alt={manga.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      <div className="absolute top-3 left-3">
        <StatusBadge status={manga.status} />
      </div>
      <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full glass px-2 py-1">
        <Star size={10} className="fill-quarzo text-quarzo" />
        <span className="text-[11px] font-semibold text-black-feather">{manga.rating.toFixed(1)}</span>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col gap-1">
        <h3 className="font-bold text-sm text-white line-clamp-2 leading-tight drop-shadow-lg">{manga.title}</h3>
        <p className="text-[11px] text-quarzo">{manga.author}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] text-quarzo font-medium">{manga.genre}</span>
          <span className="text-white/60">|</span>
          <span className="text-[10px] text-white/90">{manga.chapters} Ch.</span>
        </div>
      </div>
    </div>
  );
}

export function Card03Neon({ manga }) {
  return (
    <div className="group cursor-pointer rounded-xl overflow-hidden relative flex flex-col h-full border-2 border-delta-green/20 bg-white transition-all duration-300 hover:border-delta-green/50 hover:cosmic-glow-strong shadow-sm">
      <div className="relative w-full aspect-[2/3] overflow-hidden">
        <img src={manga.coverUrl || '/placeholder.svg'} alt={manga.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-transparent opacity-80" />
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
          <div className="flex items-center gap-1 glass rounded-full px-2 py-1">
            <Flame size={10} className="text-delta-green" />
            <span className="text-[10px] text-black-feather font-medium">{manga.views}</span>
          </div>
          <div className="flex items-center gap-1 glass rounded-full px-2 py-1">
            <Star size={10} className="fill-delta-green text-delta-green" />
            <span className="text-[10px] text-delta-green font-semibold">{manga.rating.toFixed(1)}</span>
          </div>
        </div>
      </div>
      <div className="p-3 flex flex-col gap-1 flex-1 border-t border-dockside-blue/60 bg-white">
        <h3 className="font-bold text-sm text-black-feather line-clamp-2 leading-tight group-hover:text-delta-green transition-colors">{manga.title}</h3>
        <p className="text-[11px] text-sidewalk-grey">{manga.author}</p>
        <div className="flex items-center gap-1.5 mt-auto pt-1.5">
          {(manga.tags || []).slice(0, 2).map((tag) => (
            <span key={tag} className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-delta-green/10 text-delta-green border border-delta-green/20">{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Card04Minimal({ manga }) {
  return (
    <div className="group cursor-pointer rounded-2xl overflow-hidden flex flex-col h-full bg-quarzo/30 transition-all duration-300 hover:bg-quarzo/50 border border-dockside-blue/50 shadow-sm">
      <div className="relative w-full aspect-[2/3] overflow-hidden rounded-2xl m-2 mb-0">
        <img src={manga.coverUrl || '/placeholder.svg'} alt={manga.title} className="w-full h-full object-cover rounded-xl transition-transform duration-500 group-hover:scale-105" />
      </div>
      <div className="px-3 py-3 flex flex-col gap-0.5 flex-1 bg-white/80 rounded-b-2xl">
        <h3 className="font-semibold text-sm text-black-feather line-clamp-1 group-hover:text-delta-green transition-colors">{manga.title}</h3>
        <p className="text-[11px] text-sidewalk-grey">{manga.author}</p>
        <div className="flex items-center gap-1 mt-auto pt-1">
          <Star size={10} className="fill-delta-green text-delta-green" />
          <span className="text-[11px] text-sidewalk-grey font-medium">{manga.rating.toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
}

export function Card05Badges({ manga }) {
  return (
    <div className="group cursor-pointer rounded-xl border border-dockside-blue bg-white overflow-hidden flex flex-col h-full transition-all duration-300 hover:border-delta-green/50 shadow-sm">
      <div className="relative w-full aspect-[2/3] overflow-hidden">
        <img src={manga.coverUrl || '/placeholder.svg'} alt={manga.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          <StatusBadge status={manga.status} />
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#2e4b4e] text-white border border-[#2e4b4e]">
            <Flame size={9} /> HOT
          </span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-2">
          <div className="flex flex-wrap gap-1">
            {(manga.tags || []).map((tag) => (
              <span key={tag} className="px-1.5 py-0.5 rounded-full text-[9px] font-medium glass text-black-feather">{tag}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="p-3 flex flex-col gap-1.5 flex-1 bg-white">
        <h3 className="font-semibold text-sm text-black-feather line-clamp-2 leading-tight group-hover:text-delta-green transition-colors">{manga.title}</h3>
        <p className="text-xs text-sidewalk-grey">{manga.author}</p>
        <div className="flex items-center gap-2 mt-auto pt-1">
          <StarRating rating={manga.rating} />
          <span className="text-[10px] text-sidewalk-grey">({(manga.ratingCount || 0).toLocaleString()})</span>
        </div>
      </div>
    </div>
  );
}

export function Card06Stats({ manga }) {
  return (
    <div className="group cursor-pointer rounded-xl border border-dockside-blue bg-white overflow-hidden flex flex-col h-full transition-all duration-300 hover:border-delta-green/50 hover:cosmic-glow shadow-sm">
      <div className="relative w-full aspect-[2/3] overflow-hidden">
        <img src={manga.coverUrl || '/placeholder.svg'} alt={manga.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <div className="absolute bottom-2 left-2 right-2 grid grid-cols-3 gap-1">
          <div className="flex flex-col items-center glass rounded-lg py-1.5 px-1">
            <Eye size={10} className="text-delta-green mb-0.5" />
            <span className="text-[9px] text-black-feather font-semibold">{manga.views}</span>
          </div>
          <div className="flex flex-col items-center glass rounded-lg py-1.5 px-1">
            <BookOpen size={10} className="text-delta-green mb-0.5" />
            <span className="text-[9px] text-black-feather font-semibold">{manga.chapters}</span>
          </div>
          <div className="flex flex-col items-center glass rounded-lg py-1.5 px-1">
            <Star size={10} className="fill-delta-green text-delta-green mb-0.5" />
            <span className="text-[9px] text-delta-green font-semibold">{manga.rating.toFixed(1)}</span>
          </div>
        </div>
      </div>
      <div className="p-3 flex flex-col gap-1 flex-1 bg-white">
        <h3 className="font-bold text-sm text-black-feather line-clamp-2 leading-tight group-hover:text-delta-green transition-colors">{manga.title}</h3>
        <p className="text-[11px] text-sidewalk-grey">{manga.author}</p>
        <div className="flex items-center gap-1.5 mt-auto pt-1">
          <StatusBadge status={manga.status} />
          <span className="text-[10px] text-sidewalk-grey">{manga.genre}</span>
        </div>
      </div>
    </div>
  );
}

export function Card07Glass({ manga }) {
  const imgUrl = manga.coverImageUrl || manga.coverUrl || '/placeholder.svg';
  return (
    <div className="group cursor-pointer rounded-2xl overflow-hidden relative aspect-[2/3] transition-all duration-300 hover:cosmic-glow-strong shadow-sm">
      <img src={imgUrl} alt={manga.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-quarzo/30" />
      <div className="absolute top-3 right-3">
        <div className="flex items-center gap-1 glass rounded-full px-2.5 py-1">
          <Star size={11} className="fill-delta-green text-delta-green" />
          <span className="text-[11px] font-bold text-black-feather">{manga.rating.toFixed(1)}</span>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <div className="glass rounded-xl p-3 flex flex-col gap-1.5">
          <h3 className="font-bold text-sm text-black-feather line-clamp-2 leading-tight">{manga.title}</h3>
          <p className="text-[11px] text-sidewalk-grey">{manga.author}</p>
          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-delta-green font-medium">{manga.genre}</span>
            <span className="text-[10px] text-sidewalk-grey">{manga.chapters} chapters</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Card08Accent({ manga }) {
  return (
    <div className="group cursor-pointer rounded-xl overflow-hidden flex flex-col h-full bg-white border-l-4 border-l-delta-green border border-dockside-blue transition-all duration-300 hover:border-delta-green/60 shadow-sm">
      <div className="relative w-full aspect-[3/4] overflow-hidden">
        <img src={manga.coverUrl || '/placeholder.svg'} alt={manga.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-delta-green to-delta-green" />
      </div>
      <div className="p-3 flex flex-col gap-1 flex-1 bg-white">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-sm text-black-feather line-clamp-2 leading-tight group-hover:text-delta-green transition-colors flex-1">{manga.title}</h3>
          <Heart size={14} className="text-dockside-blue hover:text-delta-green transition-colors flex-shrink-0 mt-0.5" />
        </div>
        <p className="text-[11px] text-sidewalk-grey">{manga.author}</p>
        <div className="flex items-center gap-2 mt-auto pt-1">
          <div className="flex items-center gap-1">
            <Star size={10} className="fill-delta-green text-delta-green" />
            <span className="text-[11px] text-delta-green font-semibold">{manga.rating.toFixed(1)}</span>
          </div>
          <span className="text-dockside-blue">|</span>
          <StatusBadge status={manga.status} />
        </div>
      </div>
    </div>
  );
}

export function Card09Cinematic({ manga }) {
  return (
    <div className="group cursor-pointer rounded-xl overflow-hidden relative flex flex-col h-full bg-white border border-dockside-blue transition-all duration-300 hover:cosmic-glow shadow-sm">
      <div className="relative w-full aspect-[2/3] overflow-hidden">
        <img src={manga.coverUrl || '/placeholder.svg'} alt={manga.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 brightness-95 group-hover:brightness-100" />
        <div className="absolute inset-0 bg-gradient-to-t from-delta-green/90 via-transparent to-quarzo/20" />
        <div className="absolute top-0 left-0 right-0 h-4 bg-delta-green" />
        <div className="absolute bottom-0 left-0 right-0 h-4 bg-delta-green" />
        <div className="absolute top-5 left-3 flex items-center gap-1">
          <Award size={12} className="text-quarzo" />
          <span className="text-[10px] font-bold text-quarzo">TOP RATED</span>
        </div>
      </div>
      <div className="p-3 flex flex-col gap-1 flex-1 bg-white border-t border-dockside-blue">
        <h3 className="font-bold text-sm text-black-feather line-clamp-2 leading-tight tracking-wide uppercase group-hover:text-delta-green transition-colors">{manga.title}</h3>
        <p className="text-[11px] text-sidewalk-grey italic">{manga.author}</p>
        <p className="text-[10px] text-sidewalk-grey line-clamp-2 mt-0.5">{manga.description}</p>
        <div className="flex items-center justify-between mt-auto pt-1.5 border-t border-quarzo">
          <StarRating rating={manga.rating} size={10} />
          <span className="text-[10px] text-sidewalk-grey">{manga.latestChapter}</span>
        </div>
      </div>
    </div>
  );
}

export function Card10Rank({ manga, rank }) {
  return (
    <div className="group cursor-pointer rounded-xl overflow-hidden relative flex flex-col h-full border border-dockside-blue bg-white transition-all duration-300 hover:border-delta-green/50 hover:cosmic-glow shadow-sm">
      <div className="relative w-full aspect-[2/3] overflow-hidden">
        <img src={manga.coverUrl || '/placeholder.svg'} alt={manga.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent" />
        <div className="absolute -bottom-2 -left-1">
          <span className="text-7xl font-black leading-none" style={{ WebkitTextStroke: '2px rgba(81, 109, 116, 0.5)', color: 'transparent', textShadow: '0 2px 20px rgba(14, 33, 31, 0.15)' }}>
            {String(rank ?? 0).padStart(2, '0')}
          </span>
        </div>
        <div className="absolute top-2 right-2">
          <StatusBadge status={manga.status} />
        </div>
      </div>
      <div className="p-3 flex flex-col gap-1 flex-1 bg-white">
        <h3 className="font-bold text-sm text-black-feather line-clamp-2 leading-tight group-hover:text-delta-green transition-colors">{manga.title}</h3>
        <p className="text-[11px] text-sidewalk-grey">{manga.author}</p>
        <div className="flex items-center gap-2 mt-auto pt-1">
          <div className="flex items-center gap-1">
            <Star size={10} className="fill-delta-green text-delta-green" />
            <span className="text-[11px] text-delta-green font-semibold">{manga.rating.toFixed(1)}</span>
          </div>
          <span className="text-[10px] text-sidewalk-grey">{manga.views} views</span>
        </div>
      </div>
    </div>
  );
}
