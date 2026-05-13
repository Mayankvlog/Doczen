export default function LoadingSpinner({ message, size = 'md' }) {
  const containerSize = size === 'sm' ? 'w-6 h-6' : 'w-10 h-10';
  const borderWidth = size === 'sm' ? 'border-2' : 'border-4';
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <div className={`relative ${containerSize}`}>
        <div className={`absolute inset-0 rounded-full ${borderWidth} border-indigo-100`} />
        <div className={`absolute inset-0 rounded-full ${borderWidth} border-transparent border-t-indigo-600 animate-spin`} />
      </div>
      {message && (
        <p className="text-sm text-gray-500 animate-pulse">{message}</p>
      )}
    </div>
  );
}
