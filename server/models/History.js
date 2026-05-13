const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  action: {
    type: String,
    required: true,
    enum: [
      'merge', 'split', 'compress', 'rotate', 'protect', 'unlock',
      'addPageNumbers', 'addWatermark', 'extractText',
      'pdfToWord', 'wordToPdf', 'pdfToJpg', 'jpgToPdf',
      'pdfToPpt', 'pptToPdf', 'pdfToExcel', 'excelToPdf',
      'pdfToTxt', 'editPdf', 'signPdf', 'reorder', 'deletePages',
      'repair', 'pdfToPdfa', 'flatten', 'htmlToPdf', 'redact',
      'removeAnnotations', 'removeWatermark', 'compare',
      'metadata', 'getPageCount'
    ]
  },
  inputFiles: [{
    originalName: String,
    storedName: String,
    size: Number
  }],
  outputFiles: [{
    originalName: String,
    storedName: String,
    size: Number,
    path: String
  }],
  status: {
    type: String,
    enum: ['processing', 'completed', 'failed'],
    default: 'processing'
  },
  error: {
    type: String,
    default: null
  },
  fileSize: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

historySchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('History', historySchema);
