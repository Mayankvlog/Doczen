import { Link } from 'react-router-dom';
import { useLanguage } from '../index';

export default function ToolCard({ emoji, icon, title, desc, description, path, link }) {
  const { t } = useLanguage();
  return (
    <Link
      to={path || link}
      className="group relative flex flex-col items-start p-6 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1.5 active:scale-[0.98] transition-all duration-300 cursor-pointer overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/0 to-purple-600/0 group-hover:from-indigo-600/[0.03] group-hover:to-purple-600/[0.03] transition-all duration-500" />
      <div className="w-12 h-12 flex items-center justify-center rounded-xl text-xl bg-gradient-to-br from-indigo-50 to-purple-50 group-hover:from-indigo-100 group-hover:to-purple-100 transition-all duration-300 group-hover:scale-110 group-hover:rotate-[-5deg]">
        {emoji || icon}
      </div>
      <h3 className="mt-4 text-base font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors duration-300">
        {title}
      </h3>
      <p className="mt-1.5 text-sm text-gray-500 leading-relaxed group-hover:text-gray-600 transition-colors duration-300">
        {desc || description}
      </p>
      <span className="mt-4 text-sm font-medium text-indigo-600 flex items-center gap-1 group-hover:gap-2 transition-all duration-300">
        {t('tool.tryNow', 'Try now')}
        <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </span>
    </Link>
  );
}
