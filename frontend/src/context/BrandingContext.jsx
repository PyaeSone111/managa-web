import { createContext, useContext, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { brandingApi } from '../services/api';

const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1').replace(/\/api\/v1\/?$/, '');
const BRANDING_CACHE_KEY = 'branding_cache';
const BRANDING_CACHE_TTL = 30 * 60 * 1000; // 30 minutes in localStorage

function toAbsoluteUrl(url) {
  if (!url || typeof url !== 'string') return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${API_ORIGIN}${url.startsWith('/') ? '' : '/'}${url}`;
}

function getLocalStorageCache() {
  try {
    const cached = localStorage.getItem(BRANDING_CACHE_KEY);
    if (!cached) return null;
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > BRANDING_CACHE_TTL) {
      localStorage.removeItem(BRANDING_CACHE_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function setLocalStorageCache(data) {
  try {
    localStorage.setItem(BRANDING_CACHE_KEY, JSON.stringify({
      data,
      timestamp: Date.now(),
    }));
  } catch {
    // Ignore localStorage errors
  }
}

const DEFAULT_CARD_LAYOUT = {
  home_latest: 'card_01',
  home_popular: 'card_11',
  home_weekly_highlights: 'card_03',
  home_recently_added: 'card_13',
  browse: 'card_11',
  rankings_top: 'card_15',
  rankings_most_read: 'card_15',
  rankings_trending: 'card_20',
  recently_viewed: 'card_04',
  favorites: 'card_11',
};

const BrandingContext = createContext({
  logoUrl: null,
  heroBackgroundUrl: null,
  heroImageUrl: null,
  cardLayout: DEFAULT_CARD_LAYOUT,
  gridColumns: null,
  isLoading: false,
  updateBranding: () => {},
});

export function BrandingProvider({ children }) {
  // Initialize from localStorage cache for instant load
  const [initialData] = useState(() => getLocalStorageCache());

  const { data, isLoading } = useQuery({
    queryKey: ['branding'],
    queryFn: () => brandingApi.getBranding(),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    retry: 2,
    initialData: initialData ? { data: initialData } : undefined,
  });

  // Update localStorage when data changes
  useEffect(() => {
    if (data?.data) {
      setLocalStorageCache(data.data);
    }
  }, [data]);

  const branding = data?.data ?? initialData ?? {};

  // Allow updating branding from dashboard response
  const updateBranding = (newBranding) => {
    if (newBranding) {
      setLocalStorageCache(newBranding);
    }
  };

  const value = {
    logoUrl: toAbsoluteUrl(branding.logo_url) ?? null,
    heroBackgroundUrl: toAbsoluteUrl(branding.hero_background_url) ?? null,
    heroImageUrl: toAbsoluteUrl(branding.hero_image_url) ?? null,
    cardLayout: { ...DEFAULT_CARD_LAYOUT, ...(branding.card_layout || {}) },
    gridColumns: branding.grid_columns || null,
    isLoading: isLoading && !initialData,
    updateBranding,
  };

  return (
    <BrandingContext.Provider value={value}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  return useContext(BrandingContext);
}
