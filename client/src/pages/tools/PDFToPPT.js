import React, { useState } from 'react';
import FileUploader from '../../components/FileUploader';
import LoadingSpinner from '../../components/LoadingSpinner';
import ResultCard from '../../components/ResultCard';
import { pdfAPI } from '../../services/api';
import SEO from '../../components/SEO';

export default function PDFToPPT() {
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
      const response = await pdfAPI.pdfToPpt(file);
      const { fileName } = response.data;

      const blob = await pdfAPI.downloadAsBlob(fileName);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      setResult(response.data);
    } catch (err) {
      let msg = 'Conversion failed. Please try again.';
      if (err.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          msg = JSON.parse(text).message || msg;
        } catch (e) { /* ignore */ }
      } else {
        msg = err.response?.data?.message || err.message || msg;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleNotify = (e) => {
    e.preventDefault();
    setResult((prev) => ({
      ...prev,
      notified: true,
      message: `We'll email ${email} when PDF to PPT is available!`,
    }));
  };

  return (
    <>
    <SEO title="PDF to PPT Converter Online Free" description="Convert PDF files to PowerPoint presentations online for free. PDF to PPT converter by Doczen." keywords="PDF to PPT, convert PDF to PowerPoint, PDF to presentation, PDF to slides" canonical="/pdf-to-ppt" />
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">PDF to PowerPoint</h1>
        <p className="mt-2 text-gray-600">
          Turn your PDF slides into editable PowerPoint presentations.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <FileUploader
          accept=".pdf"
          label="Upload PDF file"
          onFilesSelected={(f) => { setFile(f[0] || null); setError(''); setResult(null); }}
        />

        {file && !loading && (
          <button
            onClick={handleProcess}
            className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
          >
            Convert to PPT
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
