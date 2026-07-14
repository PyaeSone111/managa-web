import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { brandingApi } from '../services/api';

const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || 'https://manga-apis.fatelight.org/api/v1').replace(/\/api\/v1\/?$/, '');
const BRANDING_CACHE_KEY = 'branding_cache';
const BRANDING_QUERY_KEY = ['branding'];

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
    if (Date.now() - timestamp > 30 * 60 * 1000) {
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

const DEFAULT_APP_DOWNLOAD = {
  url: 'https://myangar.fatelight.org/download',
  fileName: 'myangarread00121v01.apk',
  version: '1.0',
  sizeMB: '29',
};

const BrandingContext = createContext({
  logoUrl: null,
  heroBackgroundUrl: null,
  heroImageUrl: null,
  appDownload: DEFAULT_APP_DOWNLOAD,
  cardLayout: DEFAULT_CARD_LAYOUT,
  gridColumns: null,
  isLoading: false,
  isFetching: false,
  brandingReady: false,
  updateBranding: () => {},
  refetchBranding: async () => {},
});

function buildBrandingValue(branding) {
  return {
    logoUrl: toAbsoluteUrl(branding.logo_url) ?? null,
    heroBackgroundUrl: toAbsoluteUrl(branding.hero_background_url) ?? null,
    heroImageUrl: toAbsoluteUrl(branding.hero_image_url) ?? null,
    appDownload: {
      url: branding.app_download_url || DEFAULT_APP_DOWNLOAD.url,
      fileName: branding.app_download_filename || DEFAULT_APP_DOWNLOAD.fileName,
      version: branding.app_version || DEFAULT_APP_DOWNLOAD.version,
      sizeMB: branding.app_size_mb || DEFAULT_APP_DOWNLOAD.sizeMB,
    },
    cardLayout: { ...DEFAULT_CARD_LAYOUT, ...(branding.card_layout || {}) },
    gridColumns: branding.grid_columns || null,
  };
}

export function BrandingProvider({ children }) {
  const queryClient = useQueryClient();
  const [cachedBranding] = useState(() => getLocalStorageCache());

  const { data, isLoading, isFetching, isFetched, refetch } = useQuery({
    queryKey: BRANDING_QUERY_KEY,
    queryFn: () => brandingApi.getBranding(),
    staleTime: 0,
    gcTime: 60 * 60 * 1000,
    retry: 2,
    placeholderData: cachedBranding ? { data: cachedBranding } : undefined,
  });

  useEffect(() => {
    if (data?.data) {
      setLocalStorageCache(data.data);
    }
  }, [data]);

  const updateBranding = useCallback(
    (newBranding) => {
      if (!newBranding) return;
      queryClient.setQueryData(BRANDING_QUERY_KEY, { data: newBranding });
      setLocalStorageCache(newBranding);
    },
    [queryClient],
  );

  const refetchBranding = useCallback(async () => {
    const result = await refetch();
    if (result.data?.data) {
      setLocalStorageCache(result.data.data);
    }
    return result;
  }, [refetch]);

  const value = useMemo(() => {
    const branding = data?.data ?? {};
    return {
      ...buildBrandingValue(branding),
      isLoading,
      isFetching,
      brandingReady: isFetched && !isFetching,
      updateBranding,
      refetchBranding,
    };
  }, [data, isLoading, isFetching, isFetched, updateBranding, refetchBranding]);

  return (
    <BrandingContext.Provider value={value}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  return useContext(BrandingContext);
}
