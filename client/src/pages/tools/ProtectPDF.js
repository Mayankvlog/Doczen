import { useState } from 'react';
import FileUploader from '../../components/FileUploader';
import LoadingSpinner from '../../components/LoadingSpinner';
import ResultCard from '../../components/ResultCard';
import { pdfAPI } from '../../services/api';
import SEO from '../../components/SEO';

export default function ProtectPDF() {
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleProcess = async () => {
    if (!file) {
      setError('Please select a PDF file to protect.');
      return;
    }
    if (!password) {
      setError('Please enter a password.');
      return;
    }
    if (password.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setLoading(true);
    setResult(null);
    try {
      const { data } = await pdfAPI.protect(file, password);
      setResult({ fileName: data.fileName, size: data.size, downloadUrl: data.downloadUrl, originalSize: data.originalSize });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to protect PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <SEO title="Protect PDF - Add Password to PDF Free" description="Add password protection to your PDF files online for free. Secure your PDF documents with encryption using Doczen." keywords="protect PDF, password protect PDF, PDF security, encrypt PDF, lock PDF with password" canonical="/protect-pdf" />
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-primary-50/30 to-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-100 mb-4">
            <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Protect PDF</h1>
          <p className="text-lg text-gray-600 mt-2">Add password protection to your PDF documents</p>
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
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Set Password</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter a strong password"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter the password"
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
          disabled={loading || !file || !password || !confirmPassword}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {loading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          )}
          {loading ? 'Protecting PDF...' : 'Protect PDF'}
        </button>

        {loading && (
          <div className="mt-6">
            <LoadingSpinner />
          </div>
        )}

        {result && (
          <div className="mt-6">
            <ResultCard result={result} onReset={() => { setResult(null); setFile(null); setPassword(''); setConfirmPassword(''); }} action="protected with password" />
          </div>
        )}
      </div>
    </div>
    </>
  );
}
