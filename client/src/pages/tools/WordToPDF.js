import React, { useState } from 'react';
import FileUploader from '../../components/FileUploader';
import LoadingSpinner from '../../components/LoadingSpinner';
import ResultCard from '../../components/ResultCard';
import { pdfAPI } from '../../services/api';
import SEO from '../../components/SEO';

export default function WordToPDF() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');

  const handleProcess = async () => {
    if (!file) return;
        setLoading(true);
    setError('');
    setTimeout(() => {
      setResult({
        message: 'Word to PDF conversion coming soon!',
        info: `"${file.name}" (${(file.size / 1024).toFixed(1)} KB) — .doc / .docx support is under development.`,
      });
      setLoading(false);
    }, 1200);
  };

  const handleNotify = (e) => {
    e.preventDefault();
    setResult((prev) => ({
      ...prev,
      notified: true,
      message: `We'll notify you at ${email} when Word to PDF is ready!`,
    }));
  };

  return (
    <>
    <SEO title="Word to PDF Converter Online Free" description="Convert Word documents to PDF format online for free. DOCX to PDF converter by Doczen." keywords="Word to PDF, convert Word to PDF, DOCX to PDF, DOC to PDF, Word document to PDF" canonical="/word-to-pdf" />
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Word to PDF</h1>
        <p className="mt-2 text-gray-600">
          Convert Word documents (.doc / .docx) to PDF format seamlessly.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <FileUploader
          accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          label="Upload Word document"
          onFilesSelected={(f) => { setFile(f[0] || null); setError(''); setResult(null); }}
        />

        {file && !loading && (
          <button
            onClick={handleProcess}
            className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
          >
            Convert to PDF
          </button>
        )}

        {loading && <LoadingSpinner />}

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-6">
            <ResultCard result={result} onReset={() => { setResult(null); setFile(null); }} action="converted to PDF" />
            {!result.notified && (
              <form onSubmit={handleNotify} className="mt-4 flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Notify Me
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
    </>
  );
}
