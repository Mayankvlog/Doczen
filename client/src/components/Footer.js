import { Link } from 'react-router-dom';
import { useLanguage } from '../index';

export default function Footer() {
  const { t } = useLanguage();
  const quickLinks = [
    { label: t('nav.tools.merge', 'Merge PDF'), path: '/merge-pdf' },
    { label: t('nav.tools.split', 'Split PDF'), path: '/split-pdf' },
    { label: t('nav.tools.compress', 'Compress PDF'), path: '/compress-pdf' },
    { label: t('nav.tools.pdfToWord', 'PDF to Word'), path: '/pdf-to-word' },
    { label: t('nav.tools.wordToPdf', 'Word to PDF'), path: '/word-to-pdf' },
    { label: t('nav.tools.pdfToJpg', 'PDF to JPG'), path: '/pdf-to-jpg' },
    { label: t('nav.tools.rotate', 'Rotate PDF'), path: '/rotate-pdf' },
    { label: t('nav.tools.addWatermark', 'Add Watermark'), path: '/add-watermark' },
  ];
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-950 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">

          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <span className="text-xl font-bold text-white">Doczen</span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
              {t('footer.tagline', 'The simplest way to edit, convert, and manage your PDF documents online. Fast, secure, and free.')}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              {t('footer.quickLinks', 'Quick Links')}
            </h3>
            <ul className="space-y-2.5">
              {quickLinks.slice(0, 4).map((link) => (
                <li key={link.label}>
                  <Link to={link.path} className="text-sm text-gray-400 hover:text-indigo-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              {t('footer.moreTools', 'More Tools')}
            </h3>
            <ul className="space-y-2.5">
              {quickLinks.slice(4).map((link) => (
                <li key={link.label}>
                  <Link to={link.path} className="text-sm text-gray-400 hover:text-indigo-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              {t('footer.company', 'Company')}
            </h3>
            <ul className="space-y-2.5">
              {[t('footer.about', 'About'), t('footer.privacy', 'Privacy Policy'), t('footer.terms', 'Terms of Service')].map((item) => (
                <li key={item}>
                  <Link to={`/${item.toLowerCase().replace(/\s+/g, '-')}`} className="text-sm text-gray-400 hover:text-indigo-400 transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        <div className="mt-10 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Doczen. {t('footer.copyright', 'All rights reserved.')}
          </p>
          <p className="text-xs text-gray-600">
            {t('footer.builtWith', 'Built with ❤️ for PDFs')}
          </p>
        </div>

      </div>
    </footer>
  );
}
