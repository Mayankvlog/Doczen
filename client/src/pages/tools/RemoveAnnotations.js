import { useState } from 'react';
import FileUploader from '../../components/FileUploader';
import LoadingSpinner from '../../components/LoadingSpinner';
import ResultCard from '../../components/ResultCard';
import { handleToolSubmit, useDownloadHandler } from '../../services/api';
import SEO from '../../components/SEO';
import { useLanguage } from '../../index';

export default function RemoveAnnotations() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const { downloadUrl, isReady, setDownload, clearDownload, handleDownloadAgain } = useDownloadHandler();
  const { t } = useLanguage();

  const handleProcess = async () => {
    if (!file) {
      setError(t('tool.selectPdfError', 'Please select a PDF file.'));
      return;
    }
    setError('');
    setLoading(true);
    setResult(null);
    clearDownload();

    try {
      const formData = new FormData();
      formData.append('file', file);
      const data = await handleToolSubmit('/pdf/remove-annotations', formData, 'cleaned.pdf');
      setResult(data);
      if (data.blobUrl) {
        setDownload(data.blobUrl, data.filename || 'cleaned.pdf');
      }
    } catch (err) {
      setError(err.message || t('tool.failedRemoveAnnotations', 'Failed to remove annotations. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <SEO title={t('tool.removeAnnotationsSeoTitle', 'Remove Annotations from PDF Online Free')} description={t('tool.removeAnnotationsSeoDesc', 'Remove comments, highlights, and markup from PDF files online for free. Clean up your PDF with Doczen.')} keywords={t('tool.removeAnnotationsSeoKeywords', 'remove PDF annotations, delete PDF comments, clear PDF markup, PDF cleanup, remove PDF highlights')} canonical="/remove-annotations" />
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-primary-50/30 to-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-100 mb-4">
            <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{t('tool.removeAnnotations', 'Remove Annotations')}</h1>
          <p className="text-lg text-gray-600 mt-2">{t('tool.removeAnnotationsDesc2', 'Remove comments, highlights, and markup from your PDF')}</p>
        </div>

        <div className="card mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">{t('tool.uploadPdf', 'Upload PDF')}</h2>
          <FileUploader
            accept=".pdf"
            onFilesSelected={(selected) => { setFile(selected[0] || null); setError(''); setResult(null); clearDownload(); }}
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
          <h2 className="text-lg font-semibold text-gray-800 mb-4">{t('tool.aboutAnnotations', 'About This Tool')}</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            {t('tool.annotationsDesc', 'This tool removes all annotations from your PDF, including comments, highlights, sticky notes, text boxes, and other markup. The document content itself remains untouched. Use this to clean up reviewed documents before final distribution.')}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        <button
          onClick={handleProcess}
          disabled={loading || !file}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {loading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
          )}
          {loading ? t('tool.removingAnnotations', 'Removing Annotations...') : t('tool.removeAnnotations', 'Remove Annotations')}
        </button>

        {loading && (
          <div className="mt-6">
            <LoadingSpinner />
          </div>
        )}

        {isReady && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
            <p>{t('tool.success', 'File converted successfully. Download started automatically. You can download it again below.')}</p>
            {downloadUrl && (
              <button
                type="button"
                onClick={handleDownloadAgain}
                className="mt-2 inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {t('tool.downloadAgain', 'Download Again')}
              </button>
            )}
          </div>
        )}

        {result && !isReady && (
          <div className="mt-6">
            <ResultCard result={result} onReset={() => { setResult(null); setFile(null); clearDownload(); }} action={t('tool.annotationsRemoved', 'annotations removed')} />
          </div>
        )}
      </div>
    </div>
    </>
  );
}
