
function formatSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function getRatioColor(ratio) {
  if (ratio >= 0.9) return 'text-red-600 bg-red-50';
  if (ratio >= 0.7) return 'text-yellow-600 bg-yellow-50';
  return 'text-green-600 bg-green-50';
}

export default function ResultCard({ result, onReset, action = 'processed', onDownloadAgain, downloadAgainLabel }) {
  if (!result) return null;

  const { fileName, filename, size, originalSize, success } = result;
  const displayName = fileName || filename || '';
  const compressionRatio = originalSize && size ? size / originalSize : null;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-lg shadow-green-100/50 p-6 space-y-5 animate-scale-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-green-100 text-green-600 animate-success-check">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900 capitalize">{action}</h3>
          <p className="text-xs text-gray-500">Your file was successfully {action}.</p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-4 space-y-2">
        {displayName && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">File</span>
            <span className="font-medium text-gray-900 truncate max-w-[200px]">{displayName}</span>
          </div>
        )}
        {size && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Size</span>
            <span className="font-medium text-gray-900">{formatSize(size)}</span>
          </div>
        )}
        {compressionRatio !== null && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Compression</span>
            <span className={`font-medium px-2 py-0.5 rounded-full text-xs ${getRatioColor(compressionRatio)}`}>
              {originalSize && size
                ? `${((1 - compressionRatio) * 100).toFixed(0)}% smaller`
                : '-'}
            </span>
          </div>
        )}
        {originalSize && size && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Original</span>
            <span className="font-medium text-gray-900">{formatSize(originalSize)}</span>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        {onDownloadAgain && (
          <button
            type="button"
            onClick={onDownloadAgain}
            className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-all duration-200 active:scale-[0.98]"
          >
            {downloadAgainLabel || 'Download Again'}
          </button>
        )}
        <button
          onClick={onReset}
          className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 hover:border-indigo-300 hover:text-indigo-600 active:scale-[0.98] transition-all duration-200"
        >
          Process Another
        </button>
      </div>
    </div>
  );
}
