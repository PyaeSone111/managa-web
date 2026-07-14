import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../services/api';
import Layout from '../../components/common/Layout';
import StatusModal from '../../components/common/StatusModal';

const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || 'https://manga-apis.fatelight.org/api/v1').replace(/\/api\/v1\/?$/, '');

const CARD_OPTIONS = [
  { value: 'card_01', label: '01 Classic Portrait' },
  { value: 'card_02', label: '02 Overlay Gradient' },
  { value: 'card_03', label: '03 Neon Glow' },
  { value: 'card_04', label: '04 Minimal Clean' },
  { value: 'card_05', label: '05 Badge Heavy' },
  { value: 'card_06', label: '06 Stats Focus' },
  { value: 'card_07', label: '07 Glassmorphism' },
  { value: 'card_08', label: '08 Bordered Accent' },
  { value: 'card_09', label: '09 Cinematic' },
  { value: 'card_10', label: '10 Rank Card' },
  { value: 'card_11', label: '11 Classic Landscape' },
  { value: 'card_12', label: '12 Wide Cinematic' },
  { value: 'card_13', label: '13 Glass Landscape' },
  { value: 'card_14', label: '14 Action CTA' },
  { value: 'card_15', label: '15 Compact Row' },
  { value: 'card_16', label: '16 Neon Landscape' },
  { value: 'card_17', label: '17 Info Dense' },
  { value: 'card_18', label: '18 Featured Banner' },
  { value: 'card_19', label: '19 Timeline' },
  { value: 'card_20', label: '20 Trending' },
];

const PORTRAIT_CARD_OPTIONS = CARD_OPTIONS.filter((opt) => {
  const n = Number(opt.value.replace('card_', ''));
  return n >= 1 && n <= 10;
});

const SECTION_LABELS = {
  home_hero: 'Home – Hero carousel (portrait)',
  home_latest: 'Home – Latest Release',
  home_popular: 'Home – Popular',
  home_weekly_highlights: 'Home – Weekly Highlights',
  home_recently_added: 'Home – Recently Added',
  browse: 'Browse (single view)',
  rankings_top: 'Rankings – Top Manga',
  rankings_most_read: 'Rankings – Most Read',
  rankings_trending: 'Rankings – Trending',
  recently_viewed: 'Recent / Recently Viewed',
  favorites: 'Favorites',
};

const DEFAULT_CARD_LAYOUT = {
  home_hero: 'card_01',
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

const GRID_SECTION_KEYS = [
  'home_latest', 'home_popular', 'home_weekly_highlights', 'home_recently_added',
  'browse', 'rankings_top', 'rankings_most_read', 'rankings_trending',
  'recently_viewed', 'favorites',
];

const GRID_SECTION_LABELS = {
  home_latest: 'Home – Latest Release',
  home_popular: 'Home – Popular',
  home_weekly_highlights: 'Home – Weekly Highlights',
  home_recently_added: 'Home – Recently Added',
  browse: 'Browse',
  rankings_top: 'Rankings – Top Manga',
  rankings_most_read: 'Rankings – Most Read',
  rankings_trending: 'Rankings – Trending',
  recently_viewed: 'Recent / Recently Viewed',
  favorites: 'Favorites',
};

const defaultColsVertical = { default: 2, sm: 3, md: 4, lg: 5, xl: 6 };
const defaultColsHorizontal = { default: 1, sm: 2, md: 3, lg: 4, xl: 5 };

const DEFAULT_GRID_COLUMNS = Object.fromEntries(
  GRID_SECTION_KEYS.map((key) => [
    key,
    ['home_latest', 'home_weekly_highlights', 'recently_viewed'].includes(key)
      ? defaultColsVertical
      : defaultColsHorizontal,
  ])
);

const BREAKPOINTS = [
  { key: 'default', label: 'Default (mobile)' },
  { key: 'sm', label: 'sm (640px+)' },
  { key: 'md', label: 'md (768px+)' },
  { key: 'lg', label: 'lg (1024px+)' },
  { key: 'xl', label: 'xl (1280px+)' },
];

function fullUrl(url) {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${API_ORIGIN}${url.startsWith('/') ? '' : '/'}${url}`;
}

const DEFAULT_APP_DOWNLOAD = {
  app_download_url: 'https://myangar.fatelight.org/download',
  app_download_filename: 'myangarread00121v01.apk',
  app_version: '1.0',
  app_size_mb: '29',
};

function Branding() {
  const queryClient = useQueryClient();
  const [logoUrl, setLogoUrl] = useState('');
  const [heroBackgroundUrl, setHeroBackgroundUrl] = useState('');
  const [heroImageUrl, setHeroImageUrl] = useState('');
  const [appDownloadUrl, setAppDownloadUrl] = useState(DEFAULT_APP_DOWNLOAD.app_download_url);
  const [appDownloadFilename, setAppDownloadFilename] = useState(DEFAULT_APP_DOWNLOAD.app_download_filename);
  const [appVersion, setAppVersion] = useState(DEFAULT_APP_DOWNLOAD.app_version);
  const [appSizeMb, setAppSizeMb] = useState(DEFAULT_APP_DOWNLOAD.app_size_mb);
  const [logoFile, setLogoFile] = useState(null);
  const [heroBackgroundFile, setHeroBackgroundFile] = useState(null);
  const [heroImageFile, setHeroImageFile] = useState(null);
  const [logoBlobUrl, setLogoBlobUrl] = useState(null);
  const [heroBgBlobUrl, setHeroBgBlobUrl] = useState(null);
  const [heroImgBlobUrl, setHeroImgBlobUrl] = useState(null);
  const [cardLayout, setCardLayout] = useState({ ...DEFAULT_CARD_LAYOUT });
  const [gridColumns, setGridColumns] = useState(() => JSON.parse(JSON.stringify(DEFAULT_GRID_COLUMNS)));
  const [heroSeries, setHeroSeries] = useState([]);
  const [heroSearch, setHeroSearch] = useState('');
  const [debouncedHeroSearch, setDebouncedHeroSearch] = useState('');
  const [statusModal, setStatusModal] = useState({
    open: false,
    type: 'success',
    title: '',
    message: '',
  });

  const closeStatusModal = useCallback(() => {
    setStatusModal((prev) => ({ ...prev, open: false }));
  }, []);

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'branding'],
    queryFn: () => adminApi.getBranding(),
  });

  useEffect(() => {
    const t = setTimeout(() => setDebouncedHeroSearch(heroSearch.trim()), 300);
    return () => clearTimeout(t);
  }, [heroSearch]);

  const { data: seriesSearchData, isFetching: searchingSeries } = useQuery({
    queryKey: ['admin', 'branding', 'series-search', debouncedHeroSearch],
    queryFn: () =>
      adminApi.getSeries({
        page: 1,
        per_page: 12,
        search: debouncedHeroSearch || undefined,
      }),
    enabled: debouncedHeroSearch.length >= 1,
  });

  const searchResults = useMemo(() => {
    const list = seriesSearchData?.data || [];
    const selectedIds = new Set(heroSeries.map((s) => Number(s.id)));
    return list.filter((s) => !selectedIds.has(Number(s.id)));
  }, [seriesSearchData, heroSeries]);

  useEffect(() => {
    if (data?.data) {
      setLogoUrl(data.data.logo_url || '');
      setHeroBackgroundUrl(data.data.hero_background_url || '');
      setHeroImageUrl(data.data.hero_image_url || '');
      setAppDownloadUrl(data.data.app_download_url || DEFAULT_APP_DOWNLOAD.app_download_url);
      setAppDownloadFilename(data.data.app_download_filename || DEFAULT_APP_DOWNLOAD.app_download_filename);
      setAppVersion(data.data.app_version || DEFAULT_APP_DOWNLOAD.app_version);
      setAppSizeMb(data.data.app_size_mb || DEFAULT_APP_DOWNLOAD.app_size_mb);
      if (data.data.card_layout && typeof data.data.card_layout === 'object') {
        setCardLayout({ ...DEFAULT_CARD_LAYOUT, ...data.data.card_layout });
      }
      if (data.data.grid_columns && typeof data.data.grid_columns === 'object') {
        const merged = {};
        GRID_SECTION_KEYS.forEach((key) => {
          merged[key] = { ...(DEFAULT_GRID_COLUMNS[key] || defaultColsHorizontal), ...(data.data.grid_columns[key] || {}) };
        });
        setGridColumns(merged);
      }
      setHeroSeries(Array.isArray(data.data.hero_series) ? data.data.hero_series : []);
    }
  }, [data]);

  useEffect(() => {
    if (logoFile) {
      const url = URL.createObjectURL(logoFile);
      setLogoBlobUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setLogoBlobUrl(null);
  }, [logoFile]);
  useEffect(() => {
    if (heroBackgroundFile) {
      const url = URL.createObjectURL(heroBackgroundFile);
      setHeroBgBlobUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setHeroBgBlobUrl(null);
  }, [heroBackgroundFile]);
  useEffect(() => {
    if (heroImageFile) {
      const url = URL.createObjectURL(heroImageFile);
      setHeroImgBlobUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setHeroImgBlobUrl(null);
  }, [heroImageFile]);

  const updateMutation = useMutation({
    mutationFn: (formData) => adminApi.updateBranding(formData),
    onSuccess: async (res) => {
      const payload = res?.data;
      if (payload) {
        queryClient.setQueryData(['admin', 'branding'], res);
        if (payload.card_layout && typeof payload.card_layout === 'object') {
          setCardLayout({ ...DEFAULT_CARD_LAYOUT, ...payload.card_layout });
        }
        if (payload.grid_columns && typeof payload.grid_columns === 'object') {
          const merged = {};
          GRID_SECTION_KEYS.forEach((key) => {
            merged[key] = {
              ...(DEFAULT_GRID_COLUMNS[key] || defaultColsHorizontal),
              ...(payload.grid_columns[key] || {}),
            };
          });
          setGridColumns(merged);
        }
        if (Array.isArray(payload.hero_series)) {
          setHeroSeries(payload.hero_series);
        }
      }
      await queryClient.invalidateQueries({ queryKey: ['admin', 'branding'] });
      setLogoFile(null);
      setHeroBackgroundFile(null);
      setHeroImageFile(null);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    if (logoFile) formData.append('logo', logoFile);
    else formData.append('logo_url', logoUrl);
    if (heroBackgroundFile) formData.append('hero_background', heroBackgroundFile);
    else formData.append('hero_background_url', heroBackgroundUrl);
    if (heroImageFile) formData.append('hero_image', heroImageFile);
    else formData.append('hero_image_url', heroImageUrl);
    formData.append('app_download_url', appDownloadUrl);
    formData.append('app_download_filename', appDownloadFilename);
    formData.append('app_version', appVersion);
    formData.append('app_size_mb', appSizeMb);
    formData.append('card_layout', JSON.stringify(cardLayout));
    formData.append('grid_columns', JSON.stringify(gridColumns));
    formData.append(
      'hero_series_ids',
      JSON.stringify(heroSeries.map((s) => Number(s.id)).filter(Boolean))
    );

    updateMutation.mutate(formData, {
      onSuccess: () =>
        setStatusModal({
          open: true,
          type: 'success',
          title: 'Branding updated',
          message: 'Changes saved. The app and website will pick them up on the next load or pull-to-refresh.',
        }),
      onError: (err) =>
        setStatusModal({
          open: true,
          type: 'error',
          title: 'Failed to update branding',
          message: err?.message || 'Unknown error. Please try again.',
        }),
    });
  };

  const setSectionCard = (sectionKey, value) => {
    setCardLayout((prev) => ({ ...prev, [sectionKey]: value }));
  };

  const setGridColumn = (sectionKey, breakpoint, value) => {
    const n = Math.min(6, Math.max(1, parseInt(value, 10) || 1));
    setGridColumns((prev) => ({
      ...prev,
      [sectionKey]: { ...(prev[sectionKey] || {}), [breakpoint]: n },
    }));
  };

  const addHeroSeries = (series) => {
    if (!series?.id) return;
    setHeroSeries((prev) => {
      if (prev.some((s) => Number(s.id) === Number(series.id))) return prev;
      if (prev.length >= 20) return prev;
      return [...prev, series];
    });
  };

  const removeHeroSeries = (id) => {
    setHeroSeries((prev) => prev.filter((s) => Number(s.id) !== Number(id)));
  };

  const moveHeroSeries = (index, direction) => {
    setHeroSeries((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      const tmp = next[index];
      next[index] = next[target];
      next[target] = tmp;
      return next;
    });
  };

  const logoPreview = logoBlobUrl || fullUrl(logoUrl);
  const heroBgPreview = heroBgBlobUrl || fullUrl(heroBackgroundUrl);
  const heroImgPreview = heroImgBlobUrl || fullUrl(heroImageUrl);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indiana-clay" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="bg-indiana-clay/20 border border-indiana-clay/30 rounded-lg p-4">
          <p className="text-indiana-clay">Error loading branding: {error.message}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-torrefacto-roast">Branding</h1>
          <p className="text-stone-lion mt-1">
            Update the main logo, hero section, carousel series, and card layouts shown on the frontend.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
          {/* Logo */}
          <div className="bg-bonaire rounded-lg border border-stone-lion/20 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-torrefacto-roast mb-4">Main logo</h2>
            <div className="flex flex-wrap items-start gap-6">
              {logoPreview && (
                <div className="flex-shrink-0">
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="h-16 object-contain border border-stone-lion/30 rounded-lg bg-white p-2"
                  />
                </div>
              )}
              <div className="flex-1 min-w-[200px] space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    setLogoFile(f || null);
                  }}
                  className="block w-full text-sm text-stone-lion file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indiana-clay file:text-white hover:file:bg-indiana-clay/90"
                />
                <input
                  type="text"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="Or enter image URL"
                  className="block w-full px-3 py-2 border border-stone-lion/30 rounded-lg bg-bonaire text-torrefacto-roast placeholder-stone-lion focus:ring-2 focus:ring-indiana-clay focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Hero background */}
          <div className="bg-bonaire rounded-lg border border-stone-lion/20 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-torrefacto-roast mb-4">Hero section background</h2>
            <div className="flex flex-wrap items-start gap-6">
              {heroBgPreview && (
                <div className="flex-shrink-0 w-48 h-28 rounded-lg overflow-hidden border border-stone-lion/30">
                  <img
                    src={heroBgPreview}
                    alt="Hero background preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1 min-w-[200px] space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    setHeroBackgroundFile(f || null);
                  }}
                  className="block w-full text-sm text-stone-lion file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indiana-clay file:text-white hover:file:bg-indiana-clay/90"
                />
                <input
                  type="text"
                  value={heroBackgroundUrl}
                  onChange={(e) => setHeroBackgroundUrl(e.target.value)}
                  placeholder="Or enter image URL"
                  className="block w-full px-3 py-2 border border-stone-lion/30 rounded-lg bg-bonaire text-torrefacto-roast placeholder-stone-lion focus:ring-2 focus:ring-indiana-clay focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Hero image */}
          <div className="bg-bonaire rounded-lg border border-stone-lion/20 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-torrefacto-roast mb-4">Hero section image</h2>
            <div className="flex flex-wrap items-start gap-6">
              {heroImgPreview && (
                <div className="flex-shrink-0 w-32 h-32 rounded-lg overflow-hidden border border-stone-lion/30">
                  <img
                    src={heroImgPreview}
                    alt="Hero image preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1 min-w-[200px] space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    setHeroImageFile(f || null);
                  }}
                  className="block w-full text-sm text-stone-lion file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indiana-clay file:text-white hover:file:bg-indiana-clay/90"
                />
                <input
                  type="text"
                  value={heroImageUrl}
                  onChange={(e) => setHeroImageUrl(e.target.value)}
                  placeholder="Or enter image URL"
                  className="block w-full px-3 py-2 border border-stone-lion/30 rounded-lg bg-bonaire text-torrefacto-roast placeholder-stone-lion focus:ring-2 focus:ring-indiana-clay focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Hero carousel series */}
          <div className="bg-bonaire rounded-lg border border-stone-lion/20 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-torrefacto-roast mb-2">
              Home hero carousel series
            </h2>
            <p className="text-sm text-stone-lion mb-4">
              Pick up to 20 series for the React Native home hero 3D carousel. Order here is the
              carousel order. Card style is set under Manga card layout → Home – Hero carousel.
            </p>

            <div className="space-y-3 mb-4">
              {heroSeries.length === 0 ? (
                <p className="text-sm text-stone-lion">No series selected yet.</p>
              ) : (
                heroSeries.map((series, index) => (
                  <div
                    key={series.id}
                    className="flex items-center gap-3 p-2 border border-stone-lion/20 rounded-lg bg-white/50"
                  >
                    <img
                      src={fullUrl(series.cover_url || series.thumbnail_url)}
                      alt=""
                      className="w-10 h-14 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-torrefacto-roast truncate">
                        {index + 1}. {series.title}
                      </p>
                      <p className="text-xs text-stone-lion truncate">{series.slug}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveHeroSeries(index, -1)}
                        disabled={index === 0}
                        className="px-2 py-1 text-xs rounded border border-stone-lion/30 disabled:opacity-40"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => moveHeroSeries(index, 1)}
                        disabled={index === heroSeries.length - 1}
                        className="px-2 py-1 text-xs rounded border border-stone-lion/30 disabled:opacity-40"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => removeHeroSeries(series.id)}
                        className="px-2 py-1 text-xs rounded bg-indiana-clay/10 text-indiana-clay"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <label className="block text-sm font-medium text-torrefacto-roast mb-1">
              Search series to add
            </label>
            <input
              type="search"
              value={heroSearch}
              onChange={(e) => setHeroSearch(e.target.value)}
              placeholder="Type a title…"
              className="block w-full px-3 py-2 border border-stone-lion/30 rounded-lg bg-bonaire text-torrefacto-roast placeholder-stone-lion focus:ring-2 focus:ring-indiana-clay focus:border-transparent"
            />
            {debouncedHeroSearch.length >= 1 && (
              <div className="mt-2 max-h-56 overflow-auto border border-stone-lion/20 rounded-lg divide-y divide-stone-lion/10">
                {searchingSeries ? (
                  <p className="p-3 text-sm text-stone-lion">Searching…</p>
                ) : searchResults.length === 0 ? (
                  <p className="p-3 text-sm text-stone-lion">No matches.</p>
                ) : (
                  searchResults.map((series) => (
                    <button
                      key={series.id}
                      type="button"
                      onClick={() => addHeroSeries(series)}
                      className="w-full flex items-center gap-3 p-2 text-left hover:bg-indiana-clay/5"
                    >
                      <img
                        src={fullUrl(series.cover_url || series.thumbnail_url)}
                        alt=""
                        className="w-8 h-11 object-cover rounded"
                      />
                      <span className="text-sm text-torrefacto-roast truncate">{series.title}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* App download */}
          <div className="bg-bonaire rounded-lg border border-stone-lion/20 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-torrefacto-roast mb-2">App download</h2>
            <p className="text-sm text-stone-lion mb-4">
              Set the APK download link shown on the frontend Get App page. Use MediaFire, Google Drive, or any direct download URL.
            </p>
            <div className="space-y-4 max-w-xl">
              <div>
                <label className="block text-sm font-medium text-torrefacto-roast mb-1">Download URL</label>
                <input
                  type="url"
                  value={appDownloadUrl}
                  onChange={(e) => setAppDownloadUrl(e.target.value)}
                  placeholder="https://..."
                  className="block w-full px-3 py-2 border border-stone-lion/30 rounded-lg bg-bonaire text-torrefacto-roast placeholder-stone-lion focus:ring-2 focus:ring-indiana-clay focus:border-transparent"
                />
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-torrefacto-roast mb-1">APK filename</label>
                  <input
                    type="text"
                    value={appDownloadFilename}
                    onChange={(e) => setAppDownloadFilename(e.target.value)}
                    placeholder="myangar-v1.apk"
                    className="block w-full px-3 py-2 border border-stone-lion/30 rounded-lg bg-bonaire text-torrefacto-roast placeholder-stone-lion focus:ring-2 focus:ring-indiana-clay focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-torrefacto-roast mb-1">Version</label>
                  <input
                    type="text"
                    value={appVersion}
                    onChange={(e) => setAppVersion(e.target.value)}
                    placeholder="1.0"
                    className="block w-full px-3 py-2 border border-stone-lion/30 rounded-lg bg-bonaire text-torrefacto-roast placeholder-stone-lion focus:ring-2 focus:ring-indiana-clay focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-torrefacto-roast mb-1">Size (MB)</label>
                  <input
                    type="text"
                    value={appSizeMb}
                    onChange={(e) => setAppSizeMb(e.target.value)}
                    placeholder="29"
                    className="block w-full px-3 py-2 border border-stone-lion/30 rounded-lg bg-bonaire text-torrefacto-roast placeholder-stone-lion focus:ring-2 focus:ring-indiana-clay focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card layout */}
          <div className="bg-bonaire rounded-lg border border-stone-lion/20 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-torrefacto-roast mb-2">Manga card layout</h2>
            <p className="text-sm text-stone-lion mb-4">
              Choose which of the 20 manga card designs (01–10 portrait, 11–20 landscape) to use in each section.
              Recent / Recently Viewed and Favorites support any card 01–20. Home hero is portrait-only (01–10).
              Save branding, then refresh to confirm the selection sticks.
            </p>
            <div className="space-y-3 max-w-xl">
              {Object.entries(SECTION_LABELS).map(([key, label]) => {
                const options = key === 'home_hero' ? PORTRAIT_CARD_OPTIONS : CARD_OPTIONS;
                return (
                  <div key={key} className="flex items-center justify-between gap-4">
                    <label className="text-sm font-medium text-torrefacto-roast shrink-0 w-56">{label}</label>
                    <select
                      value={cardLayout[key] || DEFAULT_CARD_LAYOUT[key] || 'card_01'}
                      onChange={(e) => setSectionCard(key, e.target.value)}
                      className="flex-1 px-3 py-2 border border-stone-lion/30 rounded-lg bg-bonaire text-torrefacto-roast focus:ring-2 focus:ring-indiana-clay focus:border-transparent text-sm"
                    >
                      {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Grid columns */}
          <div className="bg-bonaire rounded-lg border border-stone-lion/20 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-torrefacto-roast mb-2">Grid columns (cards per row)</h2>
            <p className="text-sm text-stone-lion mb-4">
              Set how many cards per row for each view. Recent / Recently Viewed and Favorites are included.
            </p>
            <div className="space-y-4 max-w-4xl">
              {GRID_SECTION_KEYS.map((sectionKey) => (
                <div key={sectionKey} className="flex flex-wrap items-center gap-4 py-3 border-b border-stone-lion/20 last:border-0">
                  <label className="text-sm font-medium text-torrefacto-roast w-48 shrink-0">
                    {GRID_SECTION_LABELS[sectionKey] || sectionKey}
                  </label>
                  <div className="flex flex-wrap items-center gap-4">
                    {BREAKPOINTS.map(({ key, label }) => (
                      <div key={key} className="flex items-center gap-2">
                        <span className="text-xs text-stone-lion w-20">{label}</span>
                        <input
                          type="number"
                          min={1}
                          max={6}
                          value={gridColumns[sectionKey]?.[key] ?? DEFAULT_GRID_COLUMNS[sectionKey]?.[key] ?? 2}
                          onChange={(e) => setGridColumn(sectionKey, key, e.target.value)}
                          className="w-14 px-2 py-1.5 border border-stone-lion/30 rounded-lg bg-bonaire text-torrefacto-roast text-sm focus:ring-2 focus:ring-indiana-clay"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="px-6 py-2.5 bg-indiana-clay text-white font-medium rounded-lg hover:bg-indiana-clay/90 disabled:opacity-50"
            >
              {updateMutation.isPending ? 'Saving…' : 'Save branding'}
            </button>
          </div>
        </form>
      </div>

      <StatusModal
        open={statusModal.open}
        type={statusModal.type}
        title={statusModal.title}
        message={statusModal.message}
        onClose={closeStatusModal}
      />
    </Layout>
  );
}

export default Branding;
