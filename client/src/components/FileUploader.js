import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';

function formatSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default function FileUploader({
  onFilesSelected,
  multiple = false,
  accept = 'application/pdf',
  maxFiles = 10,
  label = 'Upload your files',
}) {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');

  const allowedTypes = accept.split(',').map((t) => t.trim());

  const onDrop = useCallback(
    (accepted, rejected) => {
      setError('');

      if (rejected.length > 0) {
        const msg = rejected[0].errors?.[0]?.message || 'Invalid file type or size.';
        setError(msg);
        return;
      }

      if (!multiple && accepted.length > 1) {
        setError('Only one file can be uploaded at a time.');
        return;
      }

      if (files.length + accepted.length > maxFiles) {
        setError(`Maximum of ${maxFiles} files allowed.`);
        return;
      }

      const merged = multiple ? [...files, ...accepted] : accepted.slice(0, 1);
      setFiles(merged);
    },
    [files, multiple, maxFiles]
  );

  useEffect(() => {
    onFilesSelected?.(files);
  }, [files, onFilesSelected]);

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: Object.fromEntries(allowedTypes.map((t) => [t, []])),
    multiple,
    maxFiles,
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`relative flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${
          isDragActive
            ? 'border-indigo-500 bg-indigo-50 scale-[1.01]'
            : 'border-gray-300 bg-gray-50 hover:border-indigo-400 hover:bg-indigo-50/50'
        }`}
      >
        <input {...getInputProps()} />
        <div className={`flex flex-col items-center gap-2 transition-colors ${isDragActive ? 'text-indigo-600' : 'text-gray-500'}`}>
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-sm font-medium">
            {isDragActive ? 'Drop files here' : label}
          </p>
          <p className="text-xs text-gray-400">
            {multiple ? `Drag & drop up to ${maxFiles} PDFs here, or click to browse` : 'Drag & drop a PDF here, or click to browse'}
          </p>
          <span className="mt-1 px-3 py-1 text-xs font-medium text-indigo-600 bg-indigo-100 rounded-full">
            {accept}
          </span>
        </div>
      </div>

      {error && (
        <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
          {error}
        </p>
      )}

      {files.length > 0 && (
        <ul className="mt-4 space-y-2">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${index}`}
              className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm"
            >
              <div className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 text-sm font-semibold">
                PDF
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                <p className="text-xs text-gray-500">{formatSize(file.size)}</p>
              </div>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="shrink-0 p-1.5 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
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
