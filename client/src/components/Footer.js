import { Link } from 'react-router-dom';

const quickLinks = [
  { label: 'Merge PDF', path: '/merge-pdf' },
  { label: 'Split PDF', path: '/split-pdf' },
  { label: 'Compress PDF', path: '/compress-pdf' },
  { label: 'PDF to Word', path: '/pdf-to-word' },
  { label: 'Word to PDF', path: '/word-to-pdf' },
  { label: 'PDF to JPG', path: '/pdf-to-jpg' },
  { label: 'Rotate PDF', path: '/rotate-pdf' },
  { label: 'Add Watermark', path: '/add-watermark' },
];

const socialLinks = [
  { label: 'Twitter', icon: '𝕏', href: 'https://twitter.com/doczen' },
  { label: 'GitHub', icon: '🐙', href: 'https://github.com/doczen' },
  { label: 'LinkedIn', icon: '🔗', href: 'https://linkedin.com/company/doczen' },
  { label: 'YouTube', icon: '▶', href: 'https://youtube.com/@doczen' },
];

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-950 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">

          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <span className="text-2xl">📄</span>
              <span className="text-xl font-bold text-white">Doczen</span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
              The simplest way to edit, convert, and manage your PDF documents online. Fast, secure, and free.
            </p>
            <div className="flex items-center gap-3 mt-5">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-800 hover:bg-indigo-600 text-gray-400 hover:text-white transition-colors text-sm"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Quick Links
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
              More Tools
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
              Company
            </h3>
            <ul className="space-y-2.5">
              {['About', 'Privacy Policy', 'Terms of Service', 'Contact'].map((item) => (
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
            &copy; {new Date().getFullYear()} Doczen. All rights reserved.
          </p>
          <p className="text-xs text-gray-600">
            Built with ❤️ for PDFs
          </p>
        </div>

      </div>
    </footer>
  );
}
