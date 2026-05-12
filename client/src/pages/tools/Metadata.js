import { useState } from 'react';
import FileUploader from '../../components/FileUploader';
import LoadingSpinner from '../../components/LoadingSpinner';
import ResultCard from '../../components/ResultCard';
import { pdfAPI } from '../../services/api';
import SEO from '../../components/SEO';

export default function Metadata() {
  const [file, setFile] = useState(null);
  const [mode, setMode] = useState('read');
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [subject, setSubject] = useState('');
  const [keywords, setKeywords] = useState('');
  const [metadataData, setMetadataData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleRead = async () => {
    if (!file) {
      setError('Please select a PDF file.');
      return;
    }
    setError('');
    setLoading(true);
    setMetadataData(null);
    try {
      const { data } = await pdfAPI.readMetadata(file);
      setMetadataData(data.metadata);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to read metadata. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleWrite = async () => {
    if (!file) {
      setError('Please select a PDF file.');
      return;
    }
    setError('');
    setLoading(true);
    setResult(null);
    try {
      const { data } = await pdfAPI.writeMetadata(file, { title, author, subject, keywords });
      setResult({ fileName: data.fileName, size: data.size, downloadUrl: data.downloadUrl, originalSize: data.originalSize });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to write metadata. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <SEO title="Edit PDF Metadata Online Free - PDF Properties Editor" description="View and edit PDF metadata online for free. Change PDF title, author, subject, and keywords with Doczen." keywords="PDF metadata, edit PDF properties, PDF info, PDF title author, PDF document info" canonical="/pdf-metadata" />
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-primary-50/30 to-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-100 mb-4">
            <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">PDF Metadata</h1>
          <p className="text-lg text-gray-600 mt-2">View and edit PDF document properties</p>
        </div>

        <div className="card mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Upload PDF</h2>
          <FileUploader
            accept=".pdf"
            onFilesSelected={(selected) => setFile(selected[0] || null)}
          />
          {file && (
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
              <svg className="w-4 h-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {file.name}
            </div>
          )}
        </div>

        <div className="card mb-6">
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => { setMode('read'); setMetadataData(null); setResult(null); setError(''); }}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors ${
                mode === 'read'
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Read Metadata
              </div>
            </button>
            <button
              onClick={() => { setMode('write'); setMetadataData(null); setResult(null); setError(''); }}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors ${
                mode === 'write'
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Write Metadata
              </div>
            </button>
          </div>

          {mode === 'read' ? (
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Upload a PDF to view its metadata including title, author, subject, keywords, page count, and page sizes.
              </p>
              <button
                onClick={handleRead}
                disabled={loading || !file}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
                {loading ? 'Reading Metadata...' : 'Read Metadata'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Document title"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Author name"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Document subject"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Keywords</label>
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="keyword1, keyword2, keyword3"
                  className="input-field"
                />
              </div>
              <button
                onClick={handleWrite}
                disabled={loading || !file}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                )}
                {loading ? 'Updating Metadata...' : 'Update Metadata'}
              </button>
            </div>
          )}
        </div>

        {metadataData && (
          <div className="card mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Document Metadata</h2>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Title</span>
                <span className="text-sm font-medium text-gray-900">{metadataData.title || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Author</span>
                <span className="text-sm font-medium text-gray-900">{metadataData.author || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Subject</span>
                <span className="text-sm font-medium text-gray-900">{metadataData.subject || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Keywords</span>
                <span className="text-sm font-medium text-gray-900">{metadataData.keywords || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Page Count</span>
                <span className="text-sm font-medium text-gray-900">{metadataData.pageCount || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sm text-gray-500">Page Sizes</span>
                <span className="text-sm font-medium text-gray-900">{metadataData.pageSizes || 'N/A'}</span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {loading && (
          <div className="mt-6">
            <LoadingSpinner />
          </div>
        )}

        {result && (
          <div className="mt-6">
            <ResultCard result={result} onReset={() => { setResult(null); setFile(null); setMetadataData(null); }} action="processed" />
          </div>
        )}
      </div>
    </div>
    </>
  );
}
