import React, { useState } from 'react';
import FileUploader from '../../components/FileUploader';
import LoadingSpinner from '../../components/LoadingSpinner';
import ResultCard from '../../components/ResultCard';
import { pdfAPI } from '../../services/api';
import SEO from '../../components/SEO';

export default function EditPDF() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleProcess = async () => {
    if (!file) return;
        setLoading(true);
    setError('');
    try {
      const { data } = await pdfAPI.getPageCount(file);
      setResult({
        message: `"${file.name}" loaded — ${data.pageCount || 'N/A'} page(s) detected.`,
        info: 'Full PDF editing with annotations, text editing, and drawing tools requires a client-side PDF library. Server-side editing support is in development.',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load file.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <SEO title="Edit PDF Online Free - Edit PDF Files" description="Edit PDF files online for free. Add text, images, and annotations to your PDF documents with Doczen." keywords="edit PDF, PDF editor, edit PDF online, modify PDF, annotate PDF" canonical="/edit-pdf" />
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit PDF</h1>
        <p className="mt-2 text-gray-600">
          Add annotations, highlights, shapes, and text to your PDF documents.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <FileUploader
          accept=".pdf"
          label="Upload PDF to edit"
          onFilesSelected={(f) => { setFile(f); setError(''); setResult(null); }}
        />

        {file && !loading && (
          <button
            onClick={handleProcess}
            className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
          >
            Load PDF
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
            <ResultCard result={result} onReset={() => { setResult(null); setFile(null); }} action="loaded" />
            <div className="grid grid-cols-2 gap-3">
              {['Add Text', 'Highlight', 'Draw', 'Shapes', 'Sticky Notes', 'Signature'].map((tool) => (
                <div
                  key={tool}
                  className="p-3 border border-gray-200 rounded-lg text-center text-sm text-gray-500 bg-gray-50 cursor-not-allowed"
                >
                  {tool}
                  <span className="block text-xs text-indigo-400 mt-1">coming soon</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 text-center">
              Annotation tools will be available once a client-side PDF renderer is integrated.
            </p>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
