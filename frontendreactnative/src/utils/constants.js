import {
  EXPO_PUBLIC_API_BASE_URL,
  EXPO_PUBLIC_CONTACT_EMAIL,
} from '@env';

export const API_BASE_URL =
  EXPO_PUBLIC_API_BASE_URL || 'https://manga-apis.fatelight.org/api/v1';

export const CONTACT_EMAIL =
  EXPO_PUBLIC_CONTACT_EMAIL || 'info@fatelight.org';

export const ITEMS_PER_PAGE = 20;
export const CHAPTERS_PER_PAGE = 50;
export const AUTH_TOKEN_KEY = 'auth_token';
export const REMEMBER_LOGIN_KEY = 'remember_login_credentials';
export const RECENTLY_VIEWED_KEY = 'manga-web-recently-viewed';
export const BRANDING_CACHE_KEY = 'branding_cache';
export const READER_SETTINGS_KEY = 'reader_settings';

/** Website download page — opens in browser; user downloads APK manually. */
export const APP_DOWNLOAD_PAGE_URL = 'https://myangar.fatelight.org/download';

export const MONETAG_SMART_LINK = 'https://omg10.com/4/11203049';
export const AD_BANNER_URL = 'https://omg10.com/4/11239729';

/** Reader page view mode */
export const READER_MODE_SCROLL = 'scroll';
export const READER_MODE_PAGED = 'paged';

/** Reader orientation preference */
export const READER_ORIENTATION_PORTRAIT = 'portrait';
export const READER_ORIENTATION_LANDSCAPE = 'landscape';
export const READER_ORIENTATION_AUTO = 'auto';

export const DEFAULT_READER_SETTINGS = {
  mode: READER_MODE_SCROLL,
  orientation: READER_ORIENTATION_AUTO,
  scale: 1,
};

export const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'completed', label: 'Completed' },
  { value: 'hiatus', label: 'Hiatus' },
  { value: 'dropped', label: 'Dropped' },
];

export const SORT_OPTIONS = [
  { value: 'latest', label: 'Recently Updated' },
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'title_asc', label: 'Title (A-Z)' },
  { value: 'title_desc', label: 'Title (Z-A)' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'views', label: 'Most Views' },
  { value: 'favorites', label: 'Most Favorites' },
];

export const RANKING_TABS = [
  { id: 'top', label: 'Top Manga', description: 'Best rated series' },
  { id: 'reading', label: 'Most Read', description: 'Most actively read' },
  { id: 'trending', label: 'Trending', description: 'Rising in popularity' },
];
