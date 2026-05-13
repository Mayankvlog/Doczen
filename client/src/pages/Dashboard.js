import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { historyAPI } from '../services/api';
import SEO from '../components/SEO';

const quickActions = [
  { emoji: '🔗', label: 'Merge PDF', path: '/merge-pdf', color: 'bg-indigo-500' },
  { emoji: '✂️', label: 'Split PDF', path: '/split-pdf', color: 'bg-blue-500' },
  { emoji: '📦', label: 'Compress', path: '/compress-pdf', color: 'bg-emerald-500' },
  { emoji: '🔄', label: 'Rotate', path: '/rotate-pdf', color: 'bg-amber-500' },
  { emoji: '📄', label: 'JPG to PDF', path: '/jpg-to-pdf', color: 'bg-teal-500' },
  { emoji: '✏️', label: 'Edit PDF', path: '/edit-pdf', color: 'bg-rose-500' },
];

const actionColors = {
  merge: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300',
  split: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
  compress: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
  rotate: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
  protect: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
  unlock: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
  'add-page-numbers': 'bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300',
  'add-watermark': 'bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300',
  'extract-text': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300',
  'reorder-pages': 'bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300',
  'delete-pages': 'bg-gray-100 text-gray-700 dark:bg-gray-900/50 dark:text-gray-300',
  'pdf-to-jpg': 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300',
  'jpg-to-pdf': 'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300',
  'pdf-to-txt': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300',
  'pdf-to-word': 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
  'word-to-pdf': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300',
  'pdf-to-ppt': 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
  'ppt-to-pdf': 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/50 dark:text-fuchsia-300',
  'pdf-to-excel': 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
  'excel-to-pdf': 'bg-lime-100 text-lime-700 dark:bg-lime-900/50 dark:text-lime-300',
  editPdf: 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300',
  signPdf: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
};

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();

  const [recentActivity, setRecentActivity] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const { data } = await historyAPI.getAll(1);
        setRecentActivity(data.history?.slice(0, 5) || []);
      } catch {
        setRecentActivity([]);
      } finally {
        setLoadingHistory(false);
      }
    };
    fetchRecent();
  }, []);

  if (authLoading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  const filesToday = user?.dailyFileCount ?? 0;
  const dailyLimit = user?.dailyLimit ?? 10000;
  const storageUsed = user?.storageUsed ? Math.round(user.storageUsed / (1024 * 1024)) : 0;
  const storageLimit = user?.storageLimit ? Math.round(user.storageLimit / (1024 * 1024)) : 500;

  return (
    <>
    <SEO
  title="Dashboard - Doczen PDF Editor"
  description="Your Doczen dashboard. View usage stats, recent activity, and quick access to all PDF tools."
  keywords="dashboard, PDF tools, Doczen account, file management"
  canonical="/dashboard"
  noIndex
/>
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
          Welcome back{user?.name ? `, ${user.name}` : ''} 👋
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Here&apos;s what&apos;s happening with your documents today.
        </p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Files Today</span>
            <span className="text-xs font-medium text-gray-400">{filesToday}/{dailyLimit}</span>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{filesToday}</span>
              <span className="text-sm text-gray-400">/ {dailyLimit}</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-gray-100 dark:bg-gray-800">
              <div
                className="h-2 rounded-full bg-indigo-500 transition-all"
                style={{ width: `${Math.min((filesToday / dailyLimit) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Storage Used</span>
            <span className="text-xs font-medium text-gray-400">{storageUsed}MB / {storageLimit}MB</span>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{storageUsed}</span>
              <span className="text-sm text-gray-400">MB</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-gray-100 dark:bg-gray-800">
              <div
                className="h-2 rounded-full bg-emerald-500 transition-all"
                style={{ width: `${Math.min((storageUsed / storageLimit) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>

      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
          {quickActions.map((action) => (
            <Link
              key={action.path}
              to={action.path}
              className="flex flex-col items-center gap-2 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${action.color} text-white text-lg`}>
                {action.emoji}
              </div>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
          <Link
            to="/history"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
          >
            View All
          </Link>
        </div>

        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
          {loadingHistory ? (
            <div className="flex items-center justify-center py-12">
              <svg className="animate-spin h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          ) : recentActivity.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-400">
              No activity yet. Start by using one of the tools above!
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {recentActivity.map((item) => (
                <div key={item._id} className="flex items-center gap-4 px-5 py-4">
                  <span
                    className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium capitalize ${
                      actionColors[item.action] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                    }`}
                  >
                    {item.action?.replace(/-/g, ' ')}
                  </span>
                  <span className="flex-1 truncate text-sm text-gray-600 dark:text-gray-300">
                    {item.fileName || item.outputFiles?.[0]?.originalName || item.inputFiles?.[0]?.originalName || 'Untitled'}
                  </span>
                  <span className="text-xs text-gray-400">
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      item.status === 'completed'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
                        : item.status === 'failed'
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300'
                    }`}
                  >
                    {item.status || 'pending'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
