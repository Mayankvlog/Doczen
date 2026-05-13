import axios from 'axios';
import { useState, useEffect, useCallback } from 'react';

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

const API_URL = process.env.REACT_APP_API_URL || '';

async function parseResponseBlob(response, fallbackFilename) {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const data = await response.json();
    if (data.success === false) throw new Error(data.message || 'Operation failed');
    return data;
  }
  const blob = await response.blob();
  if (!blob || blob.size === 0) {
    throw new Error('Server returned empty file');
  }
  const disposition = response.headers.get('content-disposition') || '';
  const match = disposition.match(/filename\*=UTF-8''([^;]+)|filename="?([^"]+)"?/i);
  const filename = decodeURIComponent(match?.[1] || match?.[2] || fallbackFilename || 'downloaded-file');
  const blobUrl = window.URL.createObjectURL(blob);
  return { success: true, filename, blobUrl };
}

export async function handleToolSubmit(url, formData, fallbackName) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/api${url}`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData
  });

  if (!response.ok) {
    let message = 'Request failed';
    try {
      const err = await response.json();
      message = err.message || err.error || message;
    } catch (_) {}
    throw new Error(message);
  }

  return parseResponseBlob(response, fallbackName);
}

export function useDownloadHandler() {
  const [downloadUrl, setDownloadUrl] = useState('');
  const [downloadName, setDownloadName] = useState('');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    return () => {
      if (downloadUrl) window.URL.revokeObjectURL(downloadUrl);
    };
  }, [downloadUrl]);

  const triggerDownload = useCallback((url, filename) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'downloaded-file';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }, []);

  const setDownload = useCallback((url, filename) => {
    setDownloadUrl(url);
    setDownloadName(filename);
    setIsReady(true);
    triggerDownload(url, filename);
  }, [triggerDownload]);

  const clearDownload = useCallback(() => {
    setDownloadUrl(prev => {
      if (prev) window.URL.revokeObjectURL(prev);
      return '';
    });
    setDownloadName('');
    setIsReady(false);
  }, []);

  const handleDownloadAgain = useCallback(() => {
    if (downloadUrl) triggerDownload(downloadUrl, downloadName);
  }, [downloadUrl, downloadName, triggerDownload]);

  const handleDownloadResponse = useCallback(async (response, fallbackFilename) => {
    if (!response.ok) {
      let message = 'Operation failed';
      try {
        const err = await response.json();
        message = err.message || message;
      } catch (_) {}
      throw new Error(message);
    }

    const result = await parseResponseBlob(response, fallbackFilename);
    if (result.blobUrl) {
      setDownload(result.blobUrl, result.filename || fallbackFilename);
    }
    return result;
  }, [setDownload]);

  return {
    downloadUrl, downloadName, isReady,
    setDownload, clearDownload, handleDownloadAgain,
    handleDownloadResponse
  };
}

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

const downloadAsBlob = async (filename) => {
  const response = await api.get(`/pdf/download/${filename}`, {
    responseType: 'blob',
    timeout: 300000,
  });
  if (response.data.type === 'application/json') {
    const text = await response.data.text();
    const error = JSON.parse(text);
    throw new Error(error.message || 'Download failed');
  }
  return response.data;
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
      responseType: 'blob',
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

  pdfToWord: (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/pdf/pdf-to-word', formData, withProgress({
      timeout: 300000,
    }, onProgress));
  },

  pdfToExcel: (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/pdf/pdf-to-excel', formData, withProgress({
      timeout: 300000,
    }, onProgress));
  },

  excelToPdf: (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/pdf/excel-to-pdf', formData, withProgress({
      timeout: 300000,
    }, onProgress));
  },

  pdfToPpt: (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/pdf/pdf-to-ppt', formData, withProgress({
      timeout: 300000,
    }, onProgress));
  },

  pptToPdf: (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/pdf/ppt-to-pdf', formData, withProgress({
      timeout: 300000,
    }, onProgress));
  },

  wordToPdf: (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/pdf/word-to-pdf', formData, withProgress({
      timeout: 300000,
    }, onProgress));
  },

  editPdf: (file, edits, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('edits', JSON.stringify(edits));
    return api.post('/pdf/edit-pdf', formData, withProgress({
      timeout: 300000,
    }, onProgress));
  },

  signPdf: (file, signature, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('signature', JSON.stringify(signature));
    return api.post('/pdf/sign-pdf', formData, withProgress({
      timeout: 300000,
    }, onProgress));
  },

  downloadAsBlob,
};

export const historyAPI = {
  getAll: (page = 1) => api.get(`/history?page=${page}`),
  getOne: (id) => api.get(`/history/${id}`),
  delete: (id) => api.delete(`/history/${id}`),
  clearAll: () => api.delete('/history'),
};

export default api;
