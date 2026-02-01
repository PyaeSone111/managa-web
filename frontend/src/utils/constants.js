export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export const ITEMS_PER_PAGE = 20;
export const CHAPTERS_PER_PAGE = 50;

export const THEME_STORAGE_KEY = 'manga-app-theme';
export const AUTH_TOKEN_KEY = 'auth_token';

export const SERIES_TYPES = ['manga', 'manhwa', 'manhua'];
export const SERIES_STATUSES = ['ongoing', 'completed', 'hiatus', 'cancelled'];
export const SORT_OPTIONS = [
  { value: 'latest', label: 'Latest' },
  { value: 'popular', label: 'Popular' },
  { value: 'rating', label: 'Rating' },
  { value: 'alphabetical', label: 'A-Z' },
];

export const READING_MODES = {
  WIDTH: 'width',
  HEIGHT: 'height',
  ORIGINAL: 'original',
};

