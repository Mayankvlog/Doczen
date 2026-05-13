import { useState } from 'react';
import FileUploader from '../../components/FileUploader';
import LoadingSpinner from '../../components/LoadingSpinner';
import ResultCard from '../../components/ResultCard';
import { handleToolSubmit, useDownloadHandler } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import SEO from '../../components/SEO';

export default function MergePDF() {
  const toast = useToast();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const { downloadUrl, isReady, setDownload, clearDownload, handleDownloadAgain } = useDownloadHandler();
  const [progress, setProgress] = useState(null);

  const handleProcess = async () => {
    if (files.length < 2) {
      setError('Please select at least 2 PDF files to merge.');
      toast.error('Please select at least 2 PDF files to merge.');
      return;
    }
    setError('');
    setLoading(true);
    setResult(null);
    clearDownload();
    setProgress(0);

    try {
      const formData = new FormData();
      files.forEach((f) => formData.append('files', f));
      const data = await handleToolSubmit('/pdf/merge', formData, 'merged.pdf');
      setResult(data);
      toast.success('PDFs merged successfully!');
      if (data.blobUrl) {
        setDownload(data.blobUrl, data.filename || 'merged.pdf');
      }
    } catch (err) {
      const msg = err.message || 'Failed to merge PDFs. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
      setProgress(null);
    }
  };

  return (
    <>
    <SEO title="Merge PDF Online - Combine PDF Files Free" description="Merge multiple PDF files into one document online for free. Combine PDFs instantly with Doczen's easy-to-use PDF merger tool." keywords="merge PDF, combine PDF, join PDF files, PDF merger, merge PDF online free" canonical="/merge-pdf" />
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-primary-50/30 to-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10 animate-fade-in-down">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-100 mb-4">
            <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M8 8l4-4 4 4m-4 4V3" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Merge PDF</h1>
          <p className="text-lg text-gray-600 mt-2">Combine multiple PDF files into a single document</p>
        </div>

        <div className="card mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Upload PDFs</h2>
          <FileUploader
            multiple
            accept=".pdf"
            onFilesSelected={(selected) => setFiles(selected)}
            progress={progress}
          />
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2 animate-shake">
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        <button
          onClick={handleProcess}
          disabled={loading || files.length < 2}
          className="btn-primary w-full flex items-center justify-center gap-2 animate-fade-in-up"
          style={{ animationDelay: '0.2s' }}
        >
          {loading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M8 8l4-4 4 4m-4 4V3" />
            </svg>
          )}
          {loading ? 'Merging PDFs...' : 'Merge PDFs'}
        </button>

        {loading && !progress && (
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
            <ResultCard result={result} onReset={() => { setResult(null); setFiles([]); clearDownload(); }} action="merged" />
          </div>
        )}
      </div>
    </div>
    </>
  );
}
