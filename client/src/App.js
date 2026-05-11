import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './context/AuthContext';
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

function App() {
  return (
    <HelmetProvider>
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
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
    </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
