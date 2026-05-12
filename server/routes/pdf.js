const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { optionalAuth } = require('../middleware/auth');

const {
  merge, split, compress, rotate, protect: protectPdf,
  unlock, addPageNumbers, addWatermark, extractText,
  reorder, deletePages, pdfToJpg, jpgToPdf, pdfToTxt,
  download, getPageCount, repair, pdfToPdfa,
  readMetadata, writeMetadata, flatten, htmlToPdf,
  redact, removeAnnotations, removeWatermark, compare
} = require('../controllers/pdfController');

router.post('/merge', optionalAuth, upload.array('files', 20), merge);
router.post('/split', optionalAuth, upload.single('file'), split);
router.post('/compress', optionalAuth, upload.single('file'), compress);
router.post('/rotate', optionalAuth, upload.single('file'), rotate);
router.post('/protect', optionalAuth, upload.single('file'), protectPdf);
router.post('/unlock', optionalAuth, upload.single('file'), unlock);
router.post('/add-page-numbers', optionalAuth, upload.single('file'), addPageNumbers);
router.post('/add-watermark', optionalAuth, upload.single('file'), addWatermark);
router.post('/extract-text', optionalAuth, upload.single('file'), extractText);
router.post('/reorder', optionalAuth, upload.single('file'), reorder);
router.post('/delete-pages', optionalAuth, upload.single('file'), deletePages);
router.post('/pdf-to-jpg', optionalAuth, upload.single('file'), pdfToJpg);
router.post('/jpg-to-pdf', optionalAuth, upload.array('files', 20), jpgToPdf);
router.post('/pdf-to-txt', optionalAuth, upload.single('file'), pdfToTxt);
router.post('/page-count', optionalAuth, upload.single('file'), getPageCount);
router.get('/download/:filename', optionalAuth, download);
router.post('/repair', optionalAuth, upload.single('file'), repair);
router.post('/pdf-to-pdfa', optionalAuth, upload.single('file'), pdfToPdfa);
router.post('/read-metadata', optionalAuth, upload.single('file'), readMetadata);
router.post('/write-metadata', optionalAuth, upload.single('file'), writeMetadata);
router.post('/flatten', optionalAuth, upload.single('file'), flatten);
router.post('/html-to-pdf', optionalAuth, htmlToPdf);
router.post('/redact', optionalAuth, upload.single('file'), redact);
router.post('/remove-annotations', optionalAuth, upload.single('file'), removeAnnotations);
router.post('/remove-watermark', optionalAuth, upload.single('file'), removeWatermark);
router.post('/compare', optionalAuth, upload.array('files', 2), compare);

module.exports = router;
