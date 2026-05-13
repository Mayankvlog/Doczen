import React, { useState, useEffect } from 'react';
import FileUploader from '../../components/FileUploader';
import LoadingSpinner from '../../components/LoadingSpinner';
import ResultCard from '../../components/ResultCard';
import { handleToolSubmit } from '../../services/api';
import SEO from '../../components/SEO';

export default function PDFToTXT() {
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
      const data = await handleToolSubmit('/pdf/pdf-to-txt', formData, 'extracted.txt');
      setResult(data);
      if (data.blobUrl) {
        setDownloadUrl(data.blobUrl);
        setDownloadName(data.filename || 'extracted.txt');
        setSuccessMessage('File extracted successfully. Download started automatically. You can download it again below.');
      }
    } catch (err) {
      setError(err.message || 'Text extraction failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <SEO title="PDF to TXT - Extract Text from PDF Free" description="Extract text from PDF files online for free. Convert PDF to plain text with Doczen's PDF text extractor." keywords="PDF to TXT, extract text from PDF, PDF text extraction, convert PDF to text, PDF to plain text" canonical="/pdf-to-txt" />
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">PDF to TXT</h1>
        <p className="mt-2 text-gray-600">
          Extract all text content from your PDF file.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <FileUploader
          accept=".pdf"
          label="Upload PDF file"
          onFilesSelected={(f) => { setFile(f[0] || null); setError(''); setResult(null); setSuccessMessage(''); }}
        />

        {file && !loading && (
          <button
            onClick={handleProcess}
            className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
          >
            Extract Text
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
            <ResultCard result={result} onReset={() => { setResult(null); setFile(null); setSuccessMessage(''); }} action="extracted" />
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
    <SEO title="PDF to TXT - Extract Text from PDF Free" description="Convert PDF documents to plain text files online for free. Extract all text content from any PDF with Doczen." keywords="PDF to TXT, convert PDF to text, PDF text extraction, PDF to plain text" canonical="/pdf-to-txt" />
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">PDF to Text</h1>
        <p className="mt-2 text-gray-600">
          Extract all text content from your PDF into a plain text file.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <FileUploader
          accept=".pdf"
          label="Upload PDF file"
          onFilesSelected={(f) => { setFile(f[0] || null); setError(''); }}
        />

        {file && !loading && (
          <button
            onClick={handleProcess}
            className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
          >
            Extract Text
          </button>
        )}

        {loading && <LoadingSpinner />}

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {result && <ResultCard result={result} onReset={() => { setResult(null); setFile(null); }} action="converted to text" />}
      </div>
    </div>
    </>
  );
}
