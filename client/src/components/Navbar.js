import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../index';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { lang, setLanguage, currentLang, LANGUAGE_MAP, t } = useLanguage();
  const navLinks = [
    { label: t('nav.home', 'Home'), path: '/' },
    { label: t('nav.about', 'About'), path: '/about' },
    {
      label: t('nav.allTools', 'All Tools'),
      path: '#',
      dropdown: [
        { label: t('tool.mergePdf', 'Merge PDF'), path: '/merge-pdf' },
        { label: t('tool.splitPdf', 'Split PDF'), path: '/split-pdf' },
        { label: t('tool.compressPdf', 'Compress PDF'), path: '/compress-pdf' },
        { label: t('tool.rotatePdf', 'Rotate PDF'), path: '/rotate-pdf' },
        { label: t('tool.protectPdf', 'Protect PDF'), path: '/protect-pdf' },
        { label: t('tool.unlockPdf', 'Unlock PDF'), path: '/unlock-pdf' },
        { label: t('tool.addPageNumbers', 'Add Page Numbers'), path: '/add-page-numbers' },
        { label: t('tool.addWatermark', 'Add Watermark'), path: '/add-watermark' },
        { label: t('tool.extractText', 'Extract Text'), path: '/extract-text' },
        { label: t('tool.reorderPages', 'Reorder Pages'), path: '/reorder-pages' },
        { label: t('tool.deletePages', 'Delete Pages'), path: '/delete-pages' },
        { label: t('tool.pdfToJpg', 'PDF to JPG'), path: '/pdf-to-jpg' },
        { label: t('tool.jpgToPdf', 'JPG to PDF'), path: '/jpg-to-pdf' },
        { label: t('tool.pdfToTxt', 'PDF to TXT'), path: '/pdf-to-txt' },
        { label: t('tool.pdfToWord', 'PDF to Word'), path: '/pdf-to-word' },
        { label: t('tool.wordToPdf', 'Word to PDF'), path: '/word-to-pdf' },
        { label: t('tool.pdfToPpt', 'PDF to PPT'), path: '/pdf-to-ppt' },
        { label: t('tool.pptToPdf', 'PPT to PDF'), path: '/ppt-to-pdf' },
        { label: t('tool.pdfToExcel', 'PDF to Excel'), path: '/pdf-to-excel' },
        { label: t('tool.excelToPdf', 'Excel to PDF'), path: '/excel-to-pdf' },
        { label: t('tool.editPdf', 'Edit PDF'), path: '/edit-pdf' },
        { label: t('tool.signPdf', 'Sign PDF'), path: '/sign-pdf' },
        { label: t('tool.repairPdf', 'Repair PDF'), path: '/repair-pdf' },
        { label: t('tool.pdfToPdfa', 'PDF to PDF/A'), path: '/pdf-to-pdfa' },
        { label: t('tool.pdfMetadata', 'PDF Metadata'), path: '/pdf-metadata' },
        { label: t('tool.flattenPdf', 'Flatten PDF'), path: '/flatten-pdf' },
        { label: t('tool.htmlToPdf', 'HTML to PDF'), path: '/html-to-pdf' },
        { label: t('tool.redactPdf', 'Redact PDF'), path: '/redact-pdf' },
        { label: t('tool.removeAnnotations', 'Remove Annotations'), path: '/remove-annotations' },
        { label: t('tool.removeWatermark', 'Remove Watermark'), path: '/remove-watermark' },
        { label: t('tool.comparePdf', 'Compare PDF'), path: '/compare-pdf' },
      ],
    },
  ];
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const dropdownRef = useRef(null);
  const userMenuRef = useRef(null);
  const langRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
      if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false);
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

          <div ref={langRef} className="hidden md:flex items-center relative">
            <button
              onClick={() => setLangOpen((prev) => !prev)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{currentLang.native}</span>
              <svg className={`w-3 h-3 transition-transform ${langOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {langOpen && (
              <div className="absolute top-full right-0 mt-1 max-h-80 w-64 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-50">
                {LANGUAGE_MAP.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => { setLanguage(l.code); setLangOpen(false); }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center justify-between ${
                      lang === l.code
                        ? 'text-indigo-600 bg-indigo-50 font-medium'
                        : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
                    }`}
                  >
                    <span>{l.native}</span>
                    <span className="text-xs text-gray-400">{l.name}</span>
                  </button>
                ))}
              </div>
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
                      {t('nav.dashboard', 'Dashboard')}
                    </Link>
                    <Link to="/history" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 transition-colors">
                      {t('nav.history', 'History')}
                    </Link>
                    <hr className="my-1 border-gray-100" />
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                      {t('nav.logout', 'Logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors">
                  {t('nav.login', 'Login')}
                </Link>
                <Link to="/register" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">
                  {t('nav.register', 'Register')}
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
            <div className="px-3 py-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t('nav.language', 'Language')}
              </div>
              <select
                value={lang}
                onChange={(e) => { setLanguage(e.target.value); setMobileOpen(false); }}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              >
                {LANGUAGE_MAP.map((l) => (
                  <option key={l.code} value={l.code}>{l.native} ({l.name})</option>
                ))}
              </select>
            </div>
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
                <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-indigo-50 transition-colors">{t('nav.dashboard', 'Dashboard')}</Link>
                <Link to="/history" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-indigo-50 transition-colors">{t('nav.history', 'History')}</Link>
                <button onClick={handleLogout} className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors">{t('nav.logout', 'Logout')}</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-indigo-50 transition-colors">{t('nav.login', 'Login')}</Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-white bg-indigo-600 text-center mt-1 hover:bg-indigo-700 transition-colors">{t('nav.register', 'Register')}</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
