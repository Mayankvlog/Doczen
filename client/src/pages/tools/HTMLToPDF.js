import { useState } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';
import ResultCard from '../../components/ResultCard';
const API_BASE = process.env.REACT_APP_API_URL || '';
import SEO from '../../components/SEO';

export default function HTMLToPDF() {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('Document');
  const [fontSize, setFontSize] = useState(12);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const { downloadUrl, isReady, setDownload, clearDownload, handleDownloadAgain } = useDownloadHandler();

  const handleProcess = async () => {
    if (!content.trim()) {
      setError('Please enter HTML or text content to convert.');
      return;
    }
    setError('');
    setLoading(true);
    setResult(null);
    clearDownload();

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/pdf/html-to-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ content: content.trim(), title, fontSize })
      });

      if (!response.ok) {
        let msg = 'Conversion failed';
        try { const err = await response.json(); msg = err.message || msg; } catch (_) {}
        throw new Error(msg);
      }

      const blob = await response.blob();
      if (!blob || blob.size === 0) throw new Error('Server returned empty file');

      const blobUrl = window.URL.createObjectURL(blob);
      const filename = 'converted.pdf';

      setDownload(blobUrl, filename);
      setResult({ success: true, filename });
    } catch (err) {
      setError(err.message || 'Failed to convert to PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <SEO title="HTML to PDF Converter Online Free" description="Convert HTML and text content to PDF documents online for free. Create PDF from text with Doczen." keywords="HTML to PDF, text to PDF, convert HTML to PDF, create PDF from text, web page to PDF" canonical="/html-to-pdf" />
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-primary-50/30 to-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-100 mb-4">
            <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">HTML to PDF</h1>
          <p className="text-lg text-gray-600 mt-2">Convert HTML and text content into a PDF document</p>
        </div>

        <div className="card mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Content</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Enter HTML or plain text
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="<h1>Hello World</h1><p>Your content here...</p>"
              rows={10}
              className="input-field font-mono text-sm resize-y"
            />
          </div>
        </div>

        <div className="card mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Document Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Document Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Document"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Font Size</label>
              <select
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                className="input-field"
              >
                <option value={10}>10px</option>
                <option value={11}>11px</option>
                <option value={12}>12px</option>
                <option value={13}>13px</option>
                <option value={14}>14px</option>
                <option value={16}>16px</option>
                <option value={18}>18px</option>
                <option value={20}>20px</option>
              </select>
            </div>
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
          disabled={loading || !content.trim()}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {loading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          )}
          {loading ? 'Converting to PDF...' : 'Convert to PDF'}
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
            <ResultCard result={result} onReset={() => { setResult(null); setContent(''); }} action="converted to PDF" />
          </div>
        )}
      </div>
    </div>
    </>
  );
}
