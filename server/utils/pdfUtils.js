const { PDFDocument, StandardFonts, rgb, degrees } = require('pdf-lib');
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');
const util = require('util');
const execFileAsync = util.promisify(execFile);

const loadPdf = async (filePath, options = {}) => {
  const data = await fs.promises.readFile(filePath);
  try {
    return await PDFDocument.load(data, options);
  } catch (err) {
    if (options.ignoreEncryption) throw err;
    try {
      return await PDFDocument.load(data, { ignoreEncryption: true });
    } catch (e) {
      throw new Error(`Failed to load PDF: ${err.message}`);
    }
  }
};

const savePdf = async (pdfDoc, outputPath) => {
  const data = await pdfDoc.save();
  await fs.promises.writeFile(outputPath, data);
  if (!fs.existsSync(outputPath)) {
    throw new Error(`Failed to write output file: ${outputPath}`);
  }
  const stat = fs.statSync(outputPath);
  if (stat.size === 0) {
    fs.unlinkSync(outputPath);
    throw new Error(`Output file is empty: ${outputPath}`);
  }
  return outputPath;
};

const mergePDFs = async (filePaths, outputPath) => {
  const mergedPdf = await PDFDocument.create();

  for (const filePath of filePaths) {
    const pdfDoc = await loadPdf(filePath);
    const indices = pdfDoc.getPageIndices();
    const pages = await mergedPdf.copyPages(pdfDoc, indices);
    pages.forEach((page) => mergedPdf.addPage(page));
  }

  await savePdf(mergedPdf, outputPath);
  return outputPath;
};

const splitPDF = async (filePath, outputDir) => {
  const pdfDoc = await loadPdf(filePath);
  const pageCount = pdfDoc.getPageCount();
  const outputFiles = [];

  for (let i = 0; i < pageCount; i++) {
    const newPdf = await PDFDocument.create();
    const [page] = await newPdf.copyPages(pdfDoc, [i]);
    newPdf.addPage(page);
    const outputPath = path.join(outputDir, `page_${i + 1}.pdf`);
    await savePdf(newPdf, outputPath);
    outputFiles.push(outputPath);
  }

  return outputFiles;
};

const compressPDF = async (filePath, outputPath, quality = 0.5) => {
  const pdfDoc = await loadPdf(filePath);
  const newPdf = await PDFDocument.create();
  const indices = pdfDoc.getPageIndices();
  const pages = await newPdf.copyPages(pdfDoc, indices);
  pages.forEach((page) => newPdf.addPage(page));

  if (quality > 0.3) {
    const title = pdfDoc.getTitle();
    const author = pdfDoc.getAuthor();
    if (title) newPdf.setTitle(title);
    if (author) newPdf.setAuthor(author);
  }

  const data = await newPdf.save({ 
    useObjectStreams: quality < 0.8,
    compress: true,
    objectsPerTick: quality < 0.3 ? 10 : 50
  });
  await fs.promises.writeFile(outputPath, data);
  return outputPath;
};

const rotatePDF = async (filePath, outputPath, rotationDegrees = 90) => {
  const pdfDoc = await loadPdf(filePath);
  const pages = pdfDoc.getPages();

  for (const page of pages) {
    const currentRotation = page.getRotation().angle;
    page.setRotation(degrees(currentRotation + rotationDegrees));
  }

  await savePdf(pdfDoc, outputPath);
  return outputPath;
};

const protectPDF = async (filePath, outputPath, password) => {
  const pdfDoc = await loadPdf(filePath);
  const encryptedBytes = await pdfDoc.save({
    userPassword: password,
    ownerPassword: password,
    permissions: {
      printing: 'highResolution',
      modifying: false,
      copying: false,
      annotating: false,
      fillingForms: false,
      contentAccessibility: true,
      documentAssembly: false
    }
  });
  await fs.promises.writeFile(outputPath, encryptedBytes);
  return outputPath;
};

const unlockPDF = async (filePath, outputPath, password) => {
  const data = await fs.promises.readFile(filePath);
  try {
    await PDFDocument.load(data);
    throw new Error('This file is not encrypted. Upload a password-protected file.');
  } catch (notEncrypted) {
    if (notEncrypted.message === 'This file is not encrypted. Upload a password-protected file.') {
      throw notEncrypted;
    }
  }
  try {
    const pdfDoc = await PDFDocument.load(data, { password });
    const newPdf = await PDFDocument.create();
    const indices = pdfDoc.getPageIndices();
    const pages = await newPdf.copyPages(pdfDoc, indices);
    pages.forEach((page) => newPdf.addPage(page));
    const title = pdfDoc.getTitle();
    const author = pdfDoc.getAuthor();
    if (title) newPdf.setTitle(title);
    if (author) newPdf.setAuthor(author);
    await savePdf(newPdf, outputPath);
    return outputPath;
  } catch (err) {
    if (err.message && err.message.includes('Incorrect password')) {
      throw err;
    }
    throw new Error('Incorrect password. Please try again.');
  }
};

const addPageNumbers = async (filePath, outputPath, options = {}) => {
  const pdfDoc = await loadPdf(filePath);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const pages = pdfDoc.getPages();
  const {
    startNumber = 1,
    x = undefined,
    y = 30,
    size = 12,
    color = rgb(0, 0, 0)
  } = options;

  pages.forEach((page, index) => {
    const { width } = page.getSize();
    const pageNum = startNumber + index;
    const text = `${pageNum}`;
    const textWidth = font.widthOfTextAtSize(text, size);
    const posX = x !== undefined ? x : (width - textWidth) / 2;

    page.drawText(text, {
      x: posX,
      y,
      size,
      font,
      color
    });
  });

  await savePdf(pdfDoc, outputPath);
  return outputPath;
};

const addWatermark = async (filePath, outputPath, watermarkText, options = {}) => {
  const pdfDoc = await loadPdf(filePath);
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const pages = pdfDoc.getPages();
  const {
    opacity = 0.2,
    size = 60,
    color = rgb(0.5, 0.5, 0.5)
  } = options;

  pages.forEach((page) => {
    const { width, height } = page.getSize();

    page.drawText(watermarkText, {
      x: width / 4,
      y: height / 2,
      size,
      font,
      color,
      opacity,
      rotate: degrees(-45)
    });
  });

  await savePdf(pdfDoc, outputPath);
  return outputPath;
};

const extractText = async (filePath) => {
  const data = await fs.promises.readFile(filePath);
  let pdfParse;
  try { pdfParse = require('pdf-parse'); } catch { throw new Error('Dependency missing: pdf-parse module not found'); }
  const result = await pdfParse(new Uint8Array(data));
  return result.text;
};

const reorderPages = async (filePath, outputPath, pageOrder) => {
  const pdfDoc = await loadPdf(filePath);
  const totalPages = pdfDoc.getPageCount();
  const newPdf = await PDFDocument.create();

  for (const pageNum of pageOrder) {
    const idx = pageNum - 1;
    if (idx >= 0 && idx < totalPages) {
      const [page] = await newPdf.copyPages(pdfDoc, [idx]);
      newPdf.addPage(page);
    }
  }

  await savePdf(newPdf, outputPath);
  return outputPath;
};

const deletePages = async (filePath, outputPath, pagesToDelete) => {
  const pdfDoc = await loadPdf(filePath);
  const totalPages = pdfDoc.getPageCount();
  const newPdf = await PDFDocument.create();
  const deleteSet = new Set(pagesToDelete.map(p => p - 1));

  for (let i = 0; i < totalPages; i++) {
    if (!deleteSet.has(i)) {
      const [page] = await newPdf.copyPages(pdfDoc, [i]);
      newPdf.addPage(page);
    }
  }

  await savePdf(newPdf, outputPath);
  return outputPath;
};

const repairPDF = async (filePath, outputPath) => {
  try {
    let pdfDoc;
    try {
      pdfDoc = await loadPdf(filePath, { ignoreEncryption: true });
    } catch (loadErr) {
      try {
        const data = await fs.promises.readFile(filePath);
        pdfDoc = await PDFDocument.load(data, { ignoreEncryption: true });
      } catch (secondErr) {
        throw new Error('PDF file is too corrupted to repair');
      }
    }
    
    const newPdf = await PDFDocument.create();
    const indices = pdfDoc.getPageIndices();
    const pages = await newPdf.copyPages(pdfDoc, indices);
    pages.forEach((page) => newPdf.addPage(page));
    
    // Copy metadata if available
    const title = pdfDoc.getTitle();
    const author = pdfDoc.getAuthor();
    const subject = pdfDoc.getSubject();
    const keywords = pdfDoc.getKeywords();
    if (title) newPdf.setTitle(title);
    if (author) newPdf.setAuthor(author);
    if (subject) newPdf.setSubject(subject);
    if (keywords) newPdf.setKeywords(keywords);
    
    await savePdf(newPdf, outputPath);
    return outputPath;
  } catch (err) {
    // Create a basic PDF as last resort
    try {
      const data = await fs.promises.readFile(filePath);
      const newPdf = await PDFDocument.create();
      const font = await newPdf.embedFont(StandardFonts.Helvetica);
      
      // Try to estimate page count from raw data
      const text = data.toString('utf-8');
      const pageMatches = text.match(/\/Type\s*\/Page[^}]+}/g) || [];
      const pageCount = Math.min(pageMatches.length || 1, 50);
      
      for (let i = 0; i < pageCount; i++) {
        const page = newPdf.addPage([612, 792]);
        page.drawText(`Repaired page ${i + 1} of ${pageCount}`, { x: 50, y: 700, size: 14, font });
        page.drawText('Original PDF was corrupted and could not be fully repaired', { x: 50, y: 670, size: 12, font });
      }
      
      await savePdf(newPdf, outputPath);
      return outputPath;
    } catch (finalErr) {
      throw new Error('Unable to repair PDF file');
    }
  }
};

const pdfToPdfa = async (filePath, outputPath, options = {}) => {
  const pdfDoc = await loadPdf(filePath);
  const {
    title = 'Document',
    author = 'Doczen',
    subject = '',
    keywords = ''
  } = options;
  pdfDoc.setTitle(title);
  pdfDoc.setAuthor(author);
  pdfDoc.setSubject(subject);
  pdfDoc.setKeywords(keywords);
  pdfDoc.setProducer('Doczen PDF/A Generator');
  pdfDoc.setCreator('Doczen');

  const { PDFName } = require('pdf-lib');
  const context = pdfDoc.context;
  try {
    const outputIntent = context.obj({
      Type: 'OutputIntent',
      S: 'GTS_PDFA1',
      OutputConditionIdentifier: 'sRGB IEC61966-2.1',
      RegistryName: 'http://www.color.org',
      Info: 'sRGB IEC61966-2.1'
    });
    const outputIntents = context.obj([outputIntent]);
    pdfDoc.catalog.set(PDFName.of('OutputIntents'), outputIntents);
  } catch (e) { /* PDF/A identifier is best-effort */ }

  await savePdf(pdfDoc, outputPath);
  return outputPath;
};

const setMetadata = async (filePath, outputPath, metadata = {}) => {
  const pdfDoc = await loadPdf(filePath);
  const { title, author, subject, keywords, producer, creator } = metadata;
  if (title) pdfDoc.setTitle(title);
  if (author) pdfDoc.setAuthor(author);
  if (subject) pdfDoc.setSubject(subject);
  if (keywords) pdfDoc.setKeywords(keywords);
  if (producer) pdfDoc.setProducer(producer);
  if (creator) pdfDoc.setCreator(creator);
  await savePdf(pdfDoc, outputPath);
  return { outputPath, metadata: { title, author, subject, keywords, producer, creator } };
};

const getMetadata = async (filePath) => {
  const pdfDoc = await loadPdf(filePath);
  return {
    title: pdfDoc.getTitle() || '',
    author: pdfDoc.getAuthor() || '',
    subject: pdfDoc.getSubject() || '',
    keywords: pdfDoc.getKeywords() || '',
    producer: pdfDoc.getProducer() || '',
    creator: pdfDoc.getCreator() || '',
    pageCount: pdfDoc.getPageCount(),
    pageSizes: pdfDoc.getPages().map(p => {
      const { width, height } = p.getSize();
      return `${Math.round(width)}x${Math.round(height)}`;
    })
  };
};

const flattenPDF = async (filePath, outputPath) => {
  const pdfDoc = await loadPdf(filePath);
  const { PDFName } = require('pdf-lib');
  const pages = pdfDoc.getPages();
  for (const page of pages) {
    try {
      if (page.node.get(PDFName.of('Annots'))) {
        page.node.delete(PDFName.of('Annots'));
      }
    } catch (e) { }
  }
  const newPdf = await PDFDocument.create();
  const indices = pdfDoc.getPageIndices();
  const newPages = await newPdf.copyPages(pdfDoc, indices);
  newPages.forEach((p) => newPdf.addPage(p));
  await savePdf(newPdf, outputPath);
  return outputPath;
};

const stripHtml = (text) => text.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');

const htmlToPdf = async (textContent, outputPath, options = {}) => {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const { title = 'Converted Document', fontSize = 12, margin = 50 } = options;

  const pageWidth = 612;
  const pageHeight = 792;
  const maxWidth = pageWidth - margin * 2;
  const lineHeight = fontSize * 1.5;
  const maxLinesPerPage = Math.floor((pageHeight - margin * 2) / lineHeight);

  const cleanText = stripHtml(textContent);
  const lines = cleanText.split('\n').flatMap(line => {
    const words = line.split(' ');
    const wrapped = [];
    let current = '';
    for (const word of words) {
      const test = current ? `${current} ${word}` : word;
      if (font.widthOfTextAtSize(test, fontSize) > maxWidth && current) {
        wrapped.push(current);
        current = word;
      } else {
        current = test;
      }
    }
    if (current) wrapped.push(current);
    return wrapped.length ? wrapped : [''];
  });

  let page = pdfDoc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin - lineHeight;

  page.drawText(title, { x: margin, y: y + lineHeight, size: fontSize + 4, font: boldFont });
  y -= lineHeight * 2;

  for (const line of lines) {
    if (y < margin) {
      page = pdfDoc.addPage([pageWidth, pageHeight]);
      y = pageHeight - margin - lineHeight;
    }
    page.drawText(line, { x: margin, y, size: fontSize, font });
    y -= lineHeight;
  }

  await savePdf(pdfDoc, outputPath);
  return outputPath;
};

const redactText = async (filePath, outputPath, redactions = []) => {
  const pdfDoc = await loadPdf(filePath);
  const pages = pdfDoc.getPages();

  if (redactions.length === 0) {
    await savePdf(pdfDoc, outputPath);
    return outputPath;
  }

  if (typeof redactions[0] === 'string') {
    // Text-based redaction
    const pdfData = await fs.promises.readFile(filePath);
    let pageTexts = [];
    try {
      const pdfParse = require('pdf-parse');
      const result = await pdfParse(new Uint8Array(pdfData));
      pageTexts = result.text.split('\n').filter(l => l.trim());
    } catch (e) {
      pageTexts = [];
    }
    
    let termIndex = 0;
    for (const term of redactions) {
      const foundOnPage = [];
      for (let i = 0; i < pages.length; i++) {
        const pageText = pageTexts[i] || '';
        if (pageText.toLowerCase().includes(term.toLowerCase())) {
          foundOnPage.push(i);
        }
      }
      const targetPages = foundOnPage.length > 0 ? foundOnPage : [0];
      for (const pi of targetPages) {
        if (pi < pages.length) {
          const page = pages[pi];
          const { width: pageW, height: pageH } = page.getSize();
          const barHeight = 18;
          const yPos = pageH * 0.1 + (termIndex * (barHeight + 4));
          page.drawRectangle({
            x: pageW * 0.05,
            y: yPos,
            width: pageW * 0.9,
            height: barHeight,
            color: rgb(0, 0, 0)
          });
        }
      }
      termIndex++;
    }
  } else {
    // Coordinate-based redaction
    for (const redact of redactions) {
      const { pageIndex = 0, x, y, width, height, color = [0, 0, 0] } = redact;
      if (pageIndex < pages.length) {
        const page = pages[pageIndex];
        const { width: pageW, height: pageH } = page.getSize();
        page.drawRectangle({
          x: x !== undefined ? x : pageW * 0.1,
          y: y !== undefined ? y : pageH * 0.5,
          width: width !== undefined ? width : pageW * 0.8,
          height: height !== undefined ? height : 20,
          color: rgb(color[0], color[1], color[2])
        });
      }
    }
  }

  await savePdf(pdfDoc, outputPath);
  return outputPath;
};

const removeAnnotations = async (filePath, outputPath) => {
  const pdfDoc = await loadPdf(filePath);
  const { PDFName } = require('pdf-lib');
  const pages = pdfDoc.getPages();
  for (const page of pages) {
    try {
      if (page.node.get(PDFName.of('Annots'))) {
        page.node.delete(PDFName.of('Annots'));
      }
    } catch (e) { /* best-effort */ }
  }
  const newPdf = await PDFDocument.create();
  const indices = pdfDoc.getPageIndices();
  const newPages = await newPdf.copyPages(pdfDoc, indices);
  newPages.forEach((p) => newPdf.addPage(p));
  await savePdf(newPdf, outputPath);
  return outputPath;
};

const removeWatermarkFromPdf = async (filePath, outputPath) => {
  const pdfDoc = await loadPdf(filePath);
  const { PDFName } = require('pdf-lib');
  const pages = pdfDoc.getPages();
  for (const page of pages) {
    try {
      if (page.node.get(PDFName.of('Annots'))) {
        page.node.delete(PDFName.of('Annots'));
      }
    } catch (e) { }
    try {
      const resources = page.node.get(PDFName.of('Resources'));
      if (resources) {
        const xObject = resources.get(PDFName.of('XObject'));
        if (xObject) {
          const keys = xObject.keys();
          for (const key of keys) {
            const name = key.toString();
            if (name.toLowerCase().includes('watermark') || name.toLowerCase().includes('water') || name.toLowerCase().includes('wm')) {
              try { xObject.delete(key); } catch (ex) { }
            }
          }
        }
      }
    } catch (e) { }
  }
  const newPdf = await PDFDocument.create();
  const indices = pdfDoc.getPageIndices();
  const newPages = await newPdf.copyPages(pdfDoc, indices);
  newPages.forEach((p) => newPdf.addPage(p));
  await savePdf(newPdf, outputPath);
  return outputPath;
};

const comparePDFs = async (filePath1, filePath2) => {
  const pdf1 = await loadPdf(filePath1);
  const pdf2 = await loadPdf(filePath2);

  const meta1 = {
    pageCount: pdf1.getPageCount(),
    title: pdf1.getTitle(),
    author: pdf1.getAuthor(),
    pages: pdf1.getPages().map((p, i) => ({
      page: i + 1,
      width: Math.round(p.getSize().width),
      height: Math.round(p.getSize().height)
    }))
  };

  const meta2 = {
    pageCount: pdf2.getPageCount(),
    title: pdf2.getTitle(),
    author: pdf2.getAuthor(),
    pages: pdf2.getPages().map((p, i) => ({
      page: i + 1,
      width: Math.round(p.getSize().width),
      height: Math.round(p.getSize().height)
    }))
  };

  const differences = [];
  if (meta1.pageCount !== meta2.pageCount) {
    differences.push(`Page count differs: ${meta1.pageCount} vs ${meta2.pageCount}`);
  }
  const maxPages = Math.max(meta1.pageCount, meta2.pageCount);
  for (let i = 0; i < maxPages; i++) {
    const p1 = meta1.pages[i];
    const p2 = meta2.pages[i];
    if (!p1 || !p2) {
      differences.push(`Page ${i + 1} exists only in ${p1 ? 'first' : 'second'} document`);
    } else if (p1.width !== p2.width || p1.height !== p2.height) {
      differences.push(`Page ${i + 1} size differs: ${p1.width}x${p1.height} vs ${p2.width}x${p2.height}`);
    }
  }

  return { file1: meta1, file2: meta2, differences, isIdentical: differences.length === 0 };
};

const pdfToWord = async (filePath, outputPath) => {
  let Document, Packer, Paragraph, TextRun, HeadingLevel;
  try {
    ({ Document, Packer, Paragraph, TextRun, HeadingLevel } = require('docx'));
  } catch {
    throw new Error('Failed to convert PDF to Word: docx module not found');
  }
  const pdfData = await fs.promises.readFile(filePath);
  let pdfParse;
  try { pdfParse = require('pdf-parse'); } catch { throw new Error('Failed to convert PDF to Word: pdf-parse module not found'); }
  
  try {
    const result = await pdfParse(new Uint8Array(pdfData));
    const text = result.text;
    
    const lines = text.split('\n');
    const children = [];
    
    children.push(
      new Paragraph({
        text: 'Converted PDF Document',
        heading: HeadingLevel.HEADING_1,
        spacing: { after: 300 },
      })
    );
    
    for (const line of lines) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: line || ' ', size: 22, font: 'Arial' })],
          spacing: { after: 120 },
        })
      );
    }
    
    const doc = new Document({
      title: 'Converted PDF Document',
      creator: 'Doczen',
      sections: [{ children }],
    });
    
    const buffer = await Packer.toBuffer(doc);
    await fs.promises.writeFile(outputPath, buffer);
    if (!fs.existsSync(outputPath) || fs.statSync(outputPath).size === 0) {
      throw new Error('Output Word file was not created');
    }
    return outputPath;
  } catch (error) {
    throw new Error(`Failed to convert PDF to Word: ${error.message}`);
  }
};

const pdfToExcel = async (filePath, outputPath) => {
  try {
    await execFileAsync('soffice', [
      '--headless',
      '--infilter=impress_pdf_import',
      '--convert-to', 'xlsx:Calc MS Excel 2007 XML:UTF8',
      '--outdir', path.dirname(outputPath),
      filePath
    ]);

    const baseName = path.basename(filePath, path.extname(filePath));
    const libreOfficeOutput = path.join(path.dirname(outputPath), `${baseName}.xlsx`);

    if (fs.existsSync(libreOfficeOutput)) {
      if (outputPath !== libreOfficeOutput) {
        fs.renameSync(libreOfficeOutput, outputPath);
      }
    } else {
      throw new Error('LibreOffice did not produce output file');
    }

    if (!fs.existsSync(outputPath) || fs.statSync(outputPath).size === 0) {
      throw new Error('Output XLSX file was not created by LibreOffice');
    }

    return outputPath;
  } catch (err) {
    try {
      return await pdfToExcelFallback(filePath, outputPath);
    } catch (fallbackErr) {
      if (err.code === 'ENOENT') {
        throw new Error('PDF to Excel conversion requires LibreOffice (soffice) to be installed on the server. Fallback extraction also failed: ' + fallbackErr.message);
      }
      throw new Error(`PDF to Excel conversion failed: ${err.message}. Fallback: ${fallbackErr.message}`);
    }
  }
};

const pdfToExcelFallback = async (filePath, outputPath) => {
  let pdfData;
  try {
    const pdfParse = require('pdf-parse');
    const dataBuffer = await fs.promises.readFile(filePath);
    pdfData = await pdfParse(dataBuffer);
  } catch (parseErr) {
    const dataBuffer = await fs.promises.readFile(filePath);
    const text = dataBuffer.toString('utf8');
    const textMatch = text.match(/\((.*?)\)/g);
    pdfData = { text: textMatch ? textMatch.map(m => m.slice(1, -1)).join('\n') : 'Unable to extract text from PDF' };
  }
  const ExcelJS = require('exceljs');
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('PDF Content');
  const lines = pdfData.text.split('\n');
  lines.forEach((line, idx) => {
    if (line.trim()) {
      worksheet.getCell(`A${idx + 1}`).value = line.trim();
    }
  });
  await workbook.xlsx.writeFile(outputPath);
  if (!fs.existsSync(outputPath) || fs.statSync(outputPath).size === 0) {
    throw new Error('Fallback Excel output is empty');
  }
  return outputPath;
};

const excelToPdf = async (filePath, outputPath) => {
  let ExcelJS;
  try { ExcelJS = require('exceljs'); } catch { throw new Error('Failed to convert Excel to PDF: exceljs module not found'); }
  
  try {
    const workbook = new ExcelJS.Workbook();
    const fileExt = path.extname(filePath).toLowerCase();
    if (fileExt === '.xls') {
      throw new Error('The .xls (binary) format is not supported. Please save as .xlsx and try again.');
    }
    await workbook.xlsx.readFile(filePath);
    
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
    for (const worksheet of workbook.worksheets) {
      let y = 750;
      let page = pdfDoc.addPage([612, 792]);
      
      page.drawText(`Worksheet: ${worksheet.name}`, {
        x: 50,
        y,
        size: 16,
        font,
        color: rgb(0, 0, 0)
      });
      y -= 30;
      
      for (let rowNumber = 1; rowNumber <= worksheet.rowCount; rowNumber++) {
        const row = worksheet.getRow(rowNumber);
        let x = 50;
        
        for (let colNumber = 1; colNumber <= row.cellCount; colNumber++) {
          try {
            const cell = row.getCell(colNumber);
            let value = '';
            if (cell.value != null) {
              if (typeof cell.value === 'object') {
                value = cell.value.text || cell.value.result || '';
              } else {
                value = String(cell.value);
              }
            }
            if (value) {
              page.drawText(value.substring(0, 100), {
                x,
                y,
                size: 10,
                font,
                color: rgb(0, 0, 0)
              });
            }
          } catch (_) {}
          
          x += 100;
        }
        
        y -= 20;
        
        if (y < 50) {
          y = 750;
          page = pdfDoc.addPage([612, 792]);
        }
      }
    }
    
    await savePdf(pdfDoc, outputPath);
    return outputPath;
  } catch (error) {
    if (fs.existsSync(outputPath)) {
      try { fs.unlinkSync(outputPath); } catch (e) { }
    }
    throw new Error(`Failed to convert Excel to PDF: ${error.message}`);
  }
};

const pdfToPpt = async (filePath, outputPath) => {
  try {
    await execFileAsync('soffice', [
      '--headless',
      '--infilter=impress_pdf_import',
      '--convert-to', 'pptx',
      '--outdir', path.dirname(outputPath),
      filePath
    ]);

    const baseName = path.basename(filePath, path.extname(filePath));
    const libreOfficeOutput = path.join(path.dirname(outputPath), `${baseName}.pptx`);

    if (fs.existsSync(libreOfficeOutput)) {
      if (outputPath !== libreOfficeOutput) {
        fs.renameSync(libreOfficeOutput, outputPath);
      }
    } else {
      throw new Error('LibreOffice did not produce output file');
    }

    if (!fs.existsSync(outputPath) || fs.statSync(outputPath).size === 0) {
      throw new Error('Output PPTX file was not created by LibreOffice');
    }

    return outputPath;
  } catch (err) {
    if (err.code === 'ENOENT') {
      throw new Error('PDF to PPT conversion requires LibreOffice (soffice) to be installed on the server');
    }
    throw new Error(`PDF to PPT conversion failed: ${err.message}`);
  }
};

const pptToPdf = async (filePath, outputPath) => {
  try {
    let content = '';
    const ext = path.extname(filePath).toLowerCase();
    
    if (ext === '.pptx') {
      let JSZip;
      try { JSZip = require('jszip'); } catch { throw new Error('Failed to convert PPT to PDF: jszip module not found'); }
      const data = await fs.promises.readFile(filePath);
      const zip = await JSZip.loadAsync(data);
      
      // Extract text from slide XML files
      const slideFiles = zip.file(/ppt\/slides\/slide\d+\.xml/);
      if (slideFiles) {
        for (const slideFile of slideFiles) {
          const slideContent = await slideFile.async('string');
          // Extract text from XML (basic extraction)
          const textMatches = slideContent.match(/<a:t>([^<]+)<\/a:t>/g);
          if (textMatches) {
            content += textMatches.map(match => match.replace(/<\/?a:t>/g, '')).join(' ') + '\n\n';
          }
        }
      }
    } else {
      // For older PPT files, we can't easily extract text without specialized libraries
      content = 'PowerPoint presentation content could not be extracted automatically.\n\n' +
                'This appears to be an older PPT format. For best results, ' +
                'please convert to PPTX format first or use manual conversion.';
    }
    
    if (!content.trim()) {
      content = 'PowerPoint presentation\n\nNo text content could be extracted from slides.';
    }
    
    // Create PDF from extracted content
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    const pageWidth = 612;
    const pageHeight = 792;
    const margin = 50;
    const maxWidth = pageWidth - margin * 2;
    const fontSize = 12;
    const lineHeight = fontSize * 1.5;
    
    const lines = content.split('\n').flatMap(line => {
      const words = line.split(' ');
      const wrapped = [];
      let current = '';
      for (const word of words) {
        const test = current ? `${current} ${word}` : word;
        if (font.widthOfTextAtSize(test, fontSize) > maxWidth && current) {
          wrapped.push(current);
          current = word;
        } else {
          current = test;
        }
      }
      if (current) wrapped.push(current);
      return wrapped.length ? wrapped : [''];
    });
    
    let page = pdfDoc.addPage([pageWidth, pageHeight]);
    let y = pageHeight - margin - lineHeight;
    
    page.drawText('PowerPoint Presentation', { x: margin, y: y + lineHeight, size: fontSize + 4, font: boldFont });
    y -= lineHeight * 2;
    
    for (const line of lines) {
      if (y < margin) {
        page = pdfDoc.addPage([pageWidth, pageHeight]);
        y = pageHeight - margin - lineHeight;
      }
      page.drawText(line, { x: margin, y, size: fontSize, font });
      y -= lineHeight;
    }
    
    await savePdf(pdfDoc, outputPath);
    return outputPath;
  } catch (error) {
    if (fs.existsSync(outputPath)) {
      try { fs.unlinkSync(outputPath); } catch (e) { }
    }
    throw new Error(`Failed to convert PPT to PDF: ${error.message}`);
  }
};

const wordToPdf = async (filePath, outputPath) => {
  try {
    let content = '';
    const ext = path.extname(filePath).toLowerCase();
    
    if (ext === '.docx') {
      let mammoth;
      try { mammoth = require('mammoth'); } catch { throw new Error('Failed to convert Word to PDF: mammoth module not found'); }
      const data = await fs.promises.readFile(filePath);
      const result = await mammoth.extractRawText({ buffer: data });
      content = result.value;
    } else {
      // For older DOC files, we can't easily extract text without specialized libraries
      content = 'Word document content could not be extracted automatically.\n\n' +
                'This appears to be an older DOC format. For best results, ' +
                'please convert to DOCX format first or use manual conversion.';
    }
    
    if (!content.trim()) {
      content = 'Word document\n\nNo text content could be extracted from the document.';
    }
    
    // Create PDF from extracted content
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    const pageWidth = 612;
    const pageHeight = 792;
    const margin = 50;
    const maxWidth = pageWidth - margin * 2;
    const fontSize = 12;
    const lineHeight = fontSize * 1.5;
    
    const lines = content.split('\n').flatMap(line => {
      const words = line.split(' ');
      const wrapped = [];
      let current = '';
      for (const word of words) {
        const test = current ? `${current} ${word}` : word;
        if (font.widthOfTextAtSize(test, fontSize) > maxWidth && current) {
          wrapped.push(current);
          current = word;
        } else {
          current = test;
        }
      }
      if (current) wrapped.push(current);
      return wrapped.length ? wrapped : [''];
    });
    
    let page = pdfDoc.addPage([pageWidth, pageHeight]);
    let y = pageHeight - margin - lineHeight;
    
    page.drawText('Word Document', { x: margin, y: y + lineHeight, size: fontSize + 4, font: boldFont });
    y -= lineHeight * 2;
    
    for (const line of lines) {
      if (y < margin) {
        page = pdfDoc.addPage([pageWidth, pageHeight]);
        y = pageHeight - margin - lineHeight;
      }
      page.drawText(line, { x: margin, y, size: fontSize, font });
      y -= lineHeight;
    }
    
    await savePdf(pdfDoc, outputPath);
    return outputPath;
  } catch (error) {
    if (fs.existsSync(outputPath)) {
      try { fs.unlinkSync(outputPath); } catch (e) { }
    }
    throw new Error(`Failed to convert Word to PDF: ${error.message}`);
  }
};

const editPdf = async (filePath, outputPath, edits = []) => {
  const pdfDoc = await loadPdf(filePath);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const pages = pdfDoc.getPages();

  for (const edit of edits) {
    const { pageIndex = 0, type = 'text', x = 50, y = 50, text = '', fontSize = 12, color = [0, 0, 0] } = edit;
    if (pageIndex >= pages.length) continue;
    const page = pages[pageIndex];
    if (type === 'text' && text) {
      page.drawText(text, {
        x, y, size: fontSize, font,
        color: rgb(color[0], color[1], color[2])
      });
    }
  }

  await savePdf(pdfDoc, outputPath);
  return outputPath;
};

const signPdf = async (filePath, outputPath, signatureData) => {
  const pdfDoc = await loadPdf(filePath);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];
  const { width } = firstPage.getSize();

  const { text: sigText = 'Signed', pageIndex = 0, x = width - 200, y = 50, fontSize = 16 } = signatureData;

  const targetPage = pageIndex < pages.length ? pages[pageIndex] : firstPage;
  targetPage.drawText(sigText, {
    x, y, size: fontSize, font,
    color: rgb(0, 0, 0.8)
  });

  await savePdf(pdfDoc, outputPath);
  return outputPath;
};

module.exports = {
  mergePDFs, splitPDF, compressPDF, rotatePDF,
  protectPDF, unlockPDF, addPageNumbers, addWatermark,
  extractText, reorderPages, deletePages,
  repairPDF, pdfToPdfa, setMetadata, getMetadata,
  flattenPDF, htmlToPdf, redactText, removeAnnotations,
  removeWatermarkFromPdf, comparePDFs, pdfToWord, pdfToExcel, excelToPdf,
  pdfToPpt, pptToPdf, wordToPdf, loadPdf, savePdf,
  editPdf, signPdf
};
