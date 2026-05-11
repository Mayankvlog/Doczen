import React, { useState } from 'react';
import FileUploader from '../../components/FileUploader';
import LoadingSpinner from '../../components/LoadingSpinner';
import ResultCard from '../../components/ResultCard';
import { pdfAPI } from '../../services/api';
import SEO from '../../components/SEO';

export default function PDFToJPG() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleProcess = async () => {
    if (!file) return;
        setLoading(true);
    setError('');
    try {
      const { data } = await pdfAPI.pdfToJpg(file);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Conversion failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <SEO title="PDF to JPG - Convert PDF Pages to Images Free" description="Convert PDF pages to high-quality JPG images online for free. Extract images from PDF documents with Doczen." keywords="PDF to JPG, convert PDF to image, PDF to JPEG, PDF to picture, extract PDF pages as images" canonical="/pdf-to-jpg" />
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">PDF to JPG</h1>
        <p className="mt-2 text-gray-600">
          Convert each page of your PDF into a high-quality JPG image.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <FileUploader
          accept=".pdf"
          label="Upload PDF file"
          onFilesSelected={(f) => { setFile(f); setError(''); }}
        />

        {file && !loading && (
          <button
            onClick={handleProcess}
            className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
          >
            Convert to JPG
          </button>
        )}

        {loading && <LoadingSpinner />}

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {result && <ResultCard result={result} onReset={() => { setResult(null); setFile(null); }} action="converted to JPG" />}
      </div>
    </div>
    </>
  );
}
