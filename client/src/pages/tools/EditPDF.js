import React, { useState } from 'react';
import FileUploader from '../../components/FileUploader';
import LoadingSpinner from '../../components/LoadingSpinner';
import ResultCard from '../../components/ResultCard';
import { handleToolSubmit, useDownloadHandler } from '../../services/api';
import SEO from '../../components/SEO';

export default function EditPDF() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [editText, setEditText] = useState('');
  const { downloadUrl, isReady, setDownload, clearDownload, handleDownloadAgain } = useDownloadHandler();

  const handleProcess = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    setResult(null);
    clearDownload();

    try {
      const edits = editText.trim()
        ? [{ type: 'text', text: editText.trim(), pageIndex: 0, x: 50, y: 50 }]
        : [{ type: 'text', text: 'Edited', pageIndex: 0, x: 50, y: 50 }];

      const formData = new FormData();
      formData.append('file', file);
      formData.append('edits', JSON.stringify(edits));
      const data = await handleToolSubmit('/pdf/edit-pdf', formData, 'edited.pdf');
      setResult(data);
      if (data.blobUrl) {
        setDownload(data.blobUrl, data.filename || 'edited.pdf');
      }
    } catch (err) {
      setError(err.message || 'Failed to edit PDF.');
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
          onFilesSelected={(f) => { setFile(f[0] || null); setError(''); setResult(null); clearDownload(); }}
        />

        {file && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Text to add (first page)</label>
            <input
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              placeholder="Enter text to add to the PDF"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>
        )}

        {file && !loading && (
          <button
            onClick={handleProcess}
            className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
          >
            Edit PDF
          </button>
        )}

        {loading && <LoadingSpinner />}

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {isReady && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
            <p>PDF edited successfully. Download started automatically. You can download it again below.</p>
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

        {result && !isReady && (
          <div className="mt-6">
            <ResultCard result={result} onReset={() => { setResult(null); setFile(null); setEditText(''); clearDownload(); }} action="edited" />
          </div>
        )}
      </div>
    </div>
    </>
  );
}
