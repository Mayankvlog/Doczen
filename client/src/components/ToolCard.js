import { Link } from 'react-router-dom';

export default function ToolCard({ emoji, icon, title, desc, description, path, link, color = 'bg-indigo-100' }) {
  return (
    <Link
      to={path || link}
      className="group relative flex flex-col items-start p-6 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
    >
      <div className="w-12 h-12 flex items-center justify-center rounded-xl text-xl">
        {emoji || icon}
      </div>
      <h3 className="mt-4 text-base font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
        {title}
      </h3>
      <p className="mt-1.5 text-sm text-gray-500 leading-relaxed">
        {desc || description}
      </p>
      <span className="mt-4 text-sm font-medium text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
        Try now
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </span>
    </Link>
  );
}
