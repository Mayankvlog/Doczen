import React, { useState } from 'react';
import FileUploader from '../../components/FileUploader';
import LoadingSpinner from '../../components/LoadingSpinner';
import ResultCard from '../../components/ResultCard';
import { pdfAPI } from '../../services/api';
import SEO from '../../components/SEO';

export default function ExcelToPDF() {
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
        message: 'Excel to PDF conversion coming soon!',
        info: `"${file.name}" (${(file.size / 1024).toFixed(1)} KB) — spreadsheet-to-PDF conversion with layout fidelity is in the works.`,
      });
      setLoading(false);
    }, 1200);
  };

  const handleNotify = (e) => {
    e.preventDefault();
    setResult((prev) => ({
      ...prev,
      notified: true,
      message: `We'll email ${email} when Excel to PDF is available!`,
    }));
  };

  return (
    <>
    <SEO title="Excel to PDF Converter Online Free" description="Convert Excel spreadsheets to PDF format online for free. XLSX to PDF converter by Doczen." keywords="Excel to PDF, convert Excel to PDF, XLSX to PDF, spreadsheet to PDF" canonical="/excel-to-pdf" />
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Excel to PDF</h1>
        <p className="mt-2 text-gray-600">
          Convert Excel spreadsheets (.xls / .xlsx) to PDF format.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <FileUploader
          accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          label="Upload Excel file"
          onFilesSelected={(f) => { setFile(f); setError(''); setResult(null); }}
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
