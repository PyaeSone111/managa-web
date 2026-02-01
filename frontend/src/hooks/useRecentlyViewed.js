import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'manga-web-recently-viewed';
const MAX_ITEMS = 12;

function getStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, MAX_ITEMS) : [];
  } catch {
    return [];
  }
}

function setStored(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_ITEMS)));
  } catch {}
}

/**
 * Returns list of recently viewed series (from localStorage).
 * Each item: { slug, title, thumbnail_url }
 */
export function useRecentlyViewed() {
  const [items, setItems] = useState(getStored);

  useEffect(() => {
    setItems(getStored());
  }, []);

  useEffect(() => {
    const handler = () => setItems(getStored());
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const add = useCallback((series) => {
    if (!series?.slug) return;
    const entry = {
      slug: series.slug,
      title: series.title || 'Untitled',
      thumbnail_url: series.thumbnail_url || series.cover_url || null,
    };
    setItems((prev) => {
      const filtered = prev.filter((p) => p.slug !== entry.slug);
      const next = [entry, ...filtered].slice(0, MAX_ITEMS);
      setStored(next);
      return next;
    });
  }, []);

  return { items, add };
}

export function addRecentlyViewed(series) {
  if (!series?.slug) return;
  const entry = {
    slug: series.slug,
    title: series.title || 'Untitled',
    thumbnail_url: series.thumbnail_url || series.cover_url || null,
  };
  const prev = getStored();
  const filtered = prev.filter((p) => p.slug !== entry.slug);
  const next = [entry, ...filtered].slice(0, MAX_ITEMS);
  setStored(next);
}
