import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useLanguage } from '../index';

const MAX_FILE_SIZE = 50 * 1024 * 1024;

const formatSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const parseAcceptExtensions = (accept) => {
  if (!accept) return ['.pdf'];
  return accept.split(',').map(s => s.trim()).filter(s => s.startsWith('.'));
};

export default function FileUploader({
  onFilesSelected,
  multiple = false,
  accept = 'application/pdf',
  maxFiles = 100,
  label = 'Upload your files',
  progress = null,
}) {
  const { t } = useLanguage();
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [shakeKey, setShakeKey] = useState(0);

  const triggerShake = () => setShakeKey((k) => k + 1);

  const allowedExts = parseAcceptExtensions(accept);
  const acceptPatterns = accept.split(',').map(s => s.trim());

  const isAcceptedFile = (file) => {
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (allowedExts.some(e => e === ext)) return true;
    for (const p of acceptPatterns) {
      if (p === file.type) return true;
      if (p.endsWith('/*') && file.type.startsWith(p.replace('/*', '/'))) return true;
    }
    return false;
  };

  const onDrop = useCallback(
    (accepted, rejected) => {
      setError('');

      const invalid = accepted.filter(f => !isAcceptedFile(f));
      if (invalid.length > 0 || rejected.length > 0) {
        setError(t('upload.error.invalidType', 'Invalid file type. Please upload a valid file.'));
        triggerShake();
        return;
      }

      const oversized = accepted.filter(f => f.size > MAX_FILE_SIZE);
      if (oversized.length > 0) {
        setError(t('upload.error.fileTooLarge', `File too large. Maximum size is 50MB. "${oversized[0].name}" is ${formatSize(oversized[0].size)}.`));
        triggerShake();
        return;
      }

      if (!multiple && accepted.length > 1) {
        setError(t('upload.error.singleFile', 'Only one file can be uploaded at a time.'));
        triggerShake();
        return;
      }

      if (files.length + accepted.length > maxFiles) {
        setError(t('upload.error.maxFiles', 'Maximum of {maxFiles} files allowed.', { maxFiles }));
        triggerShake();
        return;
      }

      const merged = multiple ? [...files, ...accepted] : accepted.slice(0, 1);
      setFiles(merged);
    },
    [files, multiple, maxFiles]
  );

  useEffect(() => {
    onFilesSelected?.(files);
  }, [files]);

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple,
    maxFiles,
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`relative flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${
          isDragActive
            ? 'border-indigo-500 bg-indigo-50 scale-[1.02] shadow-lg shadow-indigo-200'
            : files.length > 0
            ? 'border-green-300 bg-green-50/30 hover:border-indigo-400 hover:bg-indigo-50/50'
            : 'border-gray-300 bg-gray-50 hover:border-indigo-400 hover:bg-indigo-50/50'
        } ${error ? 'animate-shake' : ''}`}
        key={shakeKey}
      >
        <input {...getInputProps({ accept })} />
        <div className={`flex flex-col items-center gap-2 transition-colors ${isDragActive ? 'text-indigo-600' : files.length > 0 ? 'text-green-600' : 'text-gray-500'}`}>
          {isDragActive ? (
            <svg className="w-10 h-10 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          ) : files.length > 0 ? (
            <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          )}
          <p className="text-sm font-medium">
            {isDragActive ? t('upload.dragActive', 'Release to upload') : files.length > 0 ? t('upload.filesSelected', 'Files selected — drop more or click to change') : label}
          </p>
          <p className="text-xs text-gray-400">
            {isDragActive ? t('upload.dropActive', 'Great, drop them here!') : files.length > 0 ? t('upload.tapToAdd', 'Tap to add more files') : multiple ? t('upload.dragMultiple', 'Drag & drop up to {maxFiles} files here, or click to browse', { maxFiles }) : t('upload.dragSingle', 'Drag & drop a file here, or click to browse')}
          </p>
          <span className={`mt-1 px-3 py-1 text-xs font-medium rounded-full transition-colors ${isDragActive ? 'bg-indigo-200 text-indigo-700' : files.length > 0 ? 'bg-green-100 text-green-700' : 'bg-indigo-100 text-indigo-600'}`}>
            {accept}
          </span>
        </div>
      </div>

      {progress !== null && progress < 100 && (
        <div className="mt-4 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500 font-medium">{t('upload.uploading', 'Uploading...')}</span>
            <span className="text-indigo-600 font-semibold">{progress}%</span>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar-fill animate-progress" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {error && (
        <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2 flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}

      {files.length > 0 && (
        <ul className="mt-4 space-y-2">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${index}`}
              className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-200 group/file"
            >
              <div className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 text-sm font-semibold group-hover/file:bg-indigo-200 transition-colors">
                {file.name.split('.').pop().toUpperCase().slice(0, 3)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                <p className="text-xs text-gray-500">{formatSize(file.size)}</p>
              </div>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="shrink-0 p-1.5 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 hover:scale-110 active:scale-90 transition-all duration-200"
                title={t('upload.removeFile', 'Remove file')}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
