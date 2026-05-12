import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || '';

const api = axios.create({
  baseURL: `${API_BASE}/api`,
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

const withProgress = (config, onProgress) => {
  if (onProgress) {
    config.onUploadProgress = (e) => {
      const pct = Math.round((e.loaded / e.total) * 100);
      onProgress(pct);
    };
  }
  return config;
};

export const pdfAPI = {
  merge: (files, onProgress) => {
    const formData = new FormData();
    files.forEach((f) => formData.append('files', f));
    return api.post('/pdf/merge', formData, withProgress({
      timeout: 300000,
    }, onProgress));
  },

  split: (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/pdf/split', formData, withProgress({
      timeout: 300000,
    }, onProgress));
  },

  compress: (file, quality = 0.5, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('quality', quality);
    return api.post('/pdf/compress', formData, withProgress({
      timeout: 300000,
    }, onProgress));
  },

  rotate: (file, degrees = 90, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('degrees', degrees);
    return api.post('/pdf/rotate', formData, withProgress({
      timeout: 300000,
    }, onProgress));
  },

  protect: (file, password, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('password', password);
    return api.post('/pdf/protect', formData, withProgress({
      timeout: 300000,
    }, onProgress));
  },

  unlock: (file, password, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('password', password);
    return api.post('/pdf/unlock', formData, withProgress({
      timeout: 300000,
    }, onProgress));
  },

  addPageNumbers: (file, options = {}, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('startNumber', options.startNumber || 1);
    formData.append('fontSize', options.fontSize || 12);
    return api.post('/pdf/add-page-numbers', formData, withProgress({
      timeout: 300000,
    }, onProgress));
  },

  addWatermark: (file, text, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('text', text);
    return api.post('/pdf/add-watermark', formData, withProgress({
      timeout: 300000,
    }, onProgress));
  },

  extractText: (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/pdf/extract-text', formData, withProgress({
      timeout: 300000,
    }, onProgress));
  },

  reorder: (file, pageOrder, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('pageOrder', JSON.stringify(pageOrder));
    return api.post('/pdf/reorder', formData, withProgress({
      timeout: 300000,
    }, onProgress));
  },

  deletePages: (file, pagesToDelete, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('pagesToDelete', JSON.stringify(pagesToDelete));
    return api.post('/pdf/delete-pages', formData, withProgress({
      timeout: 300000,
    }, onProgress));
  },

  pdfToJpg: (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/pdf/pdf-to-jpg', formData, withProgress({
      timeout: 300000,
    }, onProgress));
  },

  jpgToPdf: (files, onProgress) => {
    const formData = new FormData();
    files.forEach((f) => formData.append('files', f));
    return api.post('/pdf/jpg-to-pdf', formData, withProgress({
      timeout: 300000,
    }, onProgress));
  },

  pdfToTxt: (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/pdf/pdf-to-txt', formData, withProgress({
      timeout: 300000,
    }, onProgress));
  },

  getPageCount: (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/pdf/page-count', formData, withProgress({
    }, onProgress));
  },

  getDownloadUrl: (filename) => `${API_BASE}/api/pdf/download/${filename}`,

  repair: (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/pdf/repair', formData, withProgress({
      timeout: 300000,
    }, onProgress));
  },

  pdfToPdfa: (file, options = {}, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', options.title || '');
    formData.append('author', options.author || '');
    formData.append('subject', options.subject || '');
    formData.append('keywords', options.keywords || '');
    return api.post('/pdf/pdf-to-pdfa', formData, withProgress({
      timeout: 300000,
    }, onProgress));
  },

  readMetadata: (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/pdf/read-metadata', formData, withProgress({
    }, onProgress));
  },

  writeMetadata: (file, metadata, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', metadata.title || '');
    formData.append('author', metadata.author || '');
    formData.append('subject', metadata.subject || '');
    formData.append('keywords', metadata.keywords || '');
    return api.post('/pdf/write-metadata', formData, withProgress({
      timeout: 300000,
    }, onProgress));
  },

  flatten: (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/pdf/flatten', formData, withProgress({
      timeout: 300000,
    }, onProgress));
  },

  htmlToPdf: (content, options = {}, onProgress) => {
    return api.post('/pdf/html-to-pdf', {
      content,
      title: options.title || 'Document',
      fontSize: options.fontSize || 12,
    }, withProgress({
      timeout: 300000,
    }, onProgress));
  },

  redact: (file, redactions, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('redactions', JSON.stringify(redactions));
    return api.post('/pdf/redact', formData, withProgress({
      timeout: 300000,
    }, onProgress));
  },

  removeAnnotations: (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/pdf/remove-annotations', formData, withProgress({
      timeout: 300000,
    }, onProgress));
  },

  removeWatermark: (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/pdf/remove-watermark', formData, withProgress({
      timeout: 300000,
    }, onProgress));
  },

  compare: (file1, file2, onProgress) => {
    const formData = new FormData();
    formData.append('files', file1);
    formData.append('files', file2);
    return api.post('/pdf/compare', formData, withProgress({
      timeout: 300000,
    }, onProgress));
  },
};

export const historyAPI = {
  getAll: (page = 1) => api.get(`/history?page=${page}`),
  getOne: (id) => api.get(`/history/${id}`),
  delete: (id) => api.delete(`/history/${id}`),
  clearAll: () => api.delete('/history'),
};

export default api;
