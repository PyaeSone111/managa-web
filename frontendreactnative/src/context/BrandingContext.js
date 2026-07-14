import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { brandingApi } from '../services/api';
import { API_BASE_URL, BRANDING_CACHE_KEY, APP_DOWNLOAD_PAGE_URL } from '../utils/constants';
import { getJson, removeItem, setJson } from '../services/storage';

const API_ORIGIN = API_BASE_URL.replace(/\/api\/v1\/?$/, '');
const BRANDING_CACHE_TTL = 30 * 60 * 1000;
const BRANDING_QUERY_KEY = ['branding'];

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

const DEFAULT_APP_DOWNLOAD = {
  url: APP_DOWNLOAD_PAGE_URL,
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
  layoutVersion: '0',
  revision: 0,
  isLoading: false,
  isFetching: false,
  brandingReady: false,
  updateBranding: () => {},
  refetchBranding: async () => {},
});

function buildBrandingValue(branding, revision) {
  const cardLayout = { ...DEFAULT_CARD_LAYOUT, ...(branding.card_layout || {}) };
  const gridColumns = branding.grid_columns || null;
  return {
    logoUrl: toAbsoluteUrl(branding.logo_url) ?? null,
    heroBackgroundUrl: toAbsoluteUrl(branding.hero_background_url) ?? null,
    heroImageUrl: toAbsoluteUrl(branding.hero_image_url) ?? null,
    appDownload: {
      url: APP_DOWNLOAD_PAGE_URL,
      fileName: branding.app_download_filename || DEFAULT_APP_DOWNLOAD.fileName,
      version: branding.app_version || DEFAULT_APP_DOWNLOAD.version,
      sizeMB: branding.app_size_mb || DEFAULT_APP_DOWNLOAD.sizeMB,
    },
    cardLayout,
    gridColumns,
    layoutVersion: `${revision}:${JSON.stringify(cardLayout)}:${JSON.stringify(gridColumns)}`,
    revision,
  };
}

export function BrandingProvider({ children }) {
  const queryClient = useQueryClient();
  const [ready, setReady] = useState(false);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const cached = await getLocalCache();
      if (cached && mounted) {
        queryClient.setQueryData(BRANDING_QUERY_KEY, { data: cached });
      }
      if (mounted) setReady(true);
    })();
    return () => {
      mounted = false;
    };
  }, [queryClient]);

  const { data, isLoading, isFetching, isFetched, dataUpdatedAt } = useQuery({
    queryKey: BRANDING_QUERY_KEY,
    queryFn: () => brandingApi.getBranding(),
    staleTime: 0,
    gcTime: 60 * 60 * 1000,
    retry: 2,
    enabled: ready,
  });

  useEffect(() => {
    if (data?.data) {
      setJson(BRANDING_CACHE_KEY, { data: data.data, timestamp: Date.now() });
    }
  }, [data]);

  const updateBranding = useCallback(
    (newBranding) => {
      if (!newBranding) return;
      queryClient.setQueryData(BRANDING_QUERY_KEY, { data: newBranding });
      setJson(BRANDING_CACHE_KEY, { data: newBranding, timestamp: Date.now() });
      setRevision((n) => n + 1);
    },
    [queryClient]
  );

  const refetchBranding = useCallback(async () => {
    await removeItem(BRANDING_CACHE_KEY);
    const result = await queryClient.fetchQuery({
      queryKey: BRANDING_QUERY_KEY,
      queryFn: () => brandingApi.getBranding({ _refresh: Date.now() }),
      staleTime: 0,
    });
    if (result?.data) {
      queryClient.setQueryData(BRANDING_QUERY_KEY, result);
      await setJson(BRANDING_CACHE_KEY, { data: result.data, timestamp: Date.now() });
    }
    setRevision((n) => n + 1);
    return result;
  }, [queryClient]);

  const value = useMemo(() => {
    const branding = data?.data ?? {};
    const brandingReady = ready && isFetched && !isFetching;
    return {
      ...buildBrandingValue(branding, revision),
      isLoading: !ready || isLoading,
      isFetching,
      brandingReady,
      updateBranding,
      refetchBranding,
    };
  }, [data, dataUpdatedAt, revision, ready, isLoading, isFetching, isFetched, updateBranding, refetchBranding]);

  return <BrandingContext.Provider value={value}>{children}</BrandingContext.Provider>;
}

export function useBranding() {
  return useContext(BrandingContext);
}
