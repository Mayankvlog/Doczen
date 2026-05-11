import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import MergePDF from './pages/tools/MergePDF';
import SplitPDF from './pages/tools/SplitPDF';
import CompressPDF from './pages/tools/CompressPDF';
import RotatePDF from './pages/tools/RotatePDF';
import ProtectPDF from './pages/tools/ProtectPDF';
import UnlockPDF from './pages/tools/UnlockPDF';
import AddPageNumbers from './pages/tools/AddPageNumbers';
import AddWatermark from './pages/tools/AddWatermark';
import ExtractText from './pages/tools/ExtractText';
import ReorderPages from './pages/tools/ReorderPages';
import DeletePages from './pages/tools/DeletePages';
import PDFToJPG from './pages/tools/PDFToJPG';
import JPGToPDF from './pages/tools/JPGToPDF';
import PDFToTXT from './pages/tools/PDFToTXT';
import PDFToWord from './pages/tools/PDFToWord';
import WordToPDF from './pages/tools/WordToPDF';
import PDFToPPT from './pages/tools/PDFToPPT';
import PPTToPDF from './pages/tools/PPTToPDF';
import PDFToExcel from './pages/tools/PDFToExcel';
import ExcelToPDF from './pages/tools/ExcelToPDF';
import EditPDF from './pages/tools/EditPDF';
import SignPDF from './pages/tools/SignPDF';
import RepairPDF from './pages/tools/RepairPDF';
import PDFToPDFA from './pages/tools/PDFToPDFA';
import Metadata from './pages/tools/Metadata';
import FlattenPDF from './pages/tools/FlattenPDF';
import HTMLToPDF from './pages/tools/HTMLToPDF';
import RedactPDF from './pages/tools/RedactPDF';
import RemoveAnnotations from './pages/tools/RemoveAnnotations';
import ComparePDF from './pages/tools/ComparePDF';
import RemoveWatermark from './pages/tools/RemoveWatermark';

function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">About Doczen</h1>
      <div className="prose prose-gray max-w-none space-y-4 text-gray-600">
        <p>Doczen is a free, powerful online PDF editor designed to make document management simple and accessible for everyone. Whether you need to merge, split, compress, convert, or edit PDFs, Doczen provides all the tools you need right in your browser — no downloads, no installations.</p>
        <p>Our mission is to democratize PDF editing by offering a comprehensive suite of tools that are completely free to use. We believe that essential document management should not require expensive software subscriptions.</p>
        <p>Every tool on Doczen is built with modern web technologies to ensure fast, secure, and reliable processing. Your privacy is our priority — all files are encrypted during upload and automatically deleted from our servers within 24 hours.</p>
        <h2 className="text-2xl font-semibold text-gray-900 mt-8">Why Doczen?</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>100% Free</strong> — No hidden charges, no credit card required</li>
          <li><strong>30+ Tools</strong> — From merging to converting, we've got you covered</li>
          <li><strong>Secure</strong> — Encrypted uploads and automatic file deletion</li>
          <li><strong>Fast</strong> — Optimized processing for quick results</li>
          <li><strong>No Registration</strong> — Start using tools immediately</li>
        </ul>
      </div>
    </div>
  );
}

function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
      <div className="prose prose-gray max-w-none space-y-4 text-gray-600">
        <p>Last updated: January 2025</p>
        <p>Doczen ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.</p>
        <h2 className="text-2xl font-semibold text-gray-900 mt-8">Information We Collect</h2>
        <p>We collect minimal information necessary to provide our PDF editing services:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Files You Upload:</strong> PDFs and documents you upload for processing are temporarily stored on our servers.</li>
          <li><strong>Account Information:</strong> If you create an account, we collect your name and email address.</li>
          <li><strong>Usage Data:</strong> Anonymous usage statistics to improve our service.</li>
        </ul>
        <h2 className="text-2xl font-semibold text-gray-900 mt-8">How We Handle Your Files</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>All uploaded files are encrypted during transmission and at rest.</li>
          <li>Files are automatically and permanently deleted from our servers within 24 hours.</li>
          <li>We do not access, view, or share your uploaded documents.</li>
          <li>Processed files are available for download for a limited time before automatic deletion.</li>
        </ul>
        <h2 className="text-2xl font-semibold text-gray-900 mt-8">Cookies</h2>
        <p>We use essential cookies for authentication and service functionality. We do not use tracking cookies for advertising purposes.</p>
        <h2 className="text-2xl font-semibold text-gray-900 mt-8">Third-Party Services</h2>
        <p>We do not sell, trade, or transfer your information to third parties. We may share anonymized data with service providers who assist us in operating our website and improving our service.</p>
        <h2 className="text-2xl font-semibold text-gray-900 mt-8">Contact</h2>
        <p>If you have questions about this Privacy Policy, please contact us at support@doczen.com.</p>
      </div>
    </div>
  );
}

function TermsOfService() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">Terms of Service</h1>
      <div className="prose prose-gray max-w-none space-y-4 text-gray-600">
        <p>Last updated: January 2025</p>
        <p>By using Doczen, you agree to these Terms of Service. If you do not agree, please do not use our service.</p>
        <h2 className="text-2xl font-semibold text-gray-900 mt-8">Use of Service</h2>
        <p>Doczen provides free online PDF editing tools for personal and business use. You agree to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Not upload malicious files or content that violates any law.</li>
          <li>Not attempt to disrupt or overload our servers.</li>
          <li>Not use the service for any unlawful purpose.</li>
          <li>Comply with all applicable laws and regulations.</li>
        </ul>
        <h2 className="text-2xl font-semibold text-gray-900 mt-8">Intellectual Property</h2>
        <p>You retain all rights to your uploaded documents. Doczen claims no ownership over your files. Our software, brand, and website content are protected by applicable intellectual property laws.</p>
        <h2 className="text-2xl font-semibold text-gray-900 mt-8">Limitation of Liability</h2>
        <p>Doczen is provided "as is" without warranties of any kind. We are not liable for any damages arising from your use of the service. We do not guarantee that the service will be uninterrupted or error-free.</p>
        <h2 className="text-2xl font-semibold text-gray-900 mt-8">File Storage</h2>
        <p>Uploaded files are automatically deleted within 24 hours. We recommend downloading your processed files promptly. We are not responsible for data loss.</p>
        <h2 className="text-2xl font-semibold text-gray-900 mt-8">Changes to Terms</h2>
        <p>We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms.</p>
      </div>
    </div>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);
  return null;
}

function AppContent() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1 page-enter-active">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
          <Route path="/merge-pdf" element={<MergePDF />} />
          <Route path="/split-pdf" element={<SplitPDF />} />
          <Route path="/compress-pdf" element={<CompressPDF />} />
          <Route path="/rotate-pdf" element={<RotatePDF />} />
          <Route path="/protect-pdf" element={<ProtectPDF />} />
          <Route path="/unlock-pdf" element={<UnlockPDF />} />
          <Route path="/add-page-numbers" element={<AddPageNumbers />} />
          <Route path="/add-watermark" element={<AddWatermark />} />
          <Route path="/extract-text" element={<ExtractText />} />
          <Route path="/reorder-pages" element={<ReorderPages />} />
          <Route path="/delete-pages" element={<DeletePages />} />
          <Route path="/pdf-to-jpg" element={<PDFToJPG />} />
          <Route path="/jpg-to-pdf" element={<JPGToPDF />} />
          <Route path="/pdf-to-txt" element={<PDFToTXT />} />
          <Route path="/pdf-to-word" element={<PDFToWord />} />
          <Route path="/word-to-pdf" element={<WordToPDF />} />
          <Route path="/pdf-to-ppt" element={<PDFToPPT />} />
          <Route path="/ppt-to-pdf" element={<PPTToPDF />} />
          <Route path="/pdf-to-excel" element={<PDFToExcel />} />
          <Route path="/excel-to-pdf" element={<ExcelToPDF />} />
          <Route path="/edit-pdf" element={<EditPDF />} />
          <Route path="/sign-pdf" element={<SignPDF />} />
          <Route path="/repair-pdf" element={<RepairPDF />} />
          <Route path="/pdf-to-pdfa" element={<PDFToPDFA />} />
          <Route path="/pdf-metadata" element={<Metadata />} />
          <Route path="/flatten-pdf" element={<FlattenPDF />} />
          <Route path="/html-to-pdf" element={<HTMLToPDF />} />
          <Route path="/redact-pdf" element={<RedactPDF />} />
          <Route path="/remove-annotations" element={<RemoveAnnotations />} />
          <Route path="/compare-pdf" element={<ComparePDF />} />
          <Route path="/remove-watermark" element={<RemoveWatermark />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <HelmetProvider>
    <AuthProvider>
    <ToastProvider>
      <AppContent />
    </ToastProvider>
    </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
