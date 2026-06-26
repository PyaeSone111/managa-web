import axios from 'axios';
import { API_BASE_URL, AUTH_TOKEN_KEY } from '../utils/constants';
import { getItem, removeItem } from './storage';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  const token = await getItem(AUTH_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      if (status === 401) {
        removeItem(AUTH_TOKEN_KEY);
      }
      return Promise.reject({
        message: data.message || 'An error occurred',
        errors: data.errors || {},
        status,
      });
    }
    if (error.request) {
      return Promise.reject({
        message: 'Network error. Please check your connection.',
        status: 0,
      });
    }
    return Promise.reject({
      message: error.message || 'An unexpected error occurred',
      status: 0,
    });
  }
);

export const seriesApi = {
  getAll: (params) => api.get('/series', { params }),
  getById: (id) => api.get(`/series/${id}`),
  getChapters: (id, params) => api.get(`/series/${id}/chapters`, { params }),
  getLatest: (params) => api.get('/manga/recent', { params }),
  getNew: (params) => api.get('/manga/new', { params }),
  getPopular: (params) => api.get('/popular', { params }),
  getTrending: (params) => api.get('/trending', { params }),
};

export const chapterApi = {
  getById: (id) => api.get(`/chapters/${id}`),
  getBySeriesAndNumber: (seriesSlug, chapterNumber) =>
    api.get(`/series/${seriesSlug}/chapters/${chapterNumber}`),
};

export const categoryApi = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
  getSeries: (id, params) => api.get(`/categories/${id}/series`, { params }),
};

export const tagApi = {
  getAll: () => api.get('/tags'),
  getById: (id) => api.get(`/tags/${id}`),
  getSeries: (id, params) => api.get(`/tags/${id}/series`, { params }),
};

export const authorApi = {
  getAll: (params) => api.get('/authors', { params }),
  getById: (id) => api.get(`/authors/${id}`),
  getSeries: (id, params) => api.get(`/authors/${id}/series`, { params }),
};

export const mangaTypeApi = {
  getAll: () => api.get('/types'),
  getById: (id) => api.get(`/types/${id}`),
};

export const searchApi = {
  search: (params) => api.get('/search', { params }),
  suggestions: (query) => api.get('/search/suggestions', { params: { q: query } }),
};

export const rankingsApi = {
  getTop: (params) => api.get('/rankings/top', { params }),
  getTopReading: (params) => api.get('/rankings/reading', { params }),
  getTrending: (params) => api.get('/rankings/trending', { params }),
};

export const favoriteApi = {
  getAll: (params) => api.get('/user/favorites', { params }),
  add: (seriesId) => api.post(`/manga/${seriesId}/favorite`),
  remove: (seriesId) => api.delete(`/manga/${seriesId}/favorite`),
  check: (seriesId) => api.get(`/manga/${seriesId}/favorite/check`),
};

export const ratingApi = {
  getAll: (params) => api.get('/user/ratings', { params }),
  get: (seriesId) => api.get(`/manga/${seriesId}/rate`),
  rate: (seriesId, rating1to5) => api.post(`/manga/${seriesId}/rate`, { rating: rating1to5 * 2 }),
  remove: (seriesId) => api.delete(`/manga/${seriesId}/rate`),
};

export const readingProgressApi = {
  getAll: (params) => api.get('/reading-progress', { params }),
  get: (seriesId) => api.get(`/reading-progress/${seriesId}`),
  update: (seriesId, data) => api.post(`/reading-progress/${seriesId}`, data),
  markComplete: (seriesId, chapterId) =>
    api.post(`/reading-progress/${seriesId}/complete`, { chapter_id: chapterId }),
};

export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  refresh: () => api.post('/auth/refresh'),
};

export const themeApi = {
  getActive: () => api.get('/theme/active'),
};

export const brandingApi = {
  getBranding: (params) =>
    api.get('/branding', {
      params,
      headers: params?._refresh
        ? { 'Cache-Control': 'no-cache', Pragma: 'no-cache' }
        : undefined,
    }),
};

export const dashboardApi = {
  getHomepage: (params) => api.get('/dashboard', { params }),
};

export default api;
