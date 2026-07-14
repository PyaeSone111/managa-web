import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://manga-apis.fatelight.org/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Remove Content-Type header for FormData - axios will set it automatically with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    // GET: unique URL so refetches don't come from disk cache (avoids fetch adapter / CORS issues)
    const method = (config.method || 'get').toLowerCase();
    if (method === 'get') {
      config.params = { ...config.params, _: Date.now() };
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      
      if (status === 401) {
        localStorage.removeItem('admin_token');
        // Don't redirect here, let the component handle it
      }
      
      return Promise.reject({
        message: data.message || 'An error occurred',
        errors: data.errors || {},
        status,
      });
    } else if (error.request) {
      return Promise.reject({
        message: 'Network error. Please check your connection.',
        status: 0,
      });
    } else {
      return Promise.reject({
        message: error.message || 'An unexpected error occurred',
        status: 0,
      });
    }
  }
);

// Auth API
export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};

// Admin API — use /admin/* routes (no server-side response cache)
export const adminApi = {
  // Series
  getSeries: (params) => api.get('/admin/series', { params }),
  getSeriesById: (id) => api.get(`/admin/series/${id}`),
  createSeries: (data) => api.post('/admin/series', data),
  bulkImportSeries: (data) => api.post('/admin/series/bulk-import', data),
  getSeriesBulkImportStatus: (batchId) => api.get(`/admin/series/bulk-import/${batchId}`),
  updateSeries: (id, data) => api.put(`/admin/series/${id}`, data),
  deleteSeries: (id) => api.delete(`/admin/series/${id}`),
  
  // Chapters
  getChapters: (seriesId, params) =>
    api.get('/admin/chapters', { params: { series_id: seriesId, ...params } }),
  getChapterById: (id) => api.get(`/admin/chapters/${id}`),
  createChapter: (data) => api.post('/admin/chapters', data),
  bulkImportChapters: (data) => api.post('/admin/chapters/bulk-import', data),
  getChapterBulkImportStatus: (batchId) => api.get(`/admin/chapters/bulk-import/${batchId}`),
  updateChapter: (id, data) => api.put(`/admin/chapters/${id}`, data),
  deleteChapter: (id) => api.delete(`/admin/chapters/${id}`),
  
  // Categories
  getCategories: () => api.get('/admin/categories'),
  getCategoryById: (id) => api.get(`/admin/categories/${id}`),
  createCategory: (data) => api.post('/admin/categories', data),
  updateCategory: (id, data) => api.put(`/admin/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`),
  
  // Tags
  getTags: () => api.get('/admin/tags'),
  getTagById: (id) => api.get(`/admin/tags/${id}`),
  createTag: (data) => api.post('/admin/tags', data),
  updateTag: (id, data) => api.put(`/admin/tags/${id}`, data),
  deleteTag: (id) => api.delete(`/admin/tags/${id}`),

  // Authors
  getAuthors: (params) => api.get('/admin/authors', { params }),
  getAuthorById: (id) => api.get(`/admin/authors/${id}`),
  createAuthor: (data) => api.post('/admin/authors', data),
  updateAuthor: (id, data) => api.put(`/admin/authors/${id}`, data),
  deleteAuthor: (id) => api.delete(`/admin/authors/${id}`),
  bulkImportAuthors: (data) => api.post('/admin/authors/bulk-import', data),

  // Manga Types
  getMangaTypes: () => api.get('/admin/manga-types'),
  getMangaTypeById: (id) => api.get(`/admin/manga-types/${id}`),
  createMangaType: (data) => api.post('/admin/manga-types', data),
  updateMangaType: (id, data) => api.put(`/admin/manga-types/${id}`, data),
  deleteMangaType: (id) => api.delete(`/admin/manga-types/${id}`),

  // Upload
  uploadImage: (formData) => api.post('/admin/upload', formData),
  bulkUploadImages: (formData) => api.post('/admin/upload/bulk', formData),

  // Themes
  getThemes: () => api.get('/admin/themes'),
  getThemeById: (id) => api.get(`/admin/themes/${id}`),
  createTheme: (data) => api.post('/admin/themes', data),
  updateTheme: (id, data) => api.put(`/admin/themes/${id}`, data),
  deleteTheme: (id) => api.delete(`/admin/themes/${id}`),
  activateTheme: (id) => api.post(`/admin/themes/${id}/activate`),

  // Branding (logo, hero background, hero image). Use POST so multipart files are received (PUT does not populate $_FILES in PHP).
  getBranding: () => api.get('/admin/branding'),
  updateBranding: (formData) => api.post('/admin/branding', formData),

  // Existing images for reuse (branding + series covers/thumbnails)
  getExistingImages: () => api.get('/admin/existing-images'),
};

export default api;

