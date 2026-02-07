/**
 * Convert API series object to the manga shape expected by the 20 design card components.
 * API rating is 1–10; we expose rating 1–5 for display.
 */
function normalizeRating(raw) {
  const num = raw != null ? Number(raw) : NaN;
  if (Number.isNaN(num) || num <= 0) return 0;
  if (num <= 5) return Math.min(5, num);
  return Math.min(5, num / 2);
}

export function seriesToManga(series, index = 0) {
  const rawRating = series.average_rating ?? series.rating;
  const rating = normalizeRating(rawRating);
  const ratingCount = series.rating_count ?? 0;
  const authorText = series.authors?.length
    ? series.authors.map((a) => (typeof a === 'object' ? a.name : a)).join(', ')
    : series.author || '';
  const genre = series.categories?.[0]?.name || series.manga_type?.name || 'Manga';
  const tags = series.tags?.map((t) => (typeof t === 'object' ? t.name : t)) || (genre ? [genre] : []);
  const lastCh = series.last_two_chapters ?? series.latest_chapters;
  const latestChapter = Array.isArray(lastCh) && lastCh.length > 0
    ? `Ch. ${lastCh[0].chapter_number ?? lastCh[0].number ?? lastCh[0].id ?? ''}`
    : series.total_chapters != null ? `Ch. ${series.total_chapters}` : '';
  const chapters = series.total_chapters ?? (Array.isArray(lastCh) ? (lastCh[0]?.chapter_number ?? 0) : 0);
  const statusMap = { ongoing: 'Ongoing', completed: 'Completed', hiatus: 'Hiatus', cancelled: 'Completed' };
  const status = statusMap[String(series.status || '').toLowerCase()] || 'Ongoing';
  const views = series.total_views != null
    ? (series.total_views >= 1e6 ? `${(series.total_views / 1e6).toFixed(1)}M` : series.total_views >= 1e3 ? `${(series.total_views / 1e3).toFixed(1)}K` : String(series.total_views))
    : '0';
  const updatedAt = series.updated_at
    ? (typeof series.updated_at === 'string' ? series.updated_at : series.updated_at?.diff ? 'Recently' : 'Recently')
    : 'Recently';

  return {
    id: series.id,
    title: series.title,
    slug: series.slug,
    author: authorText,
    artist: null,
    rating: Math.round(rating * 10) / 10,
    ratingCount,
    genre,
    status,
    chapters: Number(chapters) || 0,
    latestChapter,
    description: series.description || '',
    coverUrl: series.cover_url || series.thumbnail_url || '/placeholder.jpg',
    views,
    updatedAt,
    tags,
  };
}
