import React, { useState } from 'react';
import FileUploader from '../../components/FileUploader';
import LoadingSpinner from '../../components/LoadingSpinner';
import ResultCard from '../../components/ResultCard';
import { pdfAPI } from '../../services/api';
import SEO from '../../components/SEO';

export default function PDFToWord() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');

  const handleProcess = async () => {
    if (!file) return;
        setLoading(true);
    setError('');
    try {
      await pdfAPI.getPageCount(file);
      setResult({
        message: 'PDF to Word conversion is coming soon!',
        info: `"${file.name}" (${(file.size / 1024).toFixed(1)} KB) received. We are building the most accurate Word conversion engine. Leave your email to get notified.`,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleNotify = (e) => {
    e.preventDefault();
    setResult((prev) => ({
      ...prev,
      notified: true,
      message: `You'll be notified at ${email} when PDF to Word is ready!`,
    }));
  };

  return (
    <>
    <SEO title="PDF to Word Converter Online Free" description="Convert PDF files to editable Word documents online for free. Doczen PDF to Word converter preserves formatting." keywords="PDF to Word, convert PDF to Word, PDF to DOCX, PDF to DOC, PDF converter" canonical="/pdf-to-word" />
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">PDF to Word</h1>
        <p className="mt-2 text-gray-600">
          Convert your PDF files into editable Word documents.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <FileUploader
          accept=".pdf"
          label="Upload PDF file"
          onFilesSelected={(f) => { setFile(f); setError(''); setResult(null); }}
        />

        {file && !loading && (
          <button
            onClick={handleProcess}
            className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
          >
            Convert to Word
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
            <ResultCard result={result} onReset={() => { setResult(null); setFile(null); }} action="converted" />
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
