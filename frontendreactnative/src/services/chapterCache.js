import { storage } from '../storage/mmkv';
import { CHAPTER_CACHE_KEY_PREFIX } from '../utils/constants';

const CHAPTER_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const LIST_TTL_MS = 24 * 60 * 60 * 1000; // 1 day

function chapterKey(seriesSlug, chapterNumber) {
  return `${CHAPTER_CACHE_KEY_PREFIX}${seriesSlug}:${chapterNumber}`;
}

function chaptersListKey(seriesSlug) {
  return `${CHAPTER_CACHE_KEY_PREFIX}list:${seriesSlug}`;
}

function isFresh(entry, ttl) {
  if (!entry?.data || !entry?.timestamp) return false;
  return Date.now() - entry.timestamp < ttl;
}

function readEntry(key) {
  const raw = storage.getString(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeEntry(key, data) {
  storage.set(key, JSON.stringify({ data, timestamp: Date.now() }));
}

/**
 * Cached chapter payload (`{ data: chapter }`) for offline / faster reopen.
 * MMKV is synchronous under the hood — these stay `async` so existing
 * `await`-based call sites are unaffected.
 */
export async function getCachedChapter(seriesSlug, chapterNumber) {
  if (!seriesSlug || chapterNumber == null) return null;
  const entry = readEntry(chapterKey(seriesSlug, chapterNumber));
  if (!isFresh(entry, CHAPTER_TTL_MS)) return null;
  return entry.data;
}

export async function setCachedChapter(seriesSlug, chapterNumber, payload) {
  if (!seriesSlug || chapterNumber == null || !payload) return;
  writeEntry(chapterKey(seriesSlug, chapterNumber), payload);
}

export async function getCachedChaptersList(seriesSlug) {
  if (!seriesSlug) return null;
  const entry = readEntry(chaptersListKey(seriesSlug));
  if (!isFresh(entry, LIST_TTL_MS)) return null;
  return entry.data;
}

export async function setCachedChaptersList(seriesSlug, payload) {
  if (!seriesSlug || !payload) return;
  writeEntry(chaptersListKey(seriesSlug), payload);
}
