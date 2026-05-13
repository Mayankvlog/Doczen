import React, { useState } from 'react';
import FileUploader from '../../components/FileUploader';
import LoadingSpinner from '../../components/LoadingSpinner';
import ResultCard from '../../components/ResultCard';
import { handleToolSubmit } from '../../services/api';
import SEO from '../../components/SEO';

export default function JPGToPDF() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleProcess = async () => {
    if (!files.length) return;
        setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      files.forEach((f) => formData.append('files', f));
      const data = await handleToolSubmit('/pdf/jpg-to-pdf', formData, 'converted.pdf');
      setResult(data);
    } catch (err) {
      setError(err.message || 'Conversion failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <SEO title="JPG to PDF - Convert Images to PDF Free" description="Convert JPG images to PDF documents online for free. Create PDF from multiple images with Doczen." keywords="JPG to PDF, image to PDF, convert JPG to PDF, pictures to PDF, make PDF from images" canonical="/jpg-to-pdf" />
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">JPG to PDF</h1>
        <p className="mt-2 text-gray-600">
          Combine multiple JPG images into a single PDF document.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <FileUploader
          accept="image/*"
          multiple
          label="Upload JPG images"
          onFilesSelected={(f) => { setFiles(Array.isArray(f) ? f : [f]); setError(''); }}
        />

        {files.length > 0 && !loading && (
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

        {result && <ResultCard result={result} onReset={() => { setResult(null); setFiles([]); }} action="converted to PDF" />}
      </div>
    </div>
    </>
  );
}
