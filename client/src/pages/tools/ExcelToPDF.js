import React, { useState, useEffect } from 'react';
import FileUploader from '../../components/FileUploader';
import LoadingSpinner from '../../components/LoadingSpinner';
import ResultCard from '../../components/ResultCard';
import { handleToolSubmit } from '../../services/api';
import SEO from '../../components/SEO';

export default function ExcelToPDF() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [downloadName, setDownloadName] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    return () => {
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    };
  }, [downloadUrl]);

  const triggerDownload = (url, filename) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'downloaded-file';
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleDownloadAgain = () => {
    if (!downloadUrl) return;
    triggerDownload(downloadUrl, downloadName);
  };

  const handleProcess = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    setSuccessMessage('');

    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl('');
      setDownloadName('');
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      const data = await handleToolSubmit('/pdf/excel-to-pdf', formData, 'converted.pdf');
      setResult(data);
      if (data.blobUrl) {
        setDownloadUrl(data.blobUrl);
        setDownloadName(data.filename || 'converted.pdf');
        setSuccessMessage('File converted successfully. Download started automatically. You can download it again below.');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  
  return (
    <>
    <SEO title="Excel to PDF Converter Online Free" description="Convert Excel spreadsheets to PDF format online for free. XLSX to PDF converter by Doczen." keywords="Excel to PDF, convert Excel to PDF, XLSX to PDF, spreadsheet to PDF" canonical="/excel-to-pdf" />
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Excel to PDF</h1>
        <p className="mt-2 text-gray-600">
          Convert your Excel spreadsheets into PDF format.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <FileUploader
          accept=".xlsx,.xls"
          label="Upload Excel file"
          onFilesSelected={(f) => { setFile(f[0] || null); setError(''); setResult(null); setSuccessMessage(''); }}
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

        {successMessage && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
            <p>{successMessage}</p>
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

        {result && !successMessage && (
          <div className="mt-6">
            <ResultCard result={result} onReset={() => { setResult(null); setFile(null); setSuccessMessage(''); }} action="converted" />
          </div>
        )}
      </div>
    </div>
    </>
  );
}
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
          </div>
        )}
      </div>
    </div>
    </>
  );
}
