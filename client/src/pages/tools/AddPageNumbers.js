import { useState } from 'react';
import FileUploader from '../../components/FileUploader';
import LoadingSpinner from '../../components/LoadingSpinner';
import ResultCard from '../../components/ResultCard';
import { handleToolSubmit, useDownloadHandler } from '../../services/api';
import SEO from '../../components/SEO';

export default function AddPageNumbers() {
  const [file, setFile] = useState(null);
  const [startNumber, setStartNumber] = useState(1);
  const [fontSize, setFontSize] = useState(12);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const { downloadUrl, isReady, setDownload, clearDownload, handleDownloadAgain } = useDownloadHandler();

  const handleProcess = async () => {
    if (!file) {
      setError('Please select a PDF file.');
      return;
    }
    if (startNumber < 1) {
      setError('Start number must be at least 1.');
      return;
    }
    if (fontSize < 6 || fontSize > 72) {
      setError('Font size must be between 6 and 72.');
      return;
    }
    setError('');
    setLoading(true);
    setResult(null);
    clearDownload();

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('startNumber', startNumber);
      formData.append('fontSize', fontSize);
      const data = await handleToolSubmit('/pdf/add-page-numbers', formData, 'numbered.pdf');
      setResult(data);
      if (data.blobUrl) {
        setDownload(data.blobUrl, data.filename || 'numbered.pdf');
      }
    } catch (err) {
      setError(err.message || 'Failed to add page numbers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <SEO title="Add Page Numbers to PDF Online Free" description="Add page numbers to your PDF documents online for free. Customize position, font size, and starting number." keywords="add page numbers to PDF, PDF page numbers, insert page numbers, PDF numbering" canonical="/add-page-numbers" />
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-primary-50/30 to-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-100 mb-4">
            <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2zm0 0l5-5 5 5M7 3h10" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Add Page Numbers</h1>
          <p className="text-lg text-gray-600 mt-2">Insert page numbers into your PDF document</p>
        </div>

        <div className="card mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Upload PDF</h2>
          <FileUploader
            accept=".pdf"
            onFilesSelected={(selected) => { setFile(selected[0] || null); setError(''); setResult(null); clearDownload(); }}
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
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Page Number Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Number</label>
              <input
                type="number"
                min="1"
                value={startNumber}
                onChange={(e) => setStartNumber(parseInt(e.target.value) || 1)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Font Size</label>
              <input
                type="number"
                min="6"
                max="72"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value) || 12)}
                className="input-field"
              />
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
          disabled={loading || !file}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {loading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2zm0 0l5-5 5 5M7 3h10" />
            </svg>
          )}
          {loading ? 'Adding page numbers...' : 'Add Page Numbers'}
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
            <ResultCard result={result} onReset={() => { setResult(null); setFile(null); clearDownload(); }} action="numbered" />
          </div>
        )}
      </div>
    </div>
    </>
  );
}
