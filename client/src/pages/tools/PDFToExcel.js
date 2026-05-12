import React, { useState } from 'react';
import FileUploader from '../../components/FileUploader';
import LoadingSpinner from '../../components/LoadingSpinner';
import ResultCard from '../../components/ResultCard';
import { pdfAPI } from '../../services/api';
import SEO from '../../components/SEO';

export default function PDFToExcel() {
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
      const response = await pdfAPI.pdfToExcel(file);
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
      let msg = 'Something went wrong.';
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

  
  return (
    <>
    <SEO title="PDF to Excel Converter Online Free" description="Convert PDF tables to Excel spreadsheets online for free. PDF to XLSX converter by Doczen." keywords="PDF to Excel, convert PDF to Excel, PDF to XLS, PDF to spreadsheet, extract PDF tables" canonical="/pdf-to-excel" />
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">PDF to Excel</h1>
        <p className="mt-2 text-gray-600">
          Extract tables and data from PDF files into editable Excel spreadsheets.
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
            Convert to Excel
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
          </div>
        )}
      </div>
    </div>
    </>
  );
}
