import { useNavigate } from 'react-router-dom';
import { Rating, Star } from '@smastrom/react-rating';

/**
 * Normalize API rating to 1–5 scale for display.
 * Backend stores 1–10; some endpoints may return 1–5.
 */
function normalizeRating(raw) {
  const num = raw != null ? Number(raw) : NaN;
  if (Number.isNaN(num) || num <= 0) return 0;
  if (num <= 5) return Math.min(5, num);
  return Math.min(5, num / 2);
}

const ratingStyle = {
  itemShapes: Star,
  activeFillColor: 'var(--theme-primary)',
  inactiveFillColor: 'rgba(0,0,0,0.08)',
  inactiveStrokeColor: 'var(--theme-primary)',
  itemStrokeWidth: 1.5,
};

function SeriesCard({ series, layout = 'horizontal' }) {
  const navigate = useNavigate();
  const rawRating = series.average_rating ?? series.rating;
  const rating = normalizeRating(rawRating);
  const ratingCount = series.rating_count ?? 0;
  const authorText = series.authors?.length
    ? series.authors.map((a) => (typeof a === 'object' ? a.name : a)).join(', ')
    : series.author || null;
  const categoryName = series.categories?.[0]?.name || series.manga_type?.name || null;
  const imageUrl = series.cover_url || series.thumbnail_url || '/placeholder.jpg';

  const handleClick = (e) => {
    if (e.target.closest('a')) return;
    navigate(`/series/${series.slug}`);
  };

  const titleEl = (
    <h3 className="font-semibold text-sm text-[var(--theme-body-color)] line-clamp-2 group-hover:text-[var(--theme-primary)] transition-colors leading-tight">
      {series.title}
    </h3>
  );
  const authorEl = authorText && (
    <p className="text-xs text-[var(--theme-text-muted)] mt-0.5 line-clamp-1">{authorText}</p>
  );
  const categoryEl = categoryName && (
    <span className="inline-block w-fit mt-1.5 px-2 py-0.5 rounded-md text-[10px] font-medium bg-[var(--theme-primary)]/15 text-[var(--theme-primary)] border border-[var(--theme-primary)]/30">
      {categoryName}
    </span>
  );

  const lastTwoChapters = series.last_two_chapters ?? series.latest_chapters;
  const chaptersLabel = Array.isArray(lastTwoChapters) && lastTwoChapters.length > 0
    ? lastTwoChapters
        .slice(0, 2)
        .map((ch) => (typeof ch === 'object' ? `Ch.${ch.chapter_number ?? ch.number ?? ch.id}` : ch))
        .join(', ')
    : null;

  const starBadge = (
    <div
      className="absolute bottom-2 left-2 right-2 z-10 flex items-center justify-between gap-1.5 rounded-lg bg-white/95 backdrop-blur px-2 py-1.5 shadow border border-[var(--theme-card-border)]"
      aria-label={ratingCount ? `Rating: ${rating} out of 5 (${ratingCount} ratings)` : `Rating: ${rating} out of 5`}
    >
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
        <span className="text-[10px] text-[var(--theme-text-muted)] whitespace-nowrap">
          {ratingCount}
        </span>
      )}
    </div>
  );

  const imageWrapClass = 'absolute inset-0 w-full h-full overflow-hidden';
  const imageClass = 'w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300';

  if (layout === 'vertical') {
    return (
      <div
        onClick={handleClick}
        className="group cursor-pointer glass-card rounded-xl border border-[var(--theme-card-border)] hover:border-[var(--theme-primary)]/40 shadow hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col h-full"
      >
        <div className="relative w-full aspect-[2/3] flex-shrink-0 bg-[var(--theme-card-border)]/20 rounded-t-xl">
          <div className={imageWrapClass + ' rounded-t-xl'}>
            <img
              src={imageUrl}
              alt={series.title}
              className={imageClass + ' rounded-t-xl'}
              loading="lazy"
              decoding="async"
            />
          </div>
          {starBadge}
        </div>
        <div className="p-3 flex flex-col flex-1 min-h-0">
          <div className="min-h-[2.5rem]">{titleEl}</div>
          {authorEl}
          {categoryEl}
          {chaptersLabel && (
            <p className="text-xs text-[var(--theme-text-muted)] mt-1.5 line-clamp-1">{chaptersLabel}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      className="group flex cursor-pointer glass-card rounded-xl border border-[var(--theme-card-border)] hover:border-[var(--theme-primary)]/40 shadow hover:shadow-lg transition-all duration-300 overflow-hidden h-full min-h-[120px] sm:min-h-[132px]"
    >
      <div className="relative flex-shrink-0 w-24 sm:w-28 h-full min-h-[120px] sm:min-h-[132px] rounded-l-xl">
        <div className={imageWrapClass + ' rounded-l-xl bg-[var(--theme-card-border)]/20'}>
          <img
            src={imageUrl}
            alt={series.title}
            className={imageClass + ' rounded-l-xl'}
            loading="lazy"
            decoding="async"
          />
        </div>
        {starBadge}
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-between p-3 text-left">
        <div className="min-h-[2.5rem]">{titleEl}</div>
        {authorEl}
        {categoryEl}
        {chaptersLabel && (
          <p className="text-xs text-[var(--theme-text-muted)] mt-1 line-clamp-1">{chaptersLabel}</p>
        )}
      </div>
    </div>
  );
}

export default SeriesCard;
