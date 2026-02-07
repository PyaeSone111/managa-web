import { useNavigate } from 'react-router-dom';
import { Rating, Star } from '@smastrom/react-rating';
import { Pencil, Trash2, MoreVertical, Eye, BookOpen } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

/**
 * Normalize API rating to 1-5 scale for display.
 */
function normalizeRating(raw) {
  const num = raw != null ? Number(raw) : NaN;
  if (Number.isNaN(num) || num <= 0) return 0;
  if (num <= 5) return Math.min(5, num);
  return Math.min(5, num / 2);
}

const ratingStyle = {
  itemShapes: Star,
  activeFillColor: '#516D74',
  inactiveFillColor: '#C9D0D9',
  inactiveStrokeColor: '#9EB3BC',
  itemStrokeWidth: 1.5,
};

function StatusBadge({ status }) {
  const s = String(status || '').toLowerCase();
  const label = s.charAt(0).toUpperCase() + s.slice(1) || 'Ongoing';

  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#2e4b4e] text-white border border-[#2e4b4e]">
      {label}
    </span>
  );
}

function AdminMenu({ series, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="p-1.5 rounded-lg bg-white/90 shadow-sm border border-quarzo hover:bg-quarzo/40 transition-colors"
        aria-label="Admin actions"
      >
        <MoreVertical size={14} className="text-delta-green" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-lg border border-quarzo z-50 py-1">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit?.(series); setOpen(false); }}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-black-feather hover:bg-quarzo/30 transition-colors"
          >
            <Pencil size={13} /> Edit
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete?.(series); setOpen(false); }}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={13} /> Delete
          </button>
        </div>
      )}
    </div>
  );
}

function SeriesCard({ series, layout = 'vertical', onEdit, onDelete }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.is_admin;

  const rawRating = series.average_rating ?? series.rating;
  const rating = normalizeRating(rawRating);
  const ratingCount = series.rating_count ?? 0;

  const authorText = series.authors?.length
    ? series.authors.map((a) => (typeof a === 'object' ? a.name : a)).join(', ')
    : series.author || 'Unknown Author';

  const categoryName = series.categories?.[0]?.name || series.manga_type?.name || 'Manga';
  const imageUrl = series.cover_url || series.thumbnail_url || '/placeholder.svg?height=400&width=280';

  const statusRaw = series.status || 'ongoing';
  const statusMap = { ongoing: 'Ongoing', completed: 'Completed', hiatus: 'Hiatus', cancelled: 'Completed' };
  const status = statusMap[String(statusRaw).toLowerCase()] || 'Ongoing';

  const totalChapters = series.total_chapters ?? 0;
  const totalViews = series.total_views ?? 0;
  const viewsFormatted = totalViews >= 1e6 ? `${(totalViews / 1e6).toFixed(1)}M`
    : totalViews >= 1e3 ? `${(totalViews / 1e3).toFixed(1)}K`
    : String(totalViews);

  const formatChNum = (n) => {
    const num = Number(n);
    if (Number.isNaN(num)) return String(n);
    return num % 1 === 0 ? String(Math.round(num)) : String(num);
  };
  const lastTwoChapters = series.last_two_chapters ?? series.latest_chapters;
  const chaptersLabel = Array.isArray(lastTwoChapters) && lastTwoChapters.length > 0
    ? lastTwoChapters
        .slice(0, 2)
        .map((ch) => (typeof ch === 'object' ? `Chapter - ${formatChNum(ch.chapter_number ?? ch.number ?? ch.id)}` : ch))
        .join(', ')
    : totalChapters > 0 ? `Chapter - ${formatChNum(totalChapters)}` : null;

  const handleClick = (e) => {
    if (e.target.closest('button') || e.target.closest('[role="menu"]')) return;
    if (series?.slug) navigate(`/series/${series.slug}`);
  };

  /* --- Vertical (Portrait) Card --- */
  if (layout === 'vertical') {
    return (
      <div
        onClick={handleClick}
        className="group cursor-pointer bg-white rounded-xl border border-quarzo hover:border-ruskin-blue/40 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col h-full"
      >
        {/* Cover image */}
        <div className="relative w-full aspect-[2/3] flex-shrink-0 bg-quarzo/30 overflow-hidden">
          <img
            src={imageUrl}
            alt={series.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            decoding="async"
          />
          {/* Top badges row */}
          <div className="absolute top-2 left-2 right-2 flex items-start justify-between">
            <StatusBadge status={status} />
            {isAdmin && <AdminMenu series={series} onEdit={onEdit} onDelete={onDelete} />}
          </div>
          {/* Bottom rating bar */}
          <div className="absolute bottom-2 left-2 right-2 z-10 flex items-center justify-between gap-1.5 rounded-lg bg-white/95 backdrop-blur px-2 py-1.5 shadow-sm border border-quarzo">
            <Rating
              value={rating}
              readOnly
              items={5}
              itemStyles={ratingStyle}
              spaceBetween="none"
              spaceInside="none"
              className="max-w-[80px] sm:max-w-[90px]"
              style={{ maxWidth: '90px' }}
            />
            {ratingCount > 0 && (
              <span className="text-[10px] text-sidewalk-grey whitespace-nowrap">
                {ratingCount}
              </span>
            )}
          </div>
        </div>

        {/* Card body */}
        <div className="p-3 flex flex-col flex-1 gap-1">
          <h3 className="font-semibold text-sm text-black-feather line-clamp-2 leading-tight group-hover:text-ruskin-blue transition-colors">
            {series.title}
          </h3>
          <p className="text-xs text-sidewalk-grey line-clamp-1">{authorText}</p>
          <span className="inline-block w-fit mt-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-ruskin-blue/10 text-ruskin-blue border border-ruskin-blue/20">
            {categoryName}
          </span>
          {chaptersLabel && (
            <p className="text-xs text-sidewalk-grey mt-auto pt-1 line-clamp-1">{chaptersLabel}</p>
          )}
        </div>
      </div>
    );
  }

  /* --- Horizontal (Landscape) Card --- */
  return (
    <div
      onClick={handleClick}
      className="group flex cursor-pointer bg-white rounded-xl border border-quarzo hover:border-ruskin-blue/40 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden h-full min-h-[140px]"
    >
      {/* Thumbnail */}
      <div className="relative flex-shrink-0 w-24 sm:w-28 overflow-hidden bg-quarzo/30">
        <img
          src={imageUrl}
          alt={series.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          decoding="async"
        />
        {/* Rating overlay at bottom of thumbnail */}
        <div className="absolute bottom-1.5 left-1.5 right-1.5 z-10 flex items-center gap-1 rounded-md bg-white/95 backdrop-blur px-1.5 py-1 shadow-sm border border-quarzo">
          <Rating
            value={rating}
            readOnly
            items={5}
            itemStyles={ratingStyle}
            spaceBetween="none"
            spaceInside="none"
            className="max-w-[68px]"
            style={{ maxWidth: '68px' }}
          />
          <span className="text-[9px] text-sidewalk-grey">{Number(rating).toFixed(1)}</span>
        </div>
      </div>

      {/* Info panel */}
      <div className="flex-1 min-w-0 flex flex-col justify-between p-3">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-sm text-black-feather line-clamp-2 leading-tight group-hover:text-ruskin-blue transition-colors flex-1">
              {series.title}
            </h3>
            <div className="flex items-center gap-1 flex-shrink-0">
              <StatusBadge status={status} />
              {isAdmin && <AdminMenu series={series} onEdit={onEdit} onDelete={onDelete} />}
            </div>
          </div>
          <p className="text-xs text-sidewalk-grey mt-0.5 line-clamp-1">{authorText}</p>
          {series.description && (
            <p className="text-[11px] text-sidewalk-grey/80 line-clamp-2 mt-1">{series.description}</p>
          )}
        </div>
        <div className="flex items-center gap-3 mt-2 flex-wrap">
          <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-medium bg-ruskin-blue/10 text-ruskin-blue border border-ruskin-blue/20">
            {categoryName}
          </span>
          {totalChapters > 0 && (
            <span className="flex items-center gap-1 text-[10px] text-sidewalk-grey">
              <BookOpen size={10} /> {totalChapters} Ch.
            </span>
          )}
          {totalViews > 0 && (
            <span className="flex items-center gap-1 text-[10px] text-sidewalk-grey">
              <Eye size={10} /> {viewsFormatted}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default SeriesCard;
