import { toAbsoluteImageUrl } from '../utils/helpers';
import { getSeriesAuthorLabel, getSeriesTypeLabel } from './seriesDisplay';

/**
 * Convert API series object to the shape expected by manga-card-design components.
 * @param {Object} series - Series from API (series list, rankings, etc.)
 * @returns {Object} manga - { title, author, coverUrl, status, rating, genre, chapters, views, description, tags, latestChapter, updatedAt, ratingCount, artist }
 */
export function seriesToManga(series) {
  if (!series) return null;
  const rawRating = series.average_rating ?? series.rating;
  const num = rawRating != null ? Number(rawRating) : NaN;
  const rating = (Number.isNaN(num) || num <= 0) ? 0 : num <= 5 ? Math.min(5, num) : Math.min(5, num / 2);
  const ratingCount = series.rating_count ?? 0;
  const authorText = getSeriesAuthorLabel(series);
  const categoryName = getSeriesTypeLabel(series);
  const statusRaw = String(series.status || 'ongoing').toLowerCase();
  const statusMap = { ongoing: 'Ongoing', completed: 'Completed', hiatus: 'Hiatus', cancelled: 'Completed', dropped: 'Completed' };
  const status = statusMap[statusRaw] || 'Ongoing';
  const totalChapters = Math.round(Number(series.total_chapters) || 0);
  const totalViews = series.total_views ?? 0;
  const viewsFormatted = totalViews >= 1e6 ? `${(totalViews / 1e6).toFixed(1)}M`
    : totalViews >= 1e3 ? `${(totalViews / 1e3).toFixed(1)}K`
    : String(totalViews);
  const lastChapters = series.last_two_chapters ?? series.latest_chapters;
  const formatChNum = (n) => {
    const num = Number(n);
    if (Number.isNaN(num)) return String(n);
    return num % 1 === 0 ? String(Math.round(num)) : String(num);
  };
  const latestChapter = Array.isArray(lastChapters) && lastChapters.length > 0
    ? (() => {
        const ch = lastChapters[0];
        const n = typeof ch === 'object' ? (ch.chapter_number ?? ch.number ?? ch.id) : ch;
        return `Chapter - ${formatChNum(n)}`;
      })()
    : totalChapters > 0 ? `Chapter - ${formatChNum(totalChapters)}` : '—';
  const tags = series.categories?.map((c) => (typeof c === 'object' ? c.name : c)) || [categoryName];
  const updatedAt = series.updated_at
    ? (typeof series.updated_at === 'string' && series.updated_at.match(/^\d{4}-\d{2}-\d{2}/)
        ? formatRelativeDate(series.updated_at)
        : series.updated_at)
    : '—';
  // Prefer cover (full) image for display; thumbnail as fallback. Resolve relative URLs to API origin to avoid ERR_CONNECTION_REFUSED (e.g. when API returns /storage/... and frontend is on different origin).
  const rawCover = series.cover_url || series.thumbnail_url || '/placeholder.svg?height=400&width=280';
  const coverUrl = toAbsoluteImageUrl(rawCover) || rawCover;
  const coverImageUrl = toAbsoluteImageUrl(series.cover_url || series.thumbnail_url) || coverUrl;

  return {
    id: series.id,
    slug: series.slug,
    title: series.title || 'Untitled',
    author: authorText,
    artist: series.artists?.[0]?.name || null,
    coverUrl,
    coverImageUrl,
    status,
    rating: Number(rating.toFixed(1)),
    ratingCount,
    genre: categoryName,
    chapters: totalChapters,
    latestChapter,
    description: series.description || '',
    views: viewsFormatted,
    updatedAt,
    tags,
  };
}

function formatRelativeDate(iso) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}
