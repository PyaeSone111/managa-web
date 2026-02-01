import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { themeApi } from '../../services/api';

const DEFAULT_CONFIG = {
  bodyBackground: 'linear-gradient(to bottom right, #0D2625, #30463D, #627160)',
  bodyColor: '#C6CEC5',
  primary: '#627160',
  primaryHover: '#30463D',
  onPrimary: '#FFFFFF',
  cardBg: 'rgba(164, 180, 164, 0.4)',
  cardBorder: 'rgba(198, 206, 197, 0.3)',
  glassBg: 'rgba(198, 206, 197, 0.3)',
  textMuted: '#C6CEC5',
  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
};

/** Returns relative luminance (0–1). Dark colors < ~0.4 use white text. */
function getLuminance(hex) {
  if (!hex || typeof hex !== 'string') return 0.5;
  const m = hex.replace(/^#/, '').match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (!m) return 0.5;
  const [r, g, b] = m.slice(1, 4).map((n) => parseInt(n, 16) / 255);
  const l = (x) => (x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4));
  return 0.2126 * l(r) + 0.7152 * l(g) + 0.0722 * l(b);
}

function resolveOnPrimary(config) {
  if (config?.onPrimary) return config.onPrimary;
  const primary = config?.primary || DEFAULT_CONFIG.primary;
  const bodyColor = config?.bodyColor || DEFAULT_CONFIG.bodyColor;
  return getLuminance(primary) < 0.4 ? '#FFFFFF' : bodyColor;
}

function applyTheme(config, slug) {
  const c = config || DEFAULT_CONFIG;
  const root = document.documentElement;
  root.setAttribute('data-theme', slug || 'default');
  root.style.setProperty('--theme-body-bg', c.bodyBackground || DEFAULT_CONFIG.bodyBackground);
  root.style.setProperty('--theme-body-color', c.bodyColor || DEFAULT_CONFIG.bodyColor);
  root.style.setProperty('--theme-primary', c.primary || DEFAULT_CONFIG.primary);
  root.style.setProperty('--theme-primary-hover', c.primaryHover || DEFAULT_CONFIG.primaryHover);
  root.style.setProperty('--theme-on-primary', resolveOnPrimary(c));
  root.style.setProperty('--theme-card-bg', c.cardBg || DEFAULT_CONFIG.cardBg);
  root.style.setProperty('--theme-card-border', c.cardBorder || DEFAULT_CONFIG.cardBorder);
  root.style.setProperty('--theme-glass-bg', c.glassBg || DEFAULT_CONFIG.glassBg);
  root.style.setProperty('--theme-text-muted', c.textMuted || DEFAULT_CONFIG.textMuted);
  root.style.setProperty('--theme-font-family', c.fontFamily || DEFAULT_CONFIG.fontFamily);
}

export function ThemeLoader({ children }) {
  const { data, isFetched } = useQuery({
    queryKey: ['theme', 'active'],
    queryFn: () => themeApi.getActive(),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  // Always show original (default) theme on first load until API returns
  useEffect(() => {
    applyTheme(DEFAULT_CONFIG, 'default');
  }, []);

  // Apply only the set theme when API has returned (do not apply while loading/error)
  useEffect(() => {
    if (!isFetched || !data?.data) return;
    const theme = data.data;
    applyTheme(theme.config, theme.slug);
  }, [isFetched, data?.data]);

  return children;
}

export default ThemeLoader;
