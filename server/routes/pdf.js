const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');

const {
  merge, split, compress, rotate, protect: protectPdf,
  unlock, addPageNumbers, addWatermark, extractText,
  reorder, deletePages, pdfToJpg, jpgToPdf, pdfToTxt,
  download, getPageCount, repair, pdfToPdfa,
  readMetadata, writeMetadata, flatten, htmlToPdf,
  redact, removeAnnotations, removeWatermark, compare
} = require('../controllers/pdfController');

router.post('/merge', upload.array('files', 20), merge);
router.post('/split', upload.single('file'), split);
router.post('/compress', upload.single('file'), compress);
router.post('/rotate', upload.single('file'), rotate);
router.post('/protect', upload.single('file'), protectPdf);
router.post('/unlock', upload.single('file'), unlock);
router.post('/add-page-numbers', upload.single('file'), addPageNumbers);
router.post('/add-watermark', upload.single('file'), addWatermark);
router.post('/extract-text', upload.single('file'), extractText);
router.post('/reorder', upload.single('file'), reorder);
router.post('/delete-pages', upload.single('file'), deletePages);
router.post('/pdf-to-jpg', upload.single('file'), pdfToJpg);
router.post('/jpg-to-pdf', upload.array('files', 20), jpgToPdf);
router.post('/pdf-to-txt', upload.single('file'), pdfToTxt);
router.post('/page-count', upload.single('file'), getPageCount);
router.get('/download/:filename', download);
router.post('/repair', upload.single('file'), repair);
router.post('/pdf-to-pdfa', upload.single('file'), pdfToPdfa);
router.post('/read-metadata', upload.single('file'), readMetadata);
router.post('/write-metadata', upload.single('file'), writeMetadata);
router.post('/flatten', upload.single('file'), flatten);
router.post('/html-to-pdf', htmlToPdf);
router.post('/redact', upload.single('file'), redact);
router.post('/remove-annotations', upload.single('file'), removeAnnotations);
router.post('/remove-watermark', upload.single('file'), removeWatermark);
router.post('/compare', upload.array('files', 2), compare);

module.exports = router;
