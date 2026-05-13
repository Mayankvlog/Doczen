import { useState } from 'react';
import FileUploader from '../../components/FileUploader';
import LoadingSpinner from '../../components/LoadingSpinner';
import ResultCard from '../../components/ResultCard';
import { handleToolSubmit, useDownloadHandler } from '../../services/api';
import SEO from '../../components/SEO';

export default function SignPDF() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [signatureText, setSignatureText] = useState('');
  const { downloadUrl, isReady, setDownload, clearDownload, handleDownloadAgain } = useDownloadHandler();

  const handleProcess = async () => {
    if (!file) return;
    if (!signatureText.trim()) {
      setError('Please type or enter signature text.');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    clearDownload();

    try {
      const signature = { text: signatureText.trim(), pageIndex: 0 };
      const formData = new FormData();
      formData.append('file', file);
      formData.append('signature', JSON.stringify(signature));
      const data = await handleToolSubmit('/pdf/sign-pdf', formData, 'signed.pdf');
      setResult(data);
      if (data.blobUrl) {
        setDownload(data.blobUrl, data.filename || 'signed.pdf');
      }
    } catch (err) {
      setError(err.message || 'Failed to sign PDF.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <SEO title="Sign PDF Online - Add Signature to PDF Free" description="Sign PDF documents online for free. Add your signature to PDF files electronically with Doczen." keywords="sign PDF, PDF signature, electronic signature, sign document online, digital signature PDF" canonical="/sign-pdf" />
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Sign PDF</h1>
        <p className="mt-2 text-gray-600">
          Add your signature to PDF documents quickly and securely.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <FileUploader
          accept=".pdf"
          label="Upload PDF to sign"
          onFilesSelected={(f) => { setFile(f[0] || null); setError(''); setResult(null); clearDownload(); }}
        />

        {file && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Signature Text</label>
            <input
              type="text"
              value={signatureText}
              onChange={(e) => setSignatureText(e.target.value)}
              placeholder="Type your signature..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-lg font-serif italic focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>
        )}

        {file && !loading && (
          <button
            onClick={handleProcess}
            disabled={!signatureText.trim()}
            className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            Sign PDF
          </button>
        )}

        {loading && <LoadingSpinner />}

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {isReady && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
            <p>PDF signed successfully. Download started automatically. You can download it again below.</p>
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
            <ResultCard result={result} onReset={() => { setResult(null); setFile(null); setSignatureText(''); clearDownload(); }} action="signed" />
          </div>
        )}
      </div>
    </div>
    </>
  );
}
