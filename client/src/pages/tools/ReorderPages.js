import { useState } from 'react';
import FileUploader from '../../components/FileUploader';
import LoadingSpinner from '../../components/LoadingSpinner';
import ResultCard from '../../components/ResultCard';
import { handleToolSubmit, useDownloadHandler } from '../../services/api';
import SEO from '../../components/SEO';

export default function ReorderPages() {
  const [file, setFile] = useState(null);
  const [pageOrder, setPageOrder] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const { downloadUrl, isReady, setDownload, clearDownload, handleDownloadAgain } = useDownloadHandler();

  const handleProcess = async () => {
    if (!file) {
      setError('Please select a PDF file.');
      return;
    }
    if (!pageOrder.trim()) {
      setError('Please enter the desired page order.');
      return;
    }

    const pages = pageOrder
      .split(',')
      .map((p) => p.trim())
      .filter((p) => p !== '')
      .map((p) => parseInt(p, 10));

    if (pages.some((p) => isNaN(p) || p < 1)) {
      setError('Please enter valid page numbers (positive integers separated by commas).');
      return;
    }

    setError('');
    setLoading(true);
    setResult(null);
    clearDownload();

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('pageOrder', JSON.stringify(pages));
      const data = await handleToolSubmit('/pdf/reorder', formData, 'reordered.pdf');
      setResult(data);
      if (data.blobUrl) {
        setDownload(data.blobUrl, data.filename || 'reordered.pdf');
      }
    } catch (err) {
      setError(err.message || 'Failed to reorder pages. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <SEO title="Reorder PDF Pages Online Free" description="Rearrange pages in your PDF document online for free. Change PDF page order easily with Doczen." keywords="reorder PDF pages, rearrange PDF, PDF page organizer, change PDF page order" canonical="/reorder-pages" />
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-primary-50/30 to-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-100 mb-4">
            <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Reorder Pages</h1>
          <p className="text-lg text-gray-600 mt-2">Rearrange the order of pages in your PDF document</p>
        </div>

        <div className="card mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Upload PDF</h2>
          <FileUploader
            accept=".pdf"
            onFilesSelected={(selected) => setFile(selected[0] || null)}
          />
          {file && (
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
              <svg className="w-4 h-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {file.name}
            </div>
          )}
        </div>

        <div className="card mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Page Order</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Enter the new page order
            </label>
            <textarea
              value={pageOrder}
              onChange={(e) => setPageOrder(e.target.value)}
              placeholder="e.g. 3, 1, 2, 5, 4"
              rows={4}
              className="input-field resize-y font-mono"
            />
            <p className="mt-2 text-xs text-gray-500">
              Enter page numbers separated by commas in the desired order. Example: <span className="font-mono text-primary-600 bg-primary-50 px-1 rounded">3, 1, 2, 5, 4</span>
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        <button
          onClick={handleProcess}
          disabled={loading || !file || !pageOrder.trim()}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {loading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          )}
          {loading ? 'Reordering pages...' : 'Reorder Pages'}
        </button>

        {loading && (
          <div className="mt-6">
            <LoadingSpinner />
          </div>
        )}

        {isReady && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
            <p>File converted successfully. Download started automatically. You can download it again below.</p>
            {downloadUrl && (
              <button
                type="button"
                onClick={handleDownloadAgain}
                className="mt-2 inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Download Again
              </button>
            )}
          </div>
        )}

        {result && !isReady && (
          <div className="mt-6">
            <ResultCard result={result} onReset={() => { setResult(null); setFile(null); setPageOrder(''); clearDownload(); }} action="reordered" />
          </div>
        )}
      </div>
    </div>
    </>
  );
}
