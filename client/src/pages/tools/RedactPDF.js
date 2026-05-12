import { useState } from 'react';
import FileUploader from '../../components/FileUploader';
import LoadingSpinner from '../../components/LoadingSpinner';
import ResultCard from '../../components/ResultCard';
import { pdfAPI } from '../../services/api';
import SEO from '../../components/SEO';

export default function RedactPDF() {
  const [file, setFile] = useState(null);
  const [terms, setTerms] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleProcess = async () => {
    if (!file) {
      setError('Please select a PDF file to redact.');
      return;
    }
    if (!terms.trim()) {
      setError('Please enter at least one term to redact.');
      return;
    }
    setError('');
    setLoading(true);
    setResult(null);
    try {
      const redactions = terms.split('\n').filter((t) => t.trim()).map((t) => t.trim());
      const { data } = await pdfAPI.redact(file, redactions);
      setResult({ fileName: data.fileName, size: data.size, downloadUrl: data.downloadUrl, originalSize: data.originalSize });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to redact PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <SEO title="Redact PDF Online Free - Remove Sensitive Info" description="Redact sensitive information from PDF files online for free. Permanently remove confidential text with Doczen." keywords="redact PDF, PDF redaction, remove sensitive info from PDF, PDF blackout, confidential PDF" canonical="/redact-pdf" />
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-primary-50/30 to-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-100 mb-4">
            <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Redact PDF</h1>
          <p className="text-lg text-gray-600 mt-2">Permanently remove sensitive information from your PDF</p>
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
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Terms to Redact</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Enter words or phrases to redact (one per line)
            </label>
            <textarea
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              placeholder="confidential&#10;secret&#10;internal use only"
              rows={5}
              className="input-field font-mono text-sm resize-y"
            />
            <p className="mt-2 text-xs text-gray-500">
              Each term will be permanently blacked out wherever it appears in the document.
              This action cannot be undone, so please make a backup of your original PDF.
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
          disabled={loading || !file || !terms.trim()}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {loading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </svg>
          )}
          {loading ? 'Redacting PDF...' : 'Redact PDF'}
        </button>

        {loading && (
          <div className="mt-6">
            <LoadingSpinner />
          </div>
        )}

        {result && (
          <div className="mt-6">
            <ResultCard result={result} onReset={() => { setResult(null); setFile(null); setTerms(''); }} action="redacted" />
          </div>
        )}
      </div>
    </div>
    </>
  );
}
