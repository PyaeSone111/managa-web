import { createContext, useContext, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { brandingApi } from '../services/api';
import { API_BASE_URL, BRANDING_CACHE_KEY } from '../utils/constants';
import { getJson, setJson } from '../services/storage';

const API_ORIGIN = API_BASE_URL.replace(/\/api\/v1\/?$/, '');
const BRANDING_CACHE_TTL = 30 * 60 * 1000;

function toAbsoluteUrl(url) {
  if (!url || typeof url !== 'string') return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${API_ORIGIN}${url.startsWith('/') ? '' : '/'}${url}`;
}

async function getLocalCache() {
  const cached = await getJson(BRANDING_CACHE_KEY);
  if (!cached?.data || !cached?.timestamp) return null;
  if (Date.now() - cached.timestamp > BRANDING_CACHE_TTL) return null;
  return cached.data;
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
  const [initialData, setInitialData] = useState(null);
  const [overrideBranding, setOverrideBranding] = useState(null);

  useEffect(() => {
    getLocalCache().then(setInitialData);
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ['branding'],
    queryFn: () => brandingApi.getBranding(),
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: 2,
    initialData: initialData ? { data: initialData } : undefined,
  });

  useEffect(() => {
    if (data?.data) {
      setJson(BRANDING_CACHE_KEY, { data: data.data, timestamp: Date.now() });
    }
  }, [data]);

  const branding = overrideBranding ?? data?.data ?? initialData ?? {};

  const updateBranding = (newBranding) => {
    if (newBranding) {
      setOverrideBranding(newBranding);
      setJson(BRANDING_CACHE_KEY, { data: newBranding, timestamp: Date.now() });
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

  return <BrandingContext.Provider value={value}>{children}</BrandingContext.Provider>;
}

export function useBranding() {
  return useContext(BrandingContext);
}
