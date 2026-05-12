import { useState } from 'react';
import FileUploader from '../../components/FileUploader';
import LoadingSpinner from '../../components/LoadingSpinner';
import ResultCard from '../../components/ResultCard';
import { pdfAPI } from '../../services/api';
import SEO from '../../components/SEO';

export default function RepairPDF() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleProcess = async () => {
    if (!file) {
      setError('Please select a PDF file to repair.');
      return;
    }
    setError('');
    setLoading(true);
    setResult(null);
    try {
      const { data } = await pdfAPI.repair(file);
      setResult({ fileName: data.fileName, size: data.size, downloadUrl: data.downloadUrl, originalSize: data.originalSize });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to repair PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <SEO title="Repair PDF Online Free - Fix Corrupted PDF Files" description="Repair damaged or corrupted PDF files online for free. Fix PDF errors and recover your documents with Doczen." keywords="repair PDF, fix corrupted PDF, PDF repair tool, recover PDF, restore PDF" canonical="/repair-pdf" />
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-primary-50/30 to-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-100 mb-4">
            <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Repair PDF</h1>
          <p className="text-lg text-gray-600 mt-2">Fix corrupted or damaged PDF files and recover your documents</p>
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
          <h2 className="text-lg font-semibold text-gray-800 mb-4">About PDF Repair</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            This tool attempts to repair corrupted or damaged PDF files. It can fix common issues such as
            truncated files, cross-reference errors, and structural problems. Upload your damaged PDF and
            we will try to recover as much content as possible.
          </p>
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          )}
          {loading ? 'Repairing PDF...' : 'Repair PDF'}
        </button>

        {loading && (
          <div className="mt-6">
            <LoadingSpinner />
          </div>
        )}

        {result && (
          <div className="mt-6">
            <ResultCard result={result} onReset={() => { setResult(null); setFile(null); }} action="repaired" />
          </div>
        )}
      </div>
    </div>
    </>
  );
}
