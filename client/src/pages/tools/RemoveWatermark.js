import { useState } from 'react';
import FileUploader from '../../components/FileUploader';
import LoadingSpinner from '../../components/LoadingSpinner';
import ResultCard from '../../components/ResultCard';
import { handleToolSubmit, useDownloadHandler } from '../../services/api';
import SEO from '../../components/SEO';
import { useLanguage } from '../../index';

export default function RemoveWatermark() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [watermarkText, setWatermarkText] = useState('');
  const [mode, setMode] = useState('auto');
  const [removalResult, setRemovalResult] = useState(null);
  const { downloadUrl, isReady, setDownload, clearDownload, handleDownloadAgain } = useDownloadHandler();
  const { t } = useLanguage();
  const MODES = [
    { value: 'auto', label: t('tool.modeAuto', 'Auto'), description: t('tool.modeAutoDesc', 'Try all removal strategies') },
    { value: 'text', label: t('tool.modeText', 'Text'), description: t('tool.modeTextDesc', 'Target text-based watermarks only') },
  ];
  const modes = [
    { value: 'auto', label: t('tool.modeAuto', 'Auto'), description: t('tool.modeAutoDesc', 'Try all removal strategies') },
    { value: 'text', label: t('tool.modeText', 'Text'), description: t('tool.modeTextDesc', 'Target text-based watermarks only') },
  ];

  const handleProcess = async () => {
    if (!file) {
      setError(t('tool.selectPdfRemoveWatermark', 'Please select a PDF file to remove watermark from.'));
      return;
    }
    setError('');
    setLoading(true);
    setResult(null);
    setRemovalResult(null);
    clearDownload();

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (watermarkText.trim()) formData.append('text', watermarkText.trim());
      formData.append('mode', mode);
      const data = await handleToolSubmit('/pdf/remove-watermark', formData, 'watermark_removed.pdf');
      setResult(data);
      if (data.blobUrl) {
        setRemovalResult({ status: 'removed', pagesModified: data.pagesModified });
        setDownload(data.blobUrl, data.filename || 'watermark_removed.pdf');
      }
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('not removable') || msg.includes('flattened') || msg.includes('embedded')) {
        setRemovalResult({ status: 'not_removable', message: msg });
      } else {
        setError(msg || t('tool.watermarkRemoveError', 'Failed to remove watermark. Please try again.'));
      }
    } finally {
      setLoading(false);
    }
  };

  const getResultMessage = () => {
    if (!removalResult) return null;
    if (removalResult.status === 'removed') {
      return { type: 'success', title: t('tool.watermarkRemoved', 'Watermark Removed'), text: t('tool.watermarkRemovedDesc', 'The watermark has been successfully removed from your PDF.') };
    }
    if (removalResult.status === 'not_removable') {
      return { type: 'warning', title: t('tool.couldNotRemove', 'Could Not Auto-Remove'), text: removalResult.message || t('tool.couldNotRemoveDesc', 'This watermark appears to be flattened or embedded in the page content and cannot be automatically removed.') };
    }
    return null;
  };

  return (
    <>
    <SEO title={t('tool.removeWatermarkSeoTitle', 'Remove Watermark from PDF Online Free')} description={t('tool.removeWatermarkSeoDesc', 'Remove watermarks from PDF files online for free. Clean your PDF documents by removing text and image watermarks with Doczen.')} keywords={t('tool.removeWatermarkSeoKeywords', 'remove watermark from PDF, delete PDF watermark, PDF watermark remover, clean PDF, remove text from PDF')} canonical="/remove-watermark" />
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-primary-50/30 to-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-100 mb-4">
            <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4m16 0a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2v-6a2 2 0 012-2m16 0V6a2 2 0 00-2-2H6a2 2 0 00-2 2v4" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{t('tool.removeWatermark', 'Remove Watermark')}</h1>
          <p className="text-lg text-gray-600 mt-2">{t('tool.removeWatermarkDesc2', 'Remove text and image watermarks from your PDF documents')}</p>
        </div>

        <div className="card mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">{t('tool.uploadPdf', 'Upload PDF')}</h2>
          <FileUploader
            accept=".pdf"
            onFilesSelected={(selected) => { setFile(selected[0] || null); setError(''); setResult(null); setRemovalResult(null); clearDownload(); }}
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

        <div className="card mb-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">{t('tool.options', 'Options')}</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('tool.watermarkTextOptional', 'Watermark Text')} <span className="text-gray-400">{t('tool.watermarkOptional', '(optional)')}</span>
            </label>
            <input
              type="text"
              value={watermarkText}
              onChange={(e) => setWatermarkText(e.target.value)}
              placeholder="e.g. CONFIDENTIAL, DRAFT, SAMPLE"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
            />
            <p className="text-xs text-gray-400 mt-1">{t('tool.watermarkHelp', 'Known watermark text helps detection')}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('tool.mode', 'Mode')}</label>
            <div className="grid grid-cols-2 gap-3">
              {modes.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setMode(m.value)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    mode === m.value
                      ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-sm font-medium text-gray-800">{m.label}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{m.description}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {removalResult && getResultMessage() && (
          <div className={`mb-6 p-4 border rounded-xl text-sm flex items-start gap-3 ${
            getResultMessage().type === 'success'
              ? 'bg-green-50 border-green-200 text-green-700'
              : 'bg-amber-50 border-amber-200 text-amber-700'
          }`}>
            <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {getResultMessage().type === 'success' ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              )}
            </svg>
            <div>
              <div className="font-medium">{getResultMessage().title}</div>
              <div className="mt-1">{getResultMessage().text}</div>
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

        <div className="card mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">{t('tool.watermarkRemoval', 'About Watermark Removal')}</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            {t('tool.watermarkRemovalDesc', 'This tool uses multiple strategies to detect and remove watermarks from your PDF documents. It scans for structured watermark artifacts, recurring overlay objects, and text-based watermarks. Results may vary depending on how the watermark was embedded. Flattened or scanned watermarks cannot always be automatically removed.')}
          </p>
        </div>

        <button
          onClick={handleProcess}
          disabled={loading || !file}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {loading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4m16 0a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2v-6a2 2 0 012-2m16 0V6a2 2 0 00-2-2H6a2 2 0 00-2 2v4" />
            </svg>
          )}
          {loading ? t('tool.removingWatermark', 'Removing Watermark...') : t('tool.removeWatermark', 'Remove Watermark')}
        </button>

        {loading && (
          <div className="mt-6">
            <LoadingSpinner />
          </div>
        )}

        {isReady && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
            <p>{t('tool.cleanedDesc', 'Your cleaned PDF is ready. Download started automatically.')}</p>
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
            <ResultCard result={result} onReset={() => { setResult(null); setFile(null); setRemovalResult(null); clearDownload(); }} action={t('tool.watermarkRemovedResult', 'watermark removed')} />
          </div>
        )}
      </div>
    </div>
    </>
  );
}
