import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navLinks = [
  { label: 'Home', path: '/' },
  {
    label: 'All Tools',
    path: '#',
    dropdown: [
      { label: 'Merge PDF', path: '/merge-pdf' },
      { label: 'Split PDF', path: '/split-pdf' },
      { label: 'Compress PDF', path: '/compress-pdf' },
      { label: 'Rotate PDF', path: '/rotate-pdf' },
      { label: 'Protect PDF', path: '/protect-pdf' },
      { label: 'Unlock PDF', path: '/unlock-pdf' },
      { label: 'Add Page Numbers', path: '/add-page-numbers' },
      { label: 'Add Watermark', path: '/add-watermark' },
      { label: 'Extract Text', path: '/extract-text' },
      { label: 'Reorder Pages', path: '/reorder-pages' },
      { label: 'Delete Pages', path: '/delete-pages' },
      { label: 'PDF to JPG', path: '/pdf-to-jpg' },
      { label: 'JPG to PDF', path: '/jpg-to-pdf' },
      { label: 'PDF to TXT', path: '/pdf-to-txt' },
      { label: 'PDF to Word', path: '/pdf-to-word' },
      { label: 'Word to PDF', path: '/word-to-pdf' },
      { label: 'PDF to PPT', path: '/pdf-to-ppt' },
      { label: 'PPT to PDF', path: '/ppt-to-pdf' },
      { label: 'PDF to Excel', path: '/pdf-to-excel' },
      { label: 'Excel to PDF', path: '/excel-to-pdf' },
      { label: 'Edit PDF', path: '/edit-pdf' },
      { label: 'Sign PDF', path: '/sign-pdf' },
      { label: 'Repair PDF', path: '/repair-pdf' },
      { label: 'PDF to PDF/A', path: '/pdf-to-pdfa' },
      { label: 'PDF Metadata', path: '/pdf-metadata' },
      { label: 'Flatten PDF', path: '/flatten-pdf' },
      { label: 'HTML to PDF', path: '/html-to-pdf' },
      { label: 'Redact PDF', path: '/redact-pdf' },
      { label: 'Remove Annotations', path: '/remove-annotations' },
      { label: 'Remove Watermark', path: '/remove-watermark' },
      { label: 'Compare PDF', path: '/compare-pdf' },
    ],
  },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          <Link to="/" className="flex items-center gap-2 shrink-0">
            <span className="text-2xl">📄</span>
            <span className="text-xl font-bold text-indigo-600">Doczen</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) =>
              link.dropdown ? (
                <div key={link.label} ref={dropdownRef} className="relative">
                  <button
                    onClick={() => setDropdownOpen((prev) => !prev)}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                  >
                    {link.label}
                    <svg className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {dropdownOpen && (
                    <div className="absolute top-full right-0 mt-1 w-56 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-50">
                      {link.dropdown.map((item) => (
                        <Link
                          key={item.label}
                          to={item.path}
                          onClick={() => setDropdownOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={link.label}
                  to={link.path}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                >
                  {link.label}
                </Link>
              )
            )}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div ref={userMenuRef} className="relative">
                <button
                  onClick={() => setUserMenuOpen((prev) => !prev)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-indigo-50 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-semibold">
                    {user.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <svg className={`w-4 h-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {userMenuOpen && (
                  <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-50">
                    <Link to="/dashboard" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 transition-colors">
                      Dashboard
                    </Link>
                    <Link to="/history" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 transition-colors">
                      History
                    </Link>
                    <hr className="my-1 border-gray-100" />
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors">
                  Login
                </Link>
                <Link to="/register" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">
                  Register
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-indigo-50 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) =>
              link.dropdown ? (
                <div key={link.label}>
                  <div className="px-3 py-2 text-sm font-medium text-gray-400 uppercase tracking-wider">
                    {link.label}
                  </div>
                  <div className="ml-4 space-y-1">
                    {link.dropdown.map((item) => (
                      <Link
                        key={item.label}
                        to={item.path}
                        onClick={() => setMobileOpen(false)}
                        className="block px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  key={link.label}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                >
                  {link.label}
                </Link>
              )
            )}
            <hr className="my-2 border-gray-100" />
            {user ? (
              <>
                <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500">
                  <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-semibold">
                    {user.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  {user.email}
                </div>
                <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-indigo-50 transition-colors">Dashboard</Link>
                <Link to="/history" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-indigo-50 transition-colors">History</Link>
                <button onClick={handleLogout} className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-indigo-50 transition-colors">Login</Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-white bg-indigo-600 text-center mt-1 hover:bg-indigo-700 transition-colors">Register</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
