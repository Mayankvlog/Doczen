import React, { useState, useEffect } from 'react';
import { historyAPI } from '../services/api';
import SEO from '../components/SEO';
import { useLanguage } from '../index';

export default function History() {
  const { lang, t } = useLanguage();

  const actionLabels = {
    merge: t('nav.tools.merge', 'Merge PDF'),
    split: t('nav.tools.split', 'Split PDF'),
    compress: t('nav.tools.compress', 'Compress PDF'),
    rotate: t('nav.tools.rotate', 'Rotate PDF'),
    protect: t('nav.tools.protect', 'Protect PDF'),
    unlock: t('nav.tools.unlock', 'Unlock PDF'),
    addPageNumbers: t('nav.tools.addPageNumbers', 'Add Page Numbers'),
    addWatermark: t('nav.tools.addWatermark', 'Add Watermark'),
    extractText: t('nav.tools.extractText', 'Extract Text'),
    reorder: t('nav.tools.reorderPages', 'Reorder Pages'),
    deletePages: t('nav.tools.deletePages', 'Delete Pages'),
    pdfToJpg: t('nav.tools.pdfToJpg', 'PDF to JPG'),
    jpgToPdf: t('nav.tools.jpgToPdf', 'JPG to PDF'),
    pdfToTxt: t('nav.tools.pdfToTxt', 'PDF to TXT'),
    pdfToWord: t('nav.tools.pdfToWord', 'PDF to Word'),
    wordToPdf: t('nav.tools.wordToPdf', 'Word to PDF'),
    pdfToPpt: t('nav.tools.pdfToPpt', 'PDF to PPT'),
    pptToPdf: t('nav.tools.pptToPdf', 'PPT to PDF'),
    pdfToExcel: t('nav.tools.pdfToExcel', 'PDF to Excel'),
    excelToPdf: t('nav.tools.excelToPdf', 'Excel to PDF'),
    editPdf: t('nav.tools.editPdf', 'Edit PDF'),
    signPdf: t('nav.tools.signPdf', 'Sign PDF'),
  };
  const [history, setHistory] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const fetchHistory = async (p) => {
    setLoading(true);
    try {
      const { data } = await historyAPI.getAll(p);
      setHistory(data.history || []);
      setTotalPages(data.pages || 1);
    } catch {
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(page);
  }, [page]);

  const handleClearAll = async () => {
    if (!window.confirm(t('history.confirmClear', 'Are you sure you want to clear all history?'))) return;
    setDeleting(true);
    try {
      await historyAPI.clearAll();
      setHistory([]);
      setPage(1);
      setTotalPages(1);
    } catch {
      // silently fail
    } finally {
      setDeleting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await historyAPI.delete(id);
      setHistory((prev) => prev.filter((item) => item._id !== id));
    } catch {
      // silently fail
    }
  };

  return (
    <>
    <SEO
  title={t('history.seo.title', 'History - Doczen PDF Editor')}
  description={t('history.seo.description', 'View your PDF processing history on Doczen. Download previously processed files and track your usage.')}
  keywords={t('history.seo.keywords', 'PDF history, document history, processed files, Doczen history')}
  canonical="/history"
  noIndex
/>
    <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">{t('history.title', 'History')}</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t('history.subtitle', 'View all your past PDF operations.')}
          </p>
        </div>
        {history.length > 0 && (
          <button
            onClick={handleClearAll}
            disabled={deleting}
            className="inline-flex items-center gap-2 rounded-xl border border-red-200 dark:border-red-800 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 disabled:opacity-50 transition-colors"
          >
            {deleting ? (
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            )}
            {deleting ? t('history.clearing', 'Clearing...') : t('history.clearAll', 'Clear All')}
          </button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : history.length === 0 ? (
          <div className="py-20 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="mt-4 text-sm text-gray-400">{t('history.noHistory', 'No history yet.')}</p>
            <p className="text-sm text-gray-400">{t('history.noHistoryDesc', 'Your processed files will appear here.')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('history.action', 'Action')}</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('history.file', 'File')}</th>
                  <th className="hidden sm:table-cell px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('history.date', 'Date')}</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('history.status', 'Status')}</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('history.size', 'Size')}</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {history.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center rounded-lg bg-indigo-100 dark:bg-indigo-900/50 px-2.5 py-1 text-xs font-medium text-indigo-700 dark:text-indigo-300 capitalize">
                        {actionLabels[item.action] || item.action?.replace(/-/g, ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300 max-w-[200px] truncate">
                      {item.fileName || item.outputFiles?.[0]?.originalName || item.inputFiles?.[0]?.originalName || t('history.untitled', 'Untitled')}
                    </td>
                    <td className="hidden sm:table-cell px-5 py-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString(lang || 'en-US', {
                        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                      }) : '—'}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          item.status === 'completed'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
                            : item.status === 'failed'
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300'
                        }`}
                      >
                        {t('tool.status.' + (item.status || 'pending'), item.status || 'pending')}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {(() => { const fs = item.fileSize || item.outputFiles?.[0]?.size || item.inputFiles?.[0]?.size; return fs ? `${(fs / 1024 / 1024).toFixed(1)} MB` : '—'; })()}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        title={t('history.deleteTitle', 'Delete entry')}
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t('history.previous', 'Previous')}
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                p === page
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {t('history.next', 'Next')}
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
    </>
  );
}
