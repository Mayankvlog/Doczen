import React, { useState } from 'react';
import FileUploader from '../../components/FileUploader';
import LoadingSpinner from '../../components/LoadingSpinner';
import ResultCard from '../../components/ResultCard';
import { pdfAPI } from '../../services/api';
import SEO from '../../components/SEO';

export default function SignPDF() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [signatureType, setSignatureType] = useState('type');

  const handleProcess = async () => {
    if (!file) return;
        setLoading(true);
    setError('');
    setTimeout(() => {
      setResult({
        message: `"${file.name}" ready for signing.`,
        info: 'Signature placement will be available once the PDF editing engine is integrated. Choose your signature style below.',
      });
      setLoading(false);
    }, 1000);
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
          onFilesSelected={(f) => { setFile(f); setError(''); setResult(null); }}
        />

        {file && !loading && (
          <button
            onClick={handleProcess}
            className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
          >
            Prepare for Signing
          </button>
        )}

        {loading && <LoadingSpinner />}

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-6 space-y-4">
            <ResultCard result={result} onReset={() => { setResult(null); setFile(null); }} action="prepared" />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Signature Method
              </label>
              <div className="flex gap-3">
                {['type', 'draw', 'upload'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setSignatureType(mode)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border capitalize transition-colors ${
                      signatureType === mode
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400'
                    }`}
                  >
                    {mode === 'type' ? 'Type' : mode === 'draw' ? 'Draw' : 'Upload Image'}
                  </button>
                ))}
              </div>
            </div>

            {signatureType === 'type' && (
              <div>
                <input
                  type="text"
                  placeholder="Type your signature..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-lg font-serif italic focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>
            )}

            {signatureType === 'draw' && (
              <div className="p-8 border-2 border-dashed border-gray-300 rounded-lg text-center text-gray-400 text-sm">
                Signature canvas — coming soon
              </div>
            )}

            {signatureType === 'upload' && (
              <div className="p-8 border-2 border-dashed border-gray-300 rounded-lg text-center text-gray-400 text-sm">
                Upload signature image — coming soon
              </div>
            )}

            <button className="w-full px-4 py-2 bg-gray-300 text-gray-500 font-medium rounded-lg cursor-not-allowed">
              Place Signature (coming soon)
            </button>

            <p className="text-xs text-gray-400 text-center">
              Full signature placement requires a client-side PDF rendering library.
            </p>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
