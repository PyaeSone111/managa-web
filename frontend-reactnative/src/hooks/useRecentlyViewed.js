import { useState, useEffect, useCallback } from 'react';
import { RECENTLY_VIEWED_KEY } from '../utils/constants';
import { getJson, setJson } from '../services/storage';

const MAX_ITEMS = 12;

async function getStored() {
  const parsed = await getJson(RECENTLY_VIEWED_KEY, []);
  return Array.isArray(parsed) ? parsed.slice(0, MAX_ITEMS) : [];
}

async function setStored(items) {
  await setJson(RECENTLY_VIEWED_KEY, items.slice(0, MAX_ITEMS));
}

export function useRecentlyViewed() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    getStored().then(setItems);
  }, []);

  const add = useCallback(async (series) => {
    if (!series?.slug) return;
    const entry = {
      slug: series.slug,
      title: series.title || 'Untitled',
      thumbnail_url: series.thumbnail_url || series.cover_url || null,
    };
    const prev = await getStored();
    const filtered = prev.filter((p) => p.slug !== entry.slug);
    const next = [entry, ...filtered].slice(0, MAX_ITEMS);
    await setStored(next);
    setItems(next);
  }, []);

  return { items, add };
}

export async function addRecentlyViewed(series) {
  if (!series?.slug) return;
  const entry = {
    slug: series.slug,
    title: series.title || 'Untitled',
    thumbnail_url: series.thumbnail_url || series.cover_url || null,
  };
  const prev = await getStored();
  const filtered = prev.filter((p) => p.slug !== entry.slug);
  const next = [entry, ...filtered].slice(0, MAX_ITEMS);
  await setStored(next);
}
