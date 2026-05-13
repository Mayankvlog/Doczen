import { useState } from 'react';
import FileUploader from '../../components/FileUploader';
import LoadingSpinner from '../../components/LoadingSpinner';
import ResultCard from '../../components/ResultCard';
import { handleToolSubmit } from '../../services/api';
import SEO from '../../components/SEO';

export default function ComparePDF() {
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [comparison, setComparison] = useState(null);

  const handleProcess = async () => {
    if (!file1 || !file2) {
      setError('Please select both PDF files to compare.');
      return;
    }
    setError('');
    setLoading(true);
    setComparison(null);
    try {
      const formData = new FormData();
      formData.append('files', file1);
      formData.append('files', file2);
      const data = await handleToolSubmit('/pdf/compare', formData);
      setComparison(data);
    } catch (err) {
      setError(err.message || 'Failed to compare PDFs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <>
    <SEO title="Compare PDF Files Online Free" description="Compare two PDF files online for free. Find differences in page count, size, and structure with Doczen's PDF comparison tool." keywords="compare PDF, PDF comparison, diff PDF, PDF differences, compare two PDF files" canonical="/compare-pdf" />
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-primary-50/30 to-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-100 mb-4">
            <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Compare PDF</h1>
          <p className="text-lg text-gray-600 mt-2">Compare two PDF files and find differences</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">First PDF</h2>
            <FileUploader
              accept=".pdf"
              label="Upload first PDF"
              onFilesSelected={(selected) => setFile1(selected[0] || null)}
            />
            {file1 && (
              <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4 text-primary-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="truncate">{file1.name}</span>
              </div>
            )}
          </div>
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Second PDF</h2>
            <FileUploader
              accept=".pdf"
              label="Upload second PDF"
              onFilesSelected={(selected) => setFile2(selected[0] || null)}
            />
            {file2 && (
              <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4 text-primary-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="truncate">{file2.name}</span>
              </div>
            )}
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
          disabled={loading || !file1 || !file2}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {loading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {loading ? 'Comparing PDFs...' : 'Compare PDFs'}
        </button>

        {loading && (
          <div className="mt-6">
            <LoadingSpinner />
          </div>
        )}

        {comparison && (
          <div className="mt-6 card">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Comparison Results</h2>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Page Count (File 1)</span>
                <span className="text-sm font-medium text-gray-900">{comparison.file1?.pageCount || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Page Count (File 2)</span>
                <span className="text-sm font-medium text-gray-900">{comparison.file2?.pageCount || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">File Size</span>
                <span className="text-sm font-medium text-gray-900">{formatSize(comparison.originalSize)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Identical</span>
                <span className={`text-sm font-medium ${comparison.isIdentical ? 'text-green-600' : 'text-red-600'}`}>
                  {comparison.isIdentical ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sm text-gray-500">Differences Found</span>
                <span className="text-sm font-medium text-gray-900">{comparison.differences?.length || 0}</span>
              </div>
              {comparison.differences && comparison.differences.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Differences:</h3>
                  <ul className="space-y-1">
                    {comparison.differences.map((diff, idx) => (
                      <li key={idx} className="text-xs text-gray-600 bg-gray-50 rounded px-3 py-1.5">
                        {diff}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
