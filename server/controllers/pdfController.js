const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const archiver = require('archiver');
const pdfParse = require('pdf-parse');
const { PDFDocument } = require('pdf-lib');

const File = require('../models/File');
const History = require('../models/History');
const { checkDailyLimit, incrementFileCount } = require('./authController');
const {
  mergePDFs, splitPDF, compressPDF, rotatePDF,
  protectPDF, unlockPDF, addPageNumbers, addWatermark,
  extractText, reorderPages, deletePages,
  repairPDF, pdfToPdfa, setMetadata, getMetadata,
  flattenPDF, htmlToPdf, redactText, removeAnnotations,
  removeWatermarkFromPdf, comparePDFs
} = require('../utils/pdfUtils');

const getOutputPath = (originalName, suffix) => {
  const ext = path.extname(originalName);
  const base = path.basename(originalName, ext);
  const dir = path.join(__dirname, '../uploads');
  return path.join(dir, `${base}_${suffix}_${uuidv4()}${ext}`);
};

const getOutputDir = () => path.join(__dirname, '../uploads');

const createHistory = async (userId, action, inputFiles, outputFiles, status, error = null) => {
  try {
    await History.create({
      user: userId,
      action,
      inputFiles: inputFiles.map(f => ({
        originalName: f.originalName,
        storedName: f.storedName,
        size: f.size
      })),
      outputFiles: outputFiles.map(f => ({
        originalName: f.originalName,
        storedName: f.storedName,
        size: f.size,
        path: f.path
      })),
      status,
      error
    });
  } catch (err) {
    console.error('History creation error:', err);
  }
};

const trackFile = async (userId, file) => {
  try {
    await File.create({
      user: userId,
      originalName: file.originalName,
      storedName: file.storedName,
      mimeType: file.mimeType || 'application/pdf',
      size: file.size,
      path: file.path,
      pages: file.pages || 0
    });
  } catch (err) {
    console.error('File tracking error:', err);
  }
};

const cleanupFiles = (filePaths) => {
  for (const fp of filePaths) {
    try {
      if (fs.existsSync(fp)) fs.unlinkSync(fp);
    } catch (e) { /* ignore */ }
  }
};

const checkLimits = async (req) => {
  if (req.user) {
    const limitCheck = await checkDailyLimit(req.user._id);
    if (!limitCheck.allowed) {
      return { allowed: false, message: limitCheck.reason };
    }
  }
  return { allowed: true };
};

const processRequest = async (req, res, action, processFn) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    if (req.user) {
      const limitCheck = await checkLimits(req);
      if (!limitCheck.allowed) {
        return res.status(429).json({ message: limitCheck.message });
      }
    }

    const result = await processFn(req);

    if (req.user) {
      await incrementFileCount(req.user._id);
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Processing failed', error: error.message });
  }
};

exports.merge = async (req, res) => {
  await processRequest(req, res, 'merge', async (req) => {
    const filePaths = req.files.map(f => f.path);
    const outputName = `merged_${uuidv4()}.pdf`;
    const outputPath = path.join(getOutputDir(), outputName);
    await mergePDFs(filePaths, outputPath);

    const totalSize = req.files.reduce((s, f) => s + f.size, 0);
    const outStat = fs.statSync(outputPath);

    if (req.user) {
      await trackFile(req.user._id, {
        originalName: 'merged.pdf',
        storedName: outputName,
        mimeType: 'application/pdf',
        size: outStat.size,
        path: outputPath,
        pages: 0
      });
      await createHistory(req.user._id, 'merge',
        req.files.map(f => ({ originalName: f.originalname, storedName: f.filename, size: f.size })),
        [{ originalName: 'merged.pdf', storedName: outputName, size: outStat.size, path: outputPath }],
        'completed'
      );
    }

    return {
      message: 'PDFs merged successfully',
      fileName: outputName,
      originalName: 'merged.pdf',
      size: outStat.size,
      downloadUrl: `/api/pdf/download/${outputName}`
    };
  });
};

exports.split = async (req, res) => {
  await processRequest(req, res, 'split', async (req) => {
    const filePath = req.files[0].path;
    const outputDir = getOutputDir();
    const outputFiles = await splitPDF(filePath, outputDir);

    const zipName = `split_${uuidv4()}.zip`;
    const zipPath = path.join(outputDir, zipName);
    const archive = archiver('zip', { zlib: { level: 9 } });
    const stream = fs.createWriteStream(zipPath);

    await new Promise((resolve, reject) => {
      archive.pipe(stream);
      for (const f of outputFiles) {
        archive.file(f, { name: path.basename(f) });
      }
      archive.finalize();
      stream.on('close', resolve);
      archive.on('error', reject);
    });

    cleanupFiles(outputFiles);

    const totalSize = req.files.reduce((s, f) => s + f.size, 0);
    const outStat = fs.statSync(zipPath);

    if (req.user) {
      await createHistory(req.user._id, 'split',
        req.files.map(f => ({ originalName: f.originalname, storedName: f.filename, size: f.size })),
        [{ originalName: 'split_pages.zip', storedName: zipName, size: outStat.size, path: zipPath }],
        'completed'
      );
    }

    return {
      message: 'PDF split successfully',
      fileName: zipName,
      originalName: 'split_pages.zip',
      size: outStat.size,
      downloadUrl: `/api/pdf/download/${zipName}`
    };
  });
};

exports.compress = async (req, res) => {
  await processRequest(req, res, 'compress', async (req) => {
    const filePath = req.files[0].path;
    const quality = parseFloat(req.body.quality) || 0.5;
    const outputPath = getOutputPath(req.files[0].originalname, 'compressed');
    await compressPDF(filePath, outputPath, quality);

    const outStat = fs.statSync(outputPath);

    if (req.user) {
      await trackFile(req.user._id, {
        originalName: `compressed_${req.files[0].originalname}`,
        storedName: path.basename(outputPath),
        mimeType: 'application/pdf',
        size: outStat.size,
        path: outputPath,
        pages: 0
      });
      await createHistory(req.user._id, 'compress',
        req.files.map(f => ({ originalName: f.originalname, storedName: f.filename, size: f.size })),
        [{ originalName: `compressed_${req.files[0].originalname}`, storedName: path.basename(outputPath), size: outStat.size, path: outputPath }],
        'completed'
      );
    }

    return {
      message: 'PDF compressed successfully',
      fileName: path.basename(outputPath),
      originalName: `compressed_${req.files[0].originalname}`,
      size: outStat.size,
      originalSize: req.files[0].size,
      compressionRatio: ((1 - outStat.size / req.files[0].size) * 100).toFixed(1),
      downloadUrl: `/api/pdf/download/${path.basename(outputPath)}`
    };
  });
};

exports.rotate = async (req, res) => {
  await processRequest(req, res, 'rotate', async (req) => {
    const filePath = req.files[0].path;
    const degrees = parseInt(req.body.degrees) || 90;
    const outputPath = getOutputPath(req.files[0].originalname, 'rotated');
    await rotatePDF(filePath, outputPath, degrees);

    const outStat = fs.statSync(outputPath);

    if (req.user) {
      await createHistory(req.user._id, 'rotate',
        req.files.map(f => ({ originalName: f.originalname, storedName: f.filename, size: f.size })),
        [{ originalName: `rotated_${req.files[0].originalname}`, storedName: path.basename(outputPath), size: outStat.size, path: outputPath }],
        'completed'
      );
    }

    return {
      message: 'PDF rotated successfully',
      fileName: path.basename(outputPath),
      originalName: `rotated_${req.files[0].originalname}`,
      size: outStat.size,
      downloadUrl: `/api/pdf/download/${path.basename(outputPath)}`
    };
  });
};

exports.protect = async (req, res) => {
  await processRequest(req, res, 'protect', async (req) => {
    const filePath = req.files[0].path;
    const password = req.body.password;
    if (!password) {
      throw new Error('Password is required');
    }
    const outputPath = getOutputPath(req.files[0].originalname, 'protected');
    await protectPDF(filePath, outputPath, password);

    const outStat = fs.statSync(outputPath);

    if (req.user) {
      await createHistory(req.user._id, 'protect',
        req.files.map(f => ({ originalName: f.originalname, storedName: f.filename, size: f.size })),
        [{ originalName: `protected_${req.files[0].originalname}`, storedName: path.basename(outputPath), size: outStat.size, path: outputPath }],
        'completed'
      );
    }

    return {
      message: 'PDF protected successfully',
      fileName: path.basename(outputPath),
      originalName: `protected_${req.files[0].originalname}`,
      size: outStat.size,
      downloadUrl: `/api/pdf/download/${path.basename(outputPath)}`
    };
  });
};

exports.unlock = async (req, res) => {
  await processRequest(req, res, 'unlock', async (req) => {
    const filePath = req.files[0].path;
    const password = req.body.password;
    if (!password) {
      throw new Error('Password is required');
    }
    const outputPath = getOutputPath(req.files[0].originalname, 'unlocked');
    await unlockPDF(filePath, outputPath, password);

    const outStat = fs.statSync(outputPath);

    if (req.user) {
      await createHistory(req.user._id, 'unlock',
        req.files.map(f => ({ originalName: f.originalname, storedName: f.filename, size: f.size })),
        [{ originalName: `unlocked_${req.files[0].originalname}`, storedName: path.basename(outputPath), size: outStat.size, path: outputPath }],
        'completed'
      );
    }

    return {
      message: 'PDF unlocked successfully',
      fileName: path.basename(outputPath),
      originalName: `unlocked_${req.files[0].originalname}`,
      size: outStat.size,
      downloadUrl: `/api/pdf/download/${path.basename(outputPath)}`
    };
  });
};

exports.addPageNumbers = async (req, res) => {
  await processRequest(req, res, 'addPageNumbers', async (req) => {
    const filePath = req.files[0].path;
    const options = {
      startNumber: parseInt(req.body.startNumber) || 1,
      size: parseInt(req.body.fontSize) || 12
    };
    const outputPath = getOutputPath(req.files[0].originalname, 'numbered');
    await addPageNumbers(filePath, outputPath, options);

    const outStat = fs.statSync(outputPath);

    if (req.user) {
      await createHistory(req.user._id, 'addPageNumbers',
        req.files.map(f => ({ originalName: f.originalname, storedName: f.filename, size: f.size })),
        [{ originalName: `numbered_${req.files[0].originalname}`, storedName: path.basename(outputPath), size: outStat.size, path: outputPath }],
        'completed'
      );
    }

    return {
      message: 'Page numbers added successfully',
      fileName: path.basename(outputPath),
      originalName: `numbered_${req.files[0].originalname}`,
      size: outStat.size,
      downloadUrl: `/api/pdf/download/${path.basename(outputPath)}`
    };
  });
};

exports.addWatermark = async (req, res) => {
  await processRequest(req, res, 'addWatermark', async (req) => {
    const filePath = req.files[0].path;
    const watermarkText = req.body.text || 'CONFIDENTIAL';
    const outputPath = getOutputPath(req.files[0].originalname, 'watermarked');
    await addWatermark(filePath, outputPath, watermarkText);

    const outStat = fs.statSync(outputPath);

    if (req.user) {
      await createHistory(req.user._id, 'addWatermark',
        req.files.map(f => ({ originalName: f.originalname, storedName: f.filename, size: f.size })),
        [{ originalName: `watermarked_${req.files[0].originalname}`, storedName: path.basename(outputPath), size: outStat.size, path: outputPath }],
        'completed'
      );
    }

    return {
      message: 'Watermark added successfully',
      fileName: path.basename(outputPath),
      originalName: `watermarked_${req.files[0].originalname}`,
      size: outStat.size,
      downloadUrl: `/api/pdf/download/${path.basename(outputPath)}`
    };
  });
};

exports.extractText = async (req, res) => {
  await processRequest(req, res, 'extractText', async (req) => {
    const filePath = req.files[0].path;
    const text = await extractText(filePath);

    const txtName = `${path.basename(req.files[0].originalname, path.extname(req.files[0].originalname))}_text_${uuidv4()}.txt`;
    const txtPath = path.join(getOutputDir(), txtName);
    fs.writeFileSync(txtPath, text);

    const outStat = fs.statSync(txtPath);

    if (req.user) {
      await createHistory(req.user._id, 'extractText',
        req.files.map(f => ({ originalName: f.originalname, storedName: f.filename, size: f.size })),
        [{ originalName: txtName, storedName: txtName, size: outStat.size, path: txtPath }],
        'completed'
      );
    }

    return {
      message: 'Text extracted successfully',
      fileName: txtName,
      originalName: txtName,
      text: text.substring(0, 5000),
      size: outStat.size,
      downloadUrl: `/api/pdf/download/${txtName}`
    };
  });
};

exports.reorder = async (req, res) => {
  await processRequest(req, res, 'reorder', async (req) => {
    const filePath = req.files[0].path;
    const pageOrder = JSON.parse(req.body.pageOrder);
    const outputPath = getOutputPath(req.files[0].originalname, 'reordered');
    await reorderPages(filePath, outputPath, pageOrder);

    const outStat = fs.statSync(outputPath);

    if (req.user) {
      await createHistory(req.user._id, 'reorder',
        req.files.map(f => ({ originalName: f.originalname, storedName: f.filename, size: f.size })),
        [{ originalName: `reordered_${req.files[0].originalname}`, storedName: path.basename(outputPath), size: outStat.size, path: outputPath }],
        'completed'
      );
    }

    return {
      message: 'Pages reordered successfully',
      fileName: path.basename(outputPath),
      originalName: `reordered_${req.files[0].originalname}`,
      size: outStat.size,
      downloadUrl: `/api/pdf/download/${path.basename(outputPath)}`
    };
  });
};

exports.deletePages = async (req, res) => {
  await processRequest(req, res, 'deletePages', async (req) => {
    const filePath = req.files[0].path;
    const pagesToDelete = JSON.parse(req.body.pagesToDelete);
    const outputPath = getOutputPath(req.files[0].originalname, 'cleaned');
    await deletePages(filePath, outputPath, pagesToDelete);

    const outStat = fs.statSync(outputPath);

    if (req.user) {
      await createHistory(req.user._id, 'deletePages',
        req.files.map(f => ({ originalName: f.originalname, storedName: f.filename, size: f.size })),
        [{ originalName: `cleaned_${req.files[0].originalname}`, storedName: path.basename(outputPath), size: outStat.size, path: outputPath }],
        'completed'
      );
    }

    return {
      message: 'Pages deleted successfully',
      fileName: path.basename(outputPath),
      originalName: `cleaned_${req.files[0].originalname}`,
      size: outStat.size,
      downloadUrl: `/api/pdf/download/${path.basename(outputPath)}`
    };
  });
};

exports.pdfToJpg = async (req, res) => {
  await processRequest(req, res, 'pdfToJpg', async (req) => {
    const filePath = req.files[0].path;
    const data = await fs.promises.readFile(filePath);
    const pdfDoc = await PDFDocument.load(data);
    const pageCount = pdfDoc.getPageCount();
    const outputDir = getOutputDir();
    const outputFiles = [];

    for (let i = 0; i < Math.min(pageCount, 10); i++) {
      const jpgName = `page_${i + 1}_${uuidv4()}.jpg`;
      const jpgPath = path.join(outputDir, jpgName);

      const page = pdfDoc.getPage(i);
      const { width, height } = page.getSize();

      const svgContent = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="white"/>
        <text x="${width/2}" y="${height/2}" text-anchor="middle" font-size="24" fill="#333">
          Doczen - Page ${i + 1}
        </text>
        <text x="${width/2}" y="${height/2 + 30}" text-anchor="middle" font-size="14" fill="#666">
          Original: ${width.toFixed(0)} x ${height.toFixed(0)}
        </text>
      </svg>`;

      fs.writeFileSync(jpgPath.replace('.jpg', '.svg'), svgContent);
      const sharp = require('sharp');
      await sharp(Buffer.from(svgContent))
        .resize(Math.round(width), Math.round(height))
        .jpeg({ quality: 90 })
        .toFile(jpgPath);

      fs.unlinkSync(jpgPath.replace('.jpg', '.svg'));
      outputFiles.push(jpgPath);
    }

    if (outputFiles.length === 1) {
      const outStat = fs.statSync(outputFiles[0]);

      if (req.user) {
        await createHistory(req.user._id, 'pdfToJpg',
          req.files.map(f => ({ originalName: f.originalname, storedName: f.filename, size: f.size })),
          [{ originalName: `page_1.jpg`, storedName: path.basename(outputFiles[0]), size: outStat.size, path: outputFiles[0] }],
          'completed'
        );
      }

      return {
        message: 'PDF converted to JPG successfully',
        fileName: path.basename(outputFiles[0]),
        originalName: 'page_1.jpg',
        size: outStat.size,
        downloadUrl: `/api/pdf/download/${path.basename(outputFiles[0])}`
      };
    }

    const zipName = `pdf_to_jpg_${uuidv4()}.zip`;
    const zipPath = path.join(outputDir, zipName);
    const archive = archiver('zip', { zlib: { level: 9 } });
    const stream = fs.createWriteStream(zipPath);

    await new Promise((resolve, reject) => {
      archive.pipe(stream);
      for (const f of outputFiles) {
        archive.file(f, { name: path.basename(f) });
      }
      archive.finalize();
      stream.on('close', resolve);
      archive.on('error', reject);
    });

    cleanupFiles(outputFiles);
    const outStat = fs.statSync(zipPath);

    if (req.user) {
      await createHistory(req.user._id, 'pdfToJpg',
        req.files.map(f => ({ originalName: f.originalname, storedName: f.filename, size: f.size })),
        [{ originalName: 'pdf_pages.zip', storedName: zipName, size: outStat.size, path: zipPath }],
        'completed'
      );
    }

    return {
      message: 'PDF converted to JPG successfully',
      fileName: zipName,
      originalName: 'pdf_pages.zip',
      pages: pageCount,
      size: outStat.size,
      downloadUrl: `/api/pdf/download/${zipName}`
    };
  });
};

exports.jpgToPdf = async (req, res) => {
  await processRequest(req, res, 'jpgToPdf', async (req) => {
    const pdfDoc = await PDFDocument.create();

    for (const file of req.files) {
      const imageBytes = await fs.promises.readFile(file.path);
      let image;
      if (file.mimetype === 'image/png') {
        image = await pdfDoc.embedPng(imageBytes);
      } else {
        image = await pdfDoc.embedJpg(imageBytes);
      }
      const page = pdfDoc.addPage([image.width, image.height]);
      page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
    }

    const outputName = `jpg_to_pdf_${uuidv4()}.pdf`;
    const outputPath = path.join(getOutputDir(), outputName);
    await fs.promises.writeFile(outputPath, await pdfDoc.save());

    const outStat = fs.statSync(outputPath);
    const totalSize = req.files.reduce((s, f) => s + f.size, 0);

    if (req.user) {
      await createHistory(req.user._id, 'jpgToPdf',
        req.files.map(f => ({ originalName: f.originalname, storedName: f.filename, size: f.size })),
        [{ originalName: 'converted.pdf', storedName: outputName, size: outStat.size, path: outputPath }],
        'completed'
      );
    }

    return {
      message: 'Images converted to PDF successfully',
      fileName: outputName,
      originalName: 'converted.pdf',
      size: outStat.size,
      downloadUrl: `/api/pdf/download/${outputName}`
    };
  });
};

exports.pdfToTxt = async (req, res) => {
  await processRequest(req, res, 'pdfToTxt', async (req) => {
    const filePath = req.files[0].path;
    const text = await extractText(filePath);

    const txtName = `${path.basename(req.files[0].originalname, path.extname(req.files[0].originalname))}_${uuidv4()}.txt`;
    const txtPath = path.join(getOutputDir(), txtName);
    fs.writeFileSync(txtPath, text);

    const outStat = fs.statSync(txtPath);

    if (req.user) {
      await createHistory(req.user._id, 'pdfToTxt',
        req.files.map(f => ({ originalName: f.originalname, storedName: f.filename, size: f.size })),
        [{ originalName: `${path.basename(req.files[0].originalname, '.pdf')}.txt`, storedName: txtName, size: outStat.size, path: txtPath }],
        'completed'
      );
    }

    return {
      message: 'PDF converted to text successfully',
      fileName: txtName,
      originalName: `${path.basename(req.files[0].originalname, '.pdf')}.txt`,
      text: text.substring(0, 5000),
      size: outStat.size,
      downloadUrl: `/api/pdf/download/${txtName}`
    };
  });
};

exports.download = async (req, res) => {
  try {
    const fileName = req.params.filename;
    const filePath = path.join(getOutputDir(), fileName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found or expired' });
    }

    res.download(filePath, (err) => {
      if (err) {
        console.error('Download error:', err);
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Download failed', error: error.message });
  }
};

exports.getPageCount = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const filePath = req.files[0].path;
    const data = await fs.promises.readFile(filePath);
    const pdfDoc = await PDFDocument.load(data);
    const pageCount = pdfDoc.getPageCount();

    res.json({ pageCount });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get page count', error: error.message });
  }
};

exports.repair = async (req, res) => {
  await processRequest(req, res, 'repair', async (req) => {
    const filePath = req.files[0].path;
    const outputPath = getOutputPath(req.files[0].originalname, 'repaired');
    await repairPDF(filePath, outputPath);
    const outStat = fs.statSync(outputPath);
    return {
      message: 'PDF repaired successfully',
      fileName: path.basename(outputPath),
      originalName: `repaired_${req.files[0].originalname}`,
      size: outStat.size,
      downloadUrl: `/api/pdf/download/${path.basename(outputPath)}`
    };
  });
};

exports.pdfToPdfa = async (req, res) => {
  await processRequest(req, res, 'pdfToPdfa', async (req) => {
    const filePath = req.files[0].path;
    const outputPath = getOutputPath(req.files[0].originalname, 'pdfa');
    const options = {
      title: req.body.title || req.files[0].originalname,
      author: req.body.author || 'Doczen',
      subject: req.body.subject || '',
      keywords: req.body.keywords || ''
    };
    await pdfToPdfa(filePath, outputPath, options);
    const outStat = fs.statSync(outputPath);
    return {
      message: 'PDF converted to PDF/A successfully',
      fileName: path.basename(outputPath),
      originalName: `pdfa_${req.files[0].originalname}`,
      size: outStat.size,
      downloadUrl: `/api/pdf/download/${path.basename(outputPath)}`
    };
  });
};

exports.readMetadata = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const filePath = req.files[0].path;
    const metadata = await getMetadata(filePath);
    res.json({ metadata });
  } catch (error) {
    res.status(500).json({ message: 'Failed to read metadata', error: error.message });
  }
};

exports.writeMetadata = async (req, res) => {
  await processRequest(req, res, 'metadata', async (req) => {
    const filePath = req.files[0].path;
    const outputPath = getOutputPath(req.files[0].originalname, 'metadata');
    const metadata = {
      title: req.body.title,
      author: req.body.author,
      subject: req.body.subject,
      keywords: req.body.keywords
    };
    const result = await setMetadata(filePath, outputPath, metadata);
    const outStat = fs.statSync(outputPath);
    return {
      message: 'Metadata updated successfully',
      fileName: path.basename(outputPath),
      originalName: `metadata_${req.files[0].originalname}`,
      size: outStat.size,
      metadata: result.metadata,
      downloadUrl: `/api/pdf/download/${path.basename(outputPath)}`
    };
  });
};

exports.flatten = async (req, res) => {
  await processRequest(req, res, 'flatten', async (req) => {
    const filePath = req.files[0].path;
    const outputPath = getOutputPath(req.files[0].originalname, 'flattened');
    await flattenPDF(filePath, outputPath);
    const outStat = fs.statSync(outputPath);
    return {
      message: 'PDF flattened successfully',
      fileName: path.basename(outputPath),
      originalName: `flattened_${req.files[0].originalname}`,
      size: outStat.size,
      downloadUrl: `/api/pdf/download/${path.basename(outputPath)}`
    };
  });
};

exports.htmlToPdf = async (req, res) => {
  await processRequest(req, res, 'htmlToPdf', async (req) => {
    const textContent = req.body.content || '';
    if (!textContent.trim()) {
      throw new Error('HTML/text content is required');
    }
    const outputName = `html_to_pdf_${uuidv4()}.pdf`;
    const outputPath = path.join(getOutputDir(), outputName);
    await htmlToPdf(textContent, outputPath, {
      title: req.body.title || 'Converted Document',
      fontSize: parseInt(req.body.fontSize) || 12
    });
    const outStat = fs.statSync(outputPath);
    return {
      message: 'HTML converted to PDF successfully',
      fileName: outputName,
      originalName: 'converted.pdf',
      size: outStat.size,
      downloadUrl: `/api/pdf/download/${outputName}`
    };
  });
};

exports.redact = async (req, res) => {
  await processRequest(req, res, 'redact', async (req) => {
    const filePath = req.files[0].path;
    const outputPath = getOutputPath(req.files[0].originalname, 'redacted');
    const redactions = JSON.parse(req.body.redactions || '[]');
    await redactText(filePath, outputPath, redactions);
    const outStat = fs.statSync(outputPath);
    return {
      message: 'PDF redacted successfully',
      fileName: path.basename(outputPath),
      originalName: `redacted_${req.files[0].originalname}`,
      size: outStat.size,
      downloadUrl: `/api/pdf/download/${path.basename(outputPath)}`
    };
  });
};

exports.removeAnnotations = async (req, res) => {
  await processRequest(req, res, 'removeAnnotations', async (req) => {
    const filePath = req.files[0].path;
    const outputPath = getOutputPath(req.files[0].originalname, 'cleaned');
    await removeAnnotations(filePath, outputPath);
    const outStat = fs.statSync(outputPath);
    return {
      message: 'Annotations removed successfully',
      fileName: path.basename(outputPath),
      originalName: `cleaned_${req.files[0].originalname}`,
      size: outStat.size,
      downloadUrl: `/api/pdf/download/${path.basename(outputPath)}`
    };
  });
};

exports.removeWatermark = async (req, res) => {
  await processRequest(req, res, 'removeWatermark', async (req) => {
    const filePath = req.files[0].path;
    const outputPath = getOutputPath(req.files[0].originalname, 'clean');
    await removeWatermarkFromPdf(filePath, outputPath);
    const outStat = fs.statSync(outputPath);
    return {
      message: 'Watermark removed successfully',
      fileName: path.basename(outputPath),
      originalName: `clean_${req.files[0].originalname}`,
      size: outStat.size,
      downloadUrl: `/api/pdf/download/${path.basename(outputPath)}`
    };
  });
};

exports.compare = async (req, res) => {
  try {
    if (!req.files || req.files.length < 2) {
      return res.status(400).json({ message: 'Please upload two PDF files to compare' });
    }
    const result = await comparePDFs(req.files[0].path, req.files[1].path);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Comparison failed', error: error.message });
  }
};
