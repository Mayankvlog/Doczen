import { useState } from 'react';
import FileUploader from '../../components/FileUploader';
import LoadingSpinner from '../../components/LoadingSpinner';
import ResultCard from '../../components/ResultCard';
import { handleToolSubmit, useDownloadHandler } from '../../services/api';
import SEO from '../../components/SEO';

export default function PDFToPPT() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const { downloadUrl, isReady, setDownload, clearDownload, handleDownloadAgain } = useDownloadHandler();
  const [error, setError] = useState('');

  const handleProcess = async () => {
    if (!file) return;
    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      const data = await handleToolSubmit('/pdf/pdf-to-ppt', formData, 'converted.pptx');
      setResult(data);

      if (data.blobUrl) {
        setDownload(data.blobUrl, data.filename || 'converted.pptx');
      }
    } catch (err) {
      const msg = err.message || 'Conversion failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <SEO title="PDF to PPT Converter Online Free" description="Convert PDF files to PowerPoint presentations online for free. PDF to PPT converter by Doczen." keywords="PDF to PPT, convert PDF to PowerPoint, PDF to presentation, PDF to slides" canonical="/pdf-to-ppt" />
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">PDF to PowerPoint</h1>
        <p className="mt-2 text-gray-600">
          Turn your PDF slides into editable PowerPoint presentations.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <FileUploader
          accept=".pdf"
          label="Upload PDF file"
          onFilesSelected={(f) => { setFile(f[0] || null); setError(''); setResult(null); clearDownload(); }}
        />

        {file && !loading && (
          <button
            onClick={handleProcess}
            className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
          >
            Convert to PPT
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
            <p>File converted successfully. Download started automatically. You can download it again below.</p>
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
            <ResultCard result={result} onReset={() => { setResult(null); setFile(null); clearDownload(); }} action="converted" />
          </div>
        )}
      </div>
    </div>
    </>
  );
}
