const CHAPTER_CACHE_KEY_PREFIX = 'chapter_cache:';
const CHAPTER_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const LIST_TTL_MS = 24 * 60 * 60 * 1000; // 1 day

function chapterKey(seriesSlug, chapterNumber) {
  return `${CHAPTER_CACHE_KEY_PREFIX}${seriesSlug}:${chapterNumber}`;
}

function chaptersListKey(seriesSlug) {
  return `${CHAPTER_CACHE_KEY_PREFIX}list:${seriesSlug}`;
}

function readEntry(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeEntry(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {
    // localStorage full or unavailable (private mode) — skip caching silently.
  }
}

function isFresh(entry, ttl) {
  if (!entry?.data || !entry?.timestamp) return false;
  return Date.now() - entry.timestamp < ttl;
}

/** Cached chapter payload (`{ data: chapter }`) so re-reading a chapter skips the API entirely. */
export function getCachedChapter(seriesSlug, chapterNumber) {
  if (!seriesSlug || chapterNumber == null) return null;
  const entry = readEntry(chapterKey(seriesSlug, chapterNumber));
  return isFresh(entry, CHAPTER_TTL_MS) ? entry.data : null;
}

export function setCachedChapter(seriesSlug, chapterNumber, payload) {
  if (!seriesSlug || chapterNumber == null || !payload) return;
  writeEntry(chapterKey(seriesSlug, chapterNumber), payload);
}

export function getCachedChaptersList(seriesSlug) {
  if (!seriesSlug) return null;
  const entry = readEntry(chaptersListKey(seriesSlug));
  return isFresh(entry, LIST_TTL_MS) ? entry.data : null;
}

export function setCachedChaptersList(seriesSlug, payload) {
  if (!seriesSlug || !payload) return;
  writeEntry(chaptersListKey(seriesSlug), payload);
}
