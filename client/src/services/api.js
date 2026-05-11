import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(`${API_BASE}/api/auth/refresh`, {}, { withCredentials: true });
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
        processQueue(null, data.token);
        originalRequest.headers.Authorization = `Bearer ${data.token}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  refresh: () => api.post('/auth/refresh'),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

export const pdfAPI = {
  merge: (files) => {
    const formData = new FormData();
    files.forEach((f) => formData.append('files', f));
    return api.post('/pdf/merge', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 300000,
    });
  },

  split: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/pdf/split', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 300000,
    });
  },

  compress: (file, quality = 0.5) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('quality', quality);
    return api.post('/pdf/compress', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 300000,
    });
  },

  rotate: (file, degrees = 90) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('degrees', degrees);
    return api.post('/pdf/rotate', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 300000,
    });
  },

  protect: (file, password) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('password', password);
    return api.post('/pdf/protect', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 300000,
    });
  },

  unlock: (file, password) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('password', password);
    return api.post('/pdf/unlock', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 300000,
    });
  },

  addPageNumbers: (file, options = {}) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('startNumber', options.startNumber || 1);
    formData.append('fontSize', options.fontSize || 12);
    return api.post('/pdf/add-page-numbers', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 300000,
    });
  },

  addWatermark: (file, text) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('text', text);
    return api.post('/pdf/add-watermark', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 300000,
    });
  },

  extractText: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/pdf/extract-text', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 300000,
    });
  },

  reorder: (file, pageOrder) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('pageOrder', JSON.stringify(pageOrder));
    return api.post('/pdf/reorder', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 300000,
    });
  },

  deletePages: (file, pagesToDelete) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('pagesToDelete', JSON.stringify(pagesToDelete));
    return api.post('/pdf/delete-pages', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 300000,
    });
  },

  pdfToJpg: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/pdf/pdf-to-jpg', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 300000,
    });
  },

  jpgToPdf: (files) => {
    const formData = new FormData();
    files.forEach((f) => formData.append('files', f));
    return api.post('/pdf/jpg-to-pdf', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 300000,
    });
  },

  pdfToTxt: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/pdf/pdf-to-txt', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 300000,
    });
  },

  getPageCount: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/pdf/page-count', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  getDownloadUrl: (filename) => `${API_BASE}/api/pdf/download/${filename}`,

  repair: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/pdf/repair', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 300000,
    });
  },

  pdfToPdfa: (file, options = {}) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', options.title || '');
    formData.append('author', options.author || '');
    formData.append('subject', options.subject || '');
    formData.append('keywords', options.keywords || '');
    return api.post('/pdf/pdf-to-pdfa', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 300000,
    });
  },

  readMetadata: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/pdf/read-metadata', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  writeMetadata: (file, metadata) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', metadata.title || '');
    formData.append('author', metadata.author || '');
    formData.append('subject', metadata.subject || '');
    formData.append('keywords', metadata.keywords || '');
    return api.post('/pdf/write-metadata', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 300000,
    });
  },

  flatten: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/pdf/flatten', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 300000,
    });
  },

  htmlToPdf: (content, options = {}) => {
    return api.post('/pdf/html-to-pdf', {
      content,
      title: options.title || 'Document',
      fontSize: options.fontSize || 12,
    }, {
      timeout: 300000,
    });
  },

  redact: (file, redactions) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('redactions', JSON.stringify(redactions));
    return api.post('/pdf/redact', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 300000,
    });
  },

  removeAnnotations: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/pdf/remove-annotations', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 300000,
    });
  },

  removeWatermark: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/pdf/remove-watermark', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 300000,
    });
  },

  compare: (file1, file2) => {
    const formData = new FormData();
    formData.append('files', file1);
    formData.append('files', file2);
    return api.post('/pdf/compare', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 300000,
    });
  },
};

export const historyAPI = {
  getAll: (page = 1) => api.get(`/history?page=${page}`),
  getOne: (id) => api.get(`/history/${id}`),
  delete: (id) => api.delete(`/history/${id}`),
  clearAll: () => api.delete('/history'),
};

export default api;
