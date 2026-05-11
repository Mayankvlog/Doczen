import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ToolCard from '../components/ToolCard';
import SEO from '../components/SEO';

const tools = [
  { emoji: '🔗', color: 'from-indigo-500 to-purple-600', title: 'Merge PDF', desc: 'Combine multiple PDFs into one file instantly.', path: '/merge-pdf' },
  { emoji: '✂️', color: 'from-blue-500 to-cyan-600', title: 'Split PDF', desc: 'Split a PDF into separate documents by pages.', path: '/split-pdf' },
  { emoji: '📦', color: 'from-emerald-500 to-teal-600', title: 'Compress PDF', desc: 'Reduce PDF file size without quality loss.', path: '/compress-pdf' },
  { emoji: '🔄', color: 'from-amber-500 to-orange-600', title: 'Rotate PDF', desc: 'Rotate pages in your PDF to any angle.', path: '/rotate-pdf' },
  { emoji: '🔐', color: 'from-red-500 to-rose-600', title: 'Protect PDF', desc: 'Add a password to secure your PDF files.', path: '/protect-pdf' },
  { emoji: '🔓', color: 'from-green-500 to-lime-600', title: 'Unlock PDF', desc: 'Remove password protection from PDFs.', path: '/unlock-pdf' },
  { emoji: '🔢', color: 'from-violet-500 to-fuchsia-600', title: 'Add Page Numbers', desc: 'Insert page numbers into your PDF document.', path: '/add-page-numbers' },
  { emoji: '💧', color: 'from-sky-500 to-indigo-600', title: 'Add Watermark', desc: 'Add text or image watermarks to PDFs.', path: '/add-watermark' },
  { emoji: '📝', color: 'from-yellow-500 to-amber-600', title: 'Extract Text', desc: 'Extract all text content from a PDF file.', path: '/extract-text' },
  { emoji: '📑', color: 'from-pink-500 to-rose-600', title: 'Reorder Pages', desc: 'Arrange PDF pages in the order you need.', path: '/reorder-pages' },
  { emoji: '🗑️', color: 'from-gray-500 to-slate-600', title: 'Delete Pages', desc: 'Remove unwanted pages from your PDF.', path: '/delete-pages' },
  { emoji: '🖼️', color: 'from-orange-500 to-red-600', title: 'PDF to JPG', desc: 'Convert PDF pages to high-quality JPG images.', path: '/pdf-to-jpg' },
  { emoji: '📄', color: 'from-teal-500 to-emerald-600', title: 'JPG to PDF', desc: 'Convert your images into a PDF document.', path: '/jpg-to-pdf' },
  { emoji: '📃', color: 'from-indigo-500 to-blue-600', title: 'PDF to TXT', desc: 'Extract text from PDF into a TXT file.', path: '/pdf-to-txt' },
  { emoji: '📘', color: 'from-blue-600 to-indigo-700', title: 'PDF to Word', desc: 'Convert PDF to editable Word documents.', path: '/pdf-to-word' },
  { emoji: '📙', color: 'from-cyan-500 to-blue-600', title: 'Word to PDF', desc: 'Convert Word documents to PDF format.', path: '/word-to-pdf' },
  { emoji: '📊', color: 'from-purple-500 to-violet-600', title: 'PDF to PPT', desc: 'Turn your PDF into PowerPoint slides.', path: '/pdf-to-ppt' },
  { emoji: '📽️', color: 'from-fuchsia-500 to-purple-600', title: 'PPT to PDF', desc: 'Convert PowerPoint presentations to PDF.', path: '/ppt-to-pdf' },
  { emoji: '📈', color: 'from-green-500 to-emerald-700', title: 'PDF to Excel', desc: 'Extract PDF tables into Excel spreadsheets.', path: '/pdf-to-excel' },
  { emoji: '📗', color: 'from-lime-500 to-green-600', title: 'Excel to PDF', desc: 'Convert Excel spreadsheets to PDF format.', path: '/excel-to-pdf' },
  { emoji: '✏️', color: 'from-rose-500 to-pink-600', title: 'Edit PDF', desc: 'Edit text, images, and pages in your PDF.', path: '/edit-pdf' },
  { emoji: '✍️', color: 'from-indigo-500 to-purple-700', title: 'Sign PDF', desc: 'Add your digital signature to any document.', path: '/sign-pdf' },
  { emoji: '🔧', color: 'from-gray-600 to-slate-700', title: 'Repair PDF', desc: 'Fix corrupted or damaged PDF files.', path: '/repair-pdf' },
  { emoji: '📜', color: 'from-amber-600 to-yellow-700', title: 'PDF to PDF/A', desc: 'Convert PDFs to archival PDF/A format.', path: '/pdf-to-pdfa' },
  { emoji: '🏷️', color: 'from-cyan-600 to-teal-700', title: 'PDF Metadata', desc: 'View and edit PDF document properties.', path: '/pdf-metadata' },
  { emoji: '📋', color: 'from-blue-500 to-indigo-600', title: 'Flatten PDF', desc: 'Flatten form fields and annotations.', path: '/flatten-pdf' },
  { emoji: '🌐', color: 'from-green-600 to-emerald-700', title: 'HTML to PDF', desc: 'Convert web content to PDF documents.', path: '/html-to-pdf' },
  { emoji: '🖍️', color: 'from-red-600 to-rose-700', title: 'Redact PDF', desc: 'Permanently remove sensitive information.', path: '/redact-pdf' },
  { emoji: '🧹', color: 'from-purple-600 to-violet-700', title: 'Remove Annotations', desc: 'Clean up comments and markup.', path: '/remove-annotations' },
  { emoji: '💧', color: 'from-sky-600 to-blue-700', title: 'Remove Watermark', desc: 'Remove watermarks from PDF documents.', path: '/remove-watermark' },
  { emoji: '🔍', color: 'from-orange-600 to-red-700', title: 'Compare PDF', desc: 'Compare two PDF files side by side.', path: '/compare-pdf' },
];

const faqs = [
  { q: 'Is Doczen free to use?', a: 'Yes! Doczen is completely free to use. All PDF tools are available with no hidden charges.' },
  { q: 'Are my files secure?', a: 'Absolutely. All files are encrypted during upload and automatically deleted from our servers after 24 hours. We never share your data.' },
  { q: 'What file sizes are supported?', a: 'You can upload files up to 50 MB per document.' },
  { q: 'How long does processing take?', a: 'Most operations complete within seconds. Complex conversions may take a bit longer, but we optimize everything for speed.' },
  { q: 'Is there a daily limit?', a: 'No registration needed — guests can process up to 10 files per hour. Create a free account for higher limits and history tracking.' },
  { q: 'What happens to my data?', a: 'All uploaded files are automatically deleted from our servers within 24 hours. You can also manually delete your history at any time.' },
];

export default function Home() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);
  const [visibleSections, setVisibleSections] = useState(new Set());
  const sectionRefs = useRef({});

  const observeSection = useCallback((id) => (el) => {
    if (el) {
      sectionRefs.current[id] = el;
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set(prev).add(entry.target.dataset.section));
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    Object.values(sectionRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToTools = () => {
    document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleTryNow = () => navigate('/merge-pdf');

  return (
    <>
    <SEO
  title="Free Online PDF Editor - Merge, Split, Compress & Convert PDFs"
  description="Doczen is a free online PDF editor. Merge PDFs, split PDFs, compress PDF files, convert PDF to Word, JPG, PPT, Excel and more. No registration required for basic tools."
  keywords="free PDF editor, online PDF tool, merge PDF online, split PDF online, compress PDF, PDF converter, PDF to Word, PDF to JPG, Doczen"
  canonical="/"
  image="/og-home.png"
/>
    <div className="bg-white dark:bg-gray-950">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 py-24 sm:py-32 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 opacity-90 dark:opacity-80" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-20" />
        <div className="relative mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm text-white/90 backdrop-blur-sm mb-8">
            <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            Fully online &mdash; no download required
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl">
            Your PDFs, <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-orange-300">Perfected.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-indigo-100 sm:text-xl">
            Doczen is the all-in-one PDF workspace. Merge, split, convert, compress, edit, and sign
            documents &mdash; all in your browser, free and secure.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={handleTryNow}
              className="rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-indigo-600 shadow-lg shadow-indigo-500/25 hover:bg-indigo-50 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              Try Merge PDF
            </button>
            <button
              onClick={scrollToTools}
              className="rounded-xl border border-white/30 px-8 py-3.5 text-sm font-semibold text-white hover:bg-white/10 transition-all active:scale-95 cursor-pointer"
            >
              All Tools
            </button>
          </div>
        </div>
        <div className="absolute -bottom-1 left-0 right-0 h-16 bg-gradient-to-t from-white dark:from-gray-950 to-transparent" />
      </section>

      {/* Tools Grid */}
      <section id="tools" className="px-4 py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div
            ref={observeSection('tools-header')}
            data-section="tools-header"
            className={`text-center mb-14 transition-all duration-700 ${visibleSections.has('tools-header') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
              Everything You Need
            </h2>
            <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
              From quick edits to full conversions &mdash; 31 powerful tools at your fingertips.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {tools.map((tool, i) => (
              <div
                key={tool.path}
                ref={observeSection(`tool-${i}`)}
                data-section={`tool-${i}`}
                className={`transition-all duration-500 ${visibleSections.has(`tool-${i}`) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: `${(i % 8) * 60}ms` }}
              >
                <ToolCard {...tool} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="px-4 py-20 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div
            ref={observeSection('faq-header')}
            data-section="faq-header"
            className={`text-center mb-14 transition-all duration-700 ${visibleSections.has('faq-header') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                ref={observeSection(`faq-${i}`)}
                data-section={`faq-${i}`}
                className={`rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden transition-all duration-500 ${visibleSections.has(`faq-${i}`) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between px-6 py-4 text-left text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <svg
                    className={`h-5 w-5 text-gray-400 transition-all duration-300 ${openFaq === i ? 'rotate-180 text-indigo-500' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div
                  className={`transition-all duration-300 overflow-hidden ${
                    openFaq === i ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-6 pb-4 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    {faq.a}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-20 lg:px-8">
        <div
          ref={observeSection('cta')}
          data-section="cta"
          className={`mx-auto max-w-3xl text-center transition-all duration-700 ${visibleSections.has('cta') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Ready to Simplify Your PDF Workflow?
          </h2>
          <p className="mt-4 text-lg text-indigo-100">
            Start for free &mdash; no credit card needed, no sign up required.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => navigate('/merge-pdf')}
              className="rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-indigo-600 shadow-lg shadow-indigo-500/25 hover:bg-indigo-50 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              Start Using Tools
            </button>
            <button
              onClick={() => navigate('/compress-pdf')}
              className="rounded-xl border border-white/30 px-8 py-3.5 text-sm font-semibold text-white hover:bg-white/10 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              Compress a PDF
            </button>
          </div>
        </div>
      </section>
    </div>
    </>
  );
}
