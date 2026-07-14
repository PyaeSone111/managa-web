import { useWindowDimensions } from 'react-native';
import { getCardKeyForSection, isPortraitCard } from './cardLayout';

/** Match Tailwind breakpoints used in admin-dashboard / web frontend. */
export const GRID_BREAKPOINTS = {
  default: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
};

export const DEFAULT_COLS_PORTRAIT = {
  default: 2,
  sm: 3,
  md: 4,
  lg: 5,
  xl: 6,
};

export const DEFAULT_COLS_LANDSCAPE = {
  default: 1,
  sm: 2,
  md: 3,
  lg: 4,
  xl: 5,
};

function defaultColumnsForSection(section, cardLayout) {
  const cardKey = getCardKeyForSection(section, cardLayout);
  return isPortraitCard(cardKey) ? DEFAULT_COLS_PORTRAIT : DEFAULT_COLS_LANDSCAPE;
}

/** Mobile-first: largest breakpoint at or below current width wins. */
export function resolveColumnsAtWidth(width, columnsConfig) {
  const keys = ['default', 'sm', 'md', 'lg', 'xl'];
  let value = columnsConfig.default ?? 2;
  for (const key of keys) {
    if (width >= GRID_BREAKPOINTS[key] && columnsConfig[key] != null) {
      value = columnsConfig[key];
    }
  }
  return value;
}

/** Column count from admin branding grid_columns for the current screen width. */
export function getGridColumnsForSection(section, width, gridColumns, cardLayout) {
  const portrait = isPortraitCard(getCardKeyForSection(section, cardLayout));
  const maxCols = portrait ? 6 : 5;
  const defaults = defaultColumnsForSection(section, cardLayout);
  const stored = section && gridColumns?.[section] ? gridColumns[section] : null;

  // Admin often saved portrait column maps for recently_viewed (default: 2).
  // Landscape cards need landscape column defaults on phones.
  let config = defaults;
  if (stored) {
    const looksLikePortraitCols = (stored.default ?? 0) >= 2;
    if (!portrait && looksLikePortraitCols && width < GRID_BREAKPOINTS.sm) {
      config = defaults;
    } else {
      config = { ...defaults, ...stored };
    }
  }

  const raw = resolveColumnsAtWidth(width, config);
  const fallback = defaults.default ?? (portrait ? 2 : 1);
  let cols = Math.min(maxCols, Math.max(1, Number(raw) || fallback));

  // Landscape cards are horizontal rows — never squeeze into multi-col on phone.
  if (!portrait && width < GRID_BREAKPOINTS.sm) {
    cols = 1;
  }

  return cols;
}

export function useGridColumnsForSection(section, gridColumns, cardLayout) {
  const { width } = useWindowDimensions();
  return getGridColumnsForSection(section, width, gridColumns, cardLayout);
}
