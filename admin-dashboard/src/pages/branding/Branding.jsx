import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../services/api';
import Layout from '../../components/common/Layout';

const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1').replace(/\/api\/v1\/?$/, '');

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

const SECTION_LABELS = {
  home_latest: 'Home – Latest Release',
  home_popular: 'Home – Popular',
  home_weekly_highlights: 'Home – Weekly Highlights',
  home_recently_added: 'Home – Recently Added',
  browse_vertical: 'Browse – Vertical grid',
  browse_horizontal: 'Browse – Horizontal grid',
  rankings: 'Rankings (Top / Most Read / Trending)',
  recently_viewed: 'Recently Viewed (sidebar carousel)',
};

const DEFAULT_CARD_LAYOUT = {
  home_latest: 'card_01',
  home_popular: 'card_11',
  home_weekly_highlights: 'card_03',
  home_recently_added: 'card_13',
  browse_vertical: 'card_01',
  browse_horizontal: 'card_11',
  rankings: 'card_15',
  recently_viewed: 'card_04',
};

const DEFAULT_GRID_COLUMNS = {
  vertical: { default: 2, sm: 3, md: 4, lg: 5, xl: 6 },
  horizontal: { default: 1, sm: 2, md: 3, lg: 4 },
};

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

function Branding() {
  const queryClient = useQueryClient();
  const [logoUrl, setLogoUrl] = useState('');
  const [heroBackgroundUrl, setHeroBackgroundUrl] = useState('');
  const [heroImageUrl, setHeroImageUrl] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [heroBackgroundFile, setHeroBackgroundFile] = useState(null);
  const [heroImageFile, setHeroImageFile] = useState(null);
  const [logoBlobUrl, setLogoBlobUrl] = useState(null);
  const [heroBgBlobUrl, setHeroBgBlobUrl] = useState(null);
  const [heroImgBlobUrl, setHeroImgBlobUrl] = useState(null);
  const [cardLayout, setCardLayout] = useState({ ...DEFAULT_CARD_LAYOUT });
  const [gridColumns, setGridColumns] = useState(JSON.parse(JSON.stringify(DEFAULT_GRID_COLUMNS)));

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'branding'],
    queryFn: () => adminApi.getBranding(),
  });

  useEffect(() => {
    if (data?.data) {
      setLogoUrl(data.data.logo_url || '');
      setHeroBackgroundUrl(data.data.hero_background_url || '');
      setHeroImageUrl(data.data.hero_image_url || '');
      if (data.data.card_layout && typeof data.data.card_layout === 'object') {
        setCardLayout({ ...DEFAULT_CARD_LAYOUT, ...data.data.card_layout });
      }
      if (data.data.grid_columns && typeof data.data.grid_columns === 'object') {
        setGridColumns({
          vertical: { ...DEFAULT_GRID_COLUMNS.vertical, ...data.data.grid_columns.vertical },
          horizontal: { ...DEFAULT_GRID_COLUMNS.horizontal, ...data.data.grid_columns.horizontal },
        });
      }
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
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'branding']);
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
    formData.append('card_layout', JSON.stringify(cardLayout));
    formData.append('grid_columns', JSON.stringify(gridColumns));

    updateMutation.mutate(formData, {
      onSuccess: () => alert('Branding updated successfully. The frontend will reflect changes on next load.'),
      onError: (err) => alert('Failed to update branding: ' + (err?.message || 'Unknown error')),
    });
  };

  const setSectionCard = (sectionKey, value) => {
    setCardLayout((prev) => ({ ...prev, [sectionKey]: value }));
  };

  const setGridColumn = (layout, breakpoint, value) => {
    const n = Math.min(6, Math.max(1, parseInt(value, 10) || 1));
    setGridColumns((prev) => ({
      ...prev,
      [layout]: { ...prev[layout], [breakpoint]: n },
    }));
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
            Update the main logo, hero section background, and hero image shown on the frontend.
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

          {/* Card layout: which manga card UI per section */}
          <div className="bg-bonaire rounded-lg border border-stone-lion/20 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-torrefacto-roast mb-2">Manga card layout</h2>
            <p className="text-sm text-stone-lion mb-4">
              Choose which of the 20 manga card designs (01–10 portrait, 11–20 landscape) to use in each section on the frontend.
            </p>
            <div className="space-y-3 max-w-xl">
              {Object.entries(SECTION_LABELS).map(([key, label]) => (
                <div key={key} className="flex items-center justify-between gap-4">
                  <label className="text-sm font-medium text-torrefacto-roast shrink-0 w-56">{label}</label>
                  <select
                    value={cardLayout[key] || DEFAULT_CARD_LAYOUT[key] || 'card_01'}
                    onChange={(e) => setSectionCard(key, e.target.value)}
                    className="flex-1 px-3 py-2 border border-stone-lion/30 rounded-lg bg-bonaire text-torrefacto-roast focus:ring-2 focus:ring-indiana-clay focus:border-transparent text-sm"
                  >
                    {CARD_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Grid columns: cards per row per breakpoint */}
          <div className="bg-bonaire rounded-lg border border-stone-lion/20 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-torrefacto-roast mb-2">Grid columns (cards per row)</h2>
            <p className="text-sm text-stone-lion mb-4">
              Set how many cards show in one row for each screen size. Vertical = portrait-style sections (e.g. Latest Release). Horizontal = landscape-style sections (e.g. Popular, Rankings).
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
              <div>
                <h3 className="text-sm font-medium text-torrefacto-roast mb-3">Vertical layout (portrait cards)</h3>
                <div className="space-y-2">
                  {BREAKPOINTS.map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between gap-3">
                      <label className="text-sm text-stone-lion w-32">{label}</label>
                      <input
                        type="number"
                        min={1}
                        max={6}
                        value={gridColumns.vertical?.[key] ?? DEFAULT_GRID_COLUMNS.vertical[key]}
                        onChange={(e) => setGridColumn('vertical', key, e.target.value)}
                        className="w-16 px-2 py-1.5 border border-stone-lion/30 rounded-lg bg-bonaire text-torrefacto-roast text-sm focus:ring-2 focus:ring-indiana-clay"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-torrefacto-roast mb-3">Horizontal layout (landscape cards)</h3>
                <div className="space-y-2">
                  {BREAKPOINTS.map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between gap-3">
                      <label className="text-sm text-stone-lion w-32">{label}</label>
                      <input
                        type="number"
                        min={1}
                        max={6}
                        value={gridColumns.horizontal?.[key] ?? DEFAULT_GRID_COLUMNS.horizontal[key]}
                        onChange={(e) => setGridColumn('horizontal', key, e.target.value)}
                        className="w-16 px-2 py-1.5 border border-stone-lion/30 rounded-lg bg-bonaire text-torrefacto-roast text-sm focus:ring-2 focus:ring-indiana-clay"
                      />
                    </div>
                  ))}
                </div>
              </div>
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
    </Layout>
  );
}

export default Branding;
