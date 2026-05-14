const { PDFDocument, StandardFonts, rgb, degrees } = require('pdf-lib');
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');
const util = require('util');
const execFileAsync = util.promisify(execFile);

const loadPdf = async (filePath, options = {}) => {
  let data;
  try {
    data = await fs.promises.readFile(filePath);
  } catch (readErr) {
    throw new Error(`Failed to read PDF file: ${readErr.message}`);
  }
  if (data.length < 4 || data[0] !== 0x25 || data[1] !== 0x50 || data[2] !== 0x44 || data[3] !== 0x46) {
    throw new Error(`Invalid or corrupted PDF file: ${path.basename(filePath)} - missing PDF header`);
  }
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
  const data = await pdfDoc.save({ useObjectStreams: false });
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
  try {
    await execFileAsync('qpdf', [
      '--encrypt', password, password, '256',
      '--', filePath, outputPath
    ]);
    if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 0) {
      return outputPath;
    }
  } catch (_) {}

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
  try {
    await execFileAsync('qpdf', [
      '--password=' + password,
      '--decrypt',
      filePath,
      outputPath
    ]);
    if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 0) {
      return outputPath;
    }
  } catch (qpdfErr) {
    if (qpdfErr.message && qpdfErr.message.includes('wrong password')) {
      const wrongPwdErr = new Error('Incorrect password. Please try again.');
      wrongPwdErr.statusCode = 400;
      throw wrongPwdErr;
    }
  }

  const data = await fs.promises.readFile(filePath);
  try {
    await PDFDocument.load(data);
    const notEncryptedErr = new Error('This file is not encrypted. Upload a password-protected file.');
    notEncryptedErr.statusCode = 400;
    throw notEncryptedErr;
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
      err.statusCode = 400;
      throw err;
    }
    const wrongPwdErr = new Error('Incorrect password. Please try again.');
    wrongPwdErr.statusCode = 400;
    throw wrongPwdErr;
  }
};

const addPageNumbers = async (filePath, outputPath, options = {}) => {
  const pdfDoc = await loadPdf(filePath);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const pages = pdfDoc.getPages();
  if (pages.length === 0) {
    throw new Error('PDF has no pages to number');
  }

  const startNumber = options.startNumber || 1;
  const x = options.x;
  const y = options.y;
  const size = options.size || 12;
  const position = options.position || 'bottom';
  const color = options.color || rgb(0, 0, 0);
  const margin = options.margin !== undefined ? options.margin : size * 1.5;

  const textHeight = Number.isFinite(font.heightAtSize(size)) ? font.heightAtSize(size) : size;

  pages.forEach((page, index) => {
    const { width, height } = page.getSize();
    const pageNum = startNumber + index;
    const text = `${pageNum}`;

    let textWidth;
    try {
      textWidth = font.widthOfTextAtSize(text, size);
    } catch (_) {
      textWidth = size * 0.6 * text.length;
    }
    if (!Number.isFinite(textWidth)) {
      textWidth = size * 0.6 * text.length;
    }

    let posX = x !== undefined ? x : (width - textWidth) / 2;
    let posY = y !== undefined ? y : (
      position === 'top'
        ? height - margin - textHeight
        : margin
    );
    if (!Number.isFinite(posX)) posX = 0;
    if (!Number.isFinite(posY)) posY = margin;

    page.drawText(text, {
      x: posX,
      y: posY,
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
  const safeWatermark = sanitizeForPdf(watermarkText);

  pages.forEach((page) => {
    const { width, height } = page.getSize();

    page.drawText(safeWatermark, {
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
        const corruptErr = new Error('PDF file is too corrupted to repair');
        corruptErr.statusCode = 400;
        throw corruptErr;
      }
    }
    
    const newPdf = await PDFDocument.create();
    const indices = pdfDoc.getPageIndices();
    const pages = await newPdf.copyPages(pdfDoc, indices);
    pages.forEach((page) => newPdf.addPage(page));
    
    // Copy metadata if available
    try {
      const title = pdfDoc.getTitle();
      const author = pdfDoc.getAuthor();
      const subject = pdfDoc.getSubject();
      const keywords = pdfDoc.getKeywords();
      if (title) newPdf.setTitle(title);
      if (author) newPdf.setAuthor(author);
      if (subject) newPdf.setSubject(subject);
      if (keywords) newPdf.setKeywords(Array.isArray(keywords) ? keywords : [keywords]);
    } catch (e) { /* best-effort metadata copy */ }
    
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
    keywords = []
  } = options;
  const kw = Array.isArray(keywords) ? keywords : keywords ? [String(keywords)] : [];
  try {
    pdfDoc.setTitle(String(title));
    pdfDoc.setAuthor(String(author));
    pdfDoc.setSubject(String(subject));
    pdfDoc.setKeywords(kw);
    pdfDoc.setProducer('Doczen PDF/A Generator');
    pdfDoc.setCreator('Doczen');
  } catch (e) { /* best-effort metadata */ }

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
  if (keywords) pdfDoc.setKeywords(Array.isArray(keywords) ? keywords : [keywords]);
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

const decodeHtmlEntities = (text) => {
  return text
    .replace(/&#x([0-9A-Fa-f]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, '\u00A0')
    .replace(/&mdash;/g, '\u2014').replace(/&ndash;/g, '\u2013')
    .replace(/&lsquo;/g, '\u2018').replace(/&rsquo;/g, '\u2019')
    .replace(/&ldquo;/g, '\u201C').replace(/&rdquo;/g, '\u201D')
    .replace(/&bull;/g, '\u2022').replace(/&hellip;/g, '\u2026')
    .replace(/&middot;/g, '\u00B7').replace(/&trade;/g, '\u2122')
    .replace(/&euro;/g, '\u20AC').replace(/&copy;/g, '\u00A9')
    .replace(/&reg;/g, '\u00AE').replace(/&pound;/g, '\u00A3')
    .replace(/&yen;/g, '\u00A5').replace(/&cent;/g, '\u00A2')
    .replace(/&sect;/g, '\u00A7').replace(/&deg;/g, '\u00B0')
    .replace(/&plusmn;/g, '\u00B1').replace(/&sup2;/g, '\u00B2')
    .replace(/&sup3;/g, '\u00B3').replace(/&acute;/g, '\u00B4')
    .replace(/&micro;/g, '\u00B5').replace(/&para;/g, '\u00B6')
    .replace(/&cedil;/g, '\u00B8').replace(/&sup1;/g, '\u00B9')
    .replace(/&ordm;/g, '\u00BA').replace(/&frac14;/g, '\u00BC')
    .replace(/&frac12;/g, '\u00BD').replace(/&frac34;/g, '\u00BE')
    .replace(/&iquest;/g, '\u00BF');
};

const stripHtml = (text) => {
  let result = text.replace(/<[^>]*>/g, '');
  result = decodeHtmlEntities(result);
  return result;
};

const sanitizeForPdf = (text) => {
  let result = text
    .replace(/\u2018|\u2019|\u201A|\u201B/g, "'")
    .replace(/\u201C|\u201D|\u201E|\u201F/g, '"')
    .replace(/\u2013|\u2014/g, '-')
    .replace(/\u2022/g, '-')
    .replace(/\u2026/g, '...')
    .replace(/\u00A0/g, ' ')
    .replace(/\u2122/g, 'TM')
    .replace(/\u20AC/g, 'EUR')
    .replace(/\u00A9/g, '(c)')
    .replace(/\u00AE/g, '(r)');
  result = result.replace(/[^\x20-\x7E\xA0-\xFF]/g, '');
  return result;
};

const htmlToPdf = async (textContent, outputPath, options = {}) => {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const { title: rawTitle = 'Converted Document', fontSize = 12, margin = 50 } = options;
  const title = sanitizeForPdf(rawTitle);

  const pageWidth = 612;
  const pageHeight = 792;
  const maxWidth = pageWidth - margin * 2;
  const lineHeight = fontSize * 1.5;
  const maxLinesPerPage = Math.floor((pageHeight - margin * 2) / lineHeight);

  const cleanText = sanitizeForPdf(stripHtml(textContent));
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
    const pdfData = await fs.promises.readFile(filePath);
    try {
      const pdfParse = require('pdf-parse');
      const result = await pdfParse(new Uint8Array(pdfData), {
        pagerender: async (pageData) => {
          const textContent = await pageData.getTextContent({ normalizeWhitespace: true });
          const items = textContent.items.map(item => ({
            s: item.str,
            x: item.transform[4],
            y: item.transform[5],
            w: item.width,
            h: item.height || 0
          }));
          return JSON.stringify(items);
        }
      });

      const pageTextItems = result.text.split('\n\n').filter(p => p.trim()).map(p => {
        try { return JSON.parse(p); } catch { return []; }
      });

      for (const term of redactions) {
        const termLower = term.toLowerCase();
        const escapedTerm = termLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const wordRegex = new RegExp(`(?:^|[^a-zA-Z0-9@.\\-_/])(${escapedTerm})(?:$|[^a-zA-Z0-9@.\\-_/])`, 'gi');
        for (let pi = 0; pi < Math.min(pages.length, pageTextItems.length); pi++) {
          const items = pageTextItems[pi];
          if (!items || items.length === 0) continue;
          const page = pages[pi];
          const padding = 3;
          for (const item of items) {
            if (!item.s) continue;
            const itemText = item.s;
            const fontSize = item.h || 16;
            const lineHeight = fontSize + (padding * 2);
            wordRegex.lastIndex = 0;
            let match;
            while ((match = wordRegex.exec(itemText)) !== null) {
              const matchText = match[1];
              if (!matchText || itemText.length === 0) continue;
              const termOffsetInMatch = match[0].toLowerCase().indexOf(matchText.toLowerCase());
              if (termOffsetInMatch === -1) continue;
              const matchIdx = match.index + termOffsetInMatch;
              const matchWidth = item.w * (matchText.length / itemText.length);
              const matchX = item.x + (item.w * (matchIdx / itemText.length));
              page.drawRectangle({
                x: Math.max(0, matchX - padding),
                y: item.y - (fontSize * 0.2) - padding,
                width: Math.max(4, matchWidth) + (padding * 2),
                height: lineHeight,
                color: rgb(0, 0, 0)
              });
            }
          }
        }
      }
    } catch (e) {
      console.error('Text-based redaction error:', e.message);
    }
  } else {
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

const removeWatermarkFromPdf = async (filePath, outputPath, options = {}) => {
  const { PDFName, PDFRawStream } = require('pdf-lib');
  const zlib = require('zlib');
  const fileBuffer = fs.readFileSync(filePath);
  const pdfDoc = await PDFDocument.load(fileBuffer, { ignoreEncryption: true });
  const pages = pdfDoc.getPages();
  const context = pdfDoc.context;
  const originalPageCount = pdfDoc.getPageCount();
  const wmKeywords = /watermark|confidential|proprietary|not\s*for\s*distribution/i;
  const customText = (options.watermarkText || '').trim();
  const customRegex = customText ? new RegExp(customText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') : null;
  const mode = options.mode || 'auto';

  const streamToString = (item) => {
    if (!item || !item.contents) return null;
    const raw = Buffer.from(item.contents);
    try { return zlib.inflateRawSync(raw).toString('utf8'); }
    catch (e1) {
      try { return zlib.unzipSync(raw).toString('utf8'); }
      catch (e2) { return raw.toString('utf8'); }
    }
  };

  const getPageStreams = (page) => {
    let contentsObj = page.node.get(PDFName.of('Contents'));
    if (!contentsObj) return [];
    if (contentsObj.constructor && contentsObj.constructor.name === 'PDFRef') {
      try { contentsObj = context.lookup(contentsObj); } catch (e) { return []; }
    }
    if (!contentsObj) return [];
    if (contentsObj.constructor && contentsObj.constructor.name === 'PDFArray') {
      const items = [];
      for (let ci = 0; ci < contentsObj.size(); ci++) items.push(contentsObj.get(ci));
      return items;
    }
    return [contentsObj];
  };

  const getPageContent = (page) => {
    const streams = getPageStreams(page);
    let allContent = '';
    for (const itemRef of streams) {
      let item = itemRef;
      if (item.constructor && item.constructor.name === 'PDFRef') {
        try { item = context.lookup(item); } catch (e) { item = null; }
      }
      const decoded = streamToString(item);
      if (decoded) allContent += decoded;
    }
    return allContent;
  };

  const setPageContent = (page, content) => {
    const compressed = zlib.deflateSync(Buffer.from(content, 'utf8'));
    const dict = context.obj({ Filter: 'FlateDecode', Length: compressed.length });
    const rawStream = PDFRawStream.of(dict, new Uint8Array(compressed));
    const ref = context.register(rawStream);
    const newArr = context.obj([]);
    newArr.push(ref);
    page.node.set(PDFName.of('Contents'), newArr);
  };

  // --- Phase 1: Collect Form XObject usage across all pages ---
  const xobjectNamesPerPage = [];
  const xobjectFrequency = new Map();

  for (let pi = 0; pi < pages.length; pi++) {
    const page = pages[pi];
    const namesOnPage = new Set();
    try {
      const content = getPageContent(page);
      if (content) {
        const doMatches = content.match(/\/(\w+)\s*Do/g);
        if (doMatches) {
          for (const m of doMatches) {
            const name = m.replace(/\s*Do$/, '').trim().slice(1);
            namesOnPage.add(name);
          }
        }
      }
    } catch (e) {}
    xobjectNamesPerPage.push(namesOnPage);
    for (const name of namesOnPage) {
      if (!xobjectFrequency.has(name)) xobjectFrequency.set(name, new Set());
      xobjectFrequency.get(name).add(pi);
    }
  }

  const thresholdPages = Math.ceil(pages.length * 0.4);
  const recurringXObjectNames = new Set();
  for (const [name, pageSet] of xobjectFrequency) {
    if (pageSet.size >= thresholdPages || /^(watermark|water_?mark|wm\d*|wtrmrk|draft|stamp|overlay)/i.test(name)) {
      recurringXObjectNames.add(name);
    }
  }

  // Phase 2: Build text frequency map for watermark detection
  const textFreq = new Map();
  for (let pi = 0; pi < pages.length; pi++) {
    const pageContent = getPageContent(pages[pi]);
    if (!pageContent.trim()) continue;
    const blockMatches = pageContent.match(/BT[\s\S]*?ET/g);
    if (!blockMatches) continue;
    const pageTexts = new Set();
    for (const block of blockMatches) {
      const strs = [];
      const litMatches = block.match(/\(((?:[^\\)]|\\.)*)\)/g);
      if (litMatches) {
        for (const s of litMatches) strs.push(s.slice(1, -1).replace(/\\(.)/g, '$1'));
      }
      const hexMatches = block.match(/<([0-9A-Fa-f]+)>/g);
      if (hexMatches) {
        for (const h of hexMatches) {
          try {
            const decoded = Buffer.from(h.slice(1, -1), 'hex').toString('utf8');
            if (decoded) strs.push(decoded);
          } catch (e) {}
        }
      }
      if (!strs.length) continue;
      const text = strs.join(' ').trim();
      if (text.length < 2) continue;
      pageTexts.add(text);
    }
    for (const t of pageTexts) {
      if (!textFreq.has(t)) textFreq.set(t, new Set());
      textFreq.get(t).add(pi);
    }
  }
  const freqThreshold = Math.max(2, Math.ceil(pages.length * 0.5));
  const frequentTexts = new Set();
  for (const [text, pageSet] of textFreq) {
    if (pageSet.size >= freqThreshold) frequentTexts.add(text);
  }

  let pagesModified = 0;

  for (let pi = 0; pi < pages.length; pi++) {
    const page = pages[pi];
    let content = getPageContent(page);
    if (!content.trim()) continue;

    let pageChanged = false;

    // Strategy 1: Remove /Subtype /Watermark artifact blocks from content stream
    if (mode === 'auto' || mode === 'text') {
      const before = content;
      content = content.replace(
        /\/Artifact\s*<<[^>]*?\/Subtype\s*\/Watermark[^>]*?>>\s*BDC[\s\S]*?EMC/gi,
        ''
      );
      if (content !== before) pageChanged = true;
    }

    // Strategy 2: Remove watermark annotations
    if (mode === 'auto' || mode === 'text') {
      try {
        let annots = page.node.get(PDFName.of('Annots'));
        if (annots) {
          if (annots.constructor && annots.constructor.name === 'PDFRef') {
            try { annots = context.lookup(annots); } catch (e) { annots = null; }
          }
        }
        if (annots && typeof annots.size === 'function' && annots.size() > 0) {
          const toRemove = [];
          for (let i = 0; i < annots.size(); i++) {
            try {
              const annotRef = annots.get(i);
              const annot = (annotRef && annotRef.constructor && annotRef.constructor.name === 'PDFRef')
                ? context.lookup(annotRef)
                : annotRef;
              if (annot && typeof annot.get === 'function') {
                const subtype = annot.get(PDFName.of('Subtype'));
                const subtypeStr = subtype ? String(subtype) : '';
                const contents = annot.get(PDFName.of('Contents'));
                let contentsStr = '';
                if (contents) {
                  contentsStr = typeof contents.decodeText === 'function'
                    ? contents.decodeText()
                    : String(contents);
                }
                const matchesKeyword =  wmKeywords.test(contentsStr) || (customRegex && customRegex.test(contentsStr));
                if (/stamp/i.test(subtypeStr) || matchesKeyword) {
                  toRemove.push(i);
                }
              }
            } catch (e) {}
          }
          if (toRemove.length > 0) {
            for (let i = toRemove.length - 1; i >= 0; i--) {
              try { annots.removeAt(toRemove[i]); } catch (e) {}
            }
            if (annots.size() === 0) {
              page.node.delete(PDFName.of('Annots'));
            }
            pageChanged = true;
          }
        }
      } catch (e) {}
    }

    // Strategy 3: Remove recurring Form XObject draw commands (/Fm0 Do etc.)
    if (mode === 'auto' || mode === 'text') {
      const xObjectNamesOnThisPage = xobjectNamesPerPage[pi] || new Set();
      const namesToRemove = [...recurringXObjectNames].filter(n => xObjectNamesOnThisPage.has(n));
      if (namesToRemove.length > 0) {
        const before = content;
        for (const name of namesToRemove) {
          content = content.replace(new RegExp(`\\/${name}\\s*Do`, 'g'), '');
        }
        if (content !== before) pageChanged = true;

        try {
          let resources = page.node.get(PDFName.of('Resources'));
          if (resources) {
            if (resources.constructor && resources.constructor.name === 'PDFRef') {
              try { resources = context.lookup(resources); } catch (e) { resources = null; }
            }
          }
          if (resources) {
            let xObject = resources.get(PDFName.of('XObject'));
            if (xObject) {
              if (xObject.constructor && xObject.constructor.name === 'PDFRef') {
                try { xObject = context.lookup(xObject); } catch (e) { xObject = null; }
              }
            }
            if (xObject && typeof xObject.keys === 'function') {
              for (const key of xObject.keys()) {
                const keyStr = String(key);
                if (namesToRemove.includes(keyStr)) {
                  try { xObject.delete(key); } catch (e) {}
                }
              }
            }
          }
        } catch (e) {}
      }
    }

    // Strategy 4: Remove watermark text from content streams
    if (mode === 'auto' || mode === 'text') {
      const before = content;
      content = content.replace(/BT[\s\S]*?ET/g, (block) => {
        const strs = [];
        const litMatches = block.match(/\(((?:[^\\)]|\\.)*)\)/g);
        if (litMatches) {
          for (const s of litMatches) {
            strs.push(s.slice(1, -1).replace(/\\(.)/g, '$1'));
          }
        }
        const hexMatches = block.match(/<([0-9A-Fa-f]+)>/g);
        if (hexMatches) {
          for (const h of hexMatches) {
            try {
              const decoded = Buffer.from(h.slice(1, -1), 'hex').toString('utf8');
              if (decoded) strs.push(decoded);
            } catch (e) {}
          }
        }
        if (!strs.length) return block;
        const joined = strs.join(' ');
        const concated = strs.join('');
        if (wmKeywords.test(joined) || wmKeywords.test(concated)) return '';
        if (customRegex && (customRegex.test(joined) || customRegex.test(concated))) return '';
        if (frequentTexts.has(joined) || frequentTexts.has(concated)) return '';
        return block;
      });
      if (content !== before) pageChanged = true;
    }

    if (pageChanged) {
      content = content.replace(/\s+/g, ' ').trim();
      setPageContent(page, content);
      pagesModified++;
    }
  }

  if (pdfDoc.getPageCount() !== originalPageCount) {
    throw new Error('Page count changed. Aborting to prevent data loss.');
  }

  if (pagesModified === 0) {
    return { modified: false, pagesModified: 0, message: 'Watermark not removable automatically. It may be flattened or embedded in page content.' };
  }

  const pdfBytes = await pdfDoc.save({ useObjectStreams: false });
  fs.writeFileSync(outputPath, pdfBytes);

  if (!fs.existsSync(outputPath) || fs.statSync(outputPath).size < 1000) {
    throw new Error('Invalid output PDF - file too small or missing');
  }

  return {
    modified: true,
    pagesModified,
    totalPages: pages.length,
    message: `Watermark removed from ${pagesModified} of ${pages.length} pages`,
    outputPath
  };
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
  const scanForXlsx = (dir) => {
    let candidates;
    try { candidates = fs.readdirSync(dir).filter(f => f.endsWith('.xlsx')); } catch { candidates = []; }
    const newest = candidates.map(f => ({ name: f, mtime: fs.statSync(path.join(dir, f)).mtime }))
      .sort((a, b) => b.mtime - a.mtime);
    return newest.length ? path.join(dir, newest[0].name) : null;
  };

  const outDir = path.dirname(outputPath);
  const inputDir = path.dirname(filePath);

  const attempts = [
    { convertTo: 'xlsx' },
    { convertTo: 'xlsx', infilter: 'draw_pdf_import' },
    { convertTo: 'xlsx', infilter: 'impress_pdf_import' },
  ];

  for (const attempt of attempts) {
    try {
      const args = ['--headless'];
      if (attempt.infilter) args.push(`--infilter=${attempt.infilter}`);
      args.push('--convert-to', attempt.convertTo, '--outdir', outDir, filePath);
      await execFileAsync('soffice', args);

      let found = scanForXlsx(outDir);
      if (!found) found = scanForXlsx(inputDir);

      if (found && fs.statSync(found).size > 0) {
        if (found !== outputPath) fs.copyFileSync(found, outputPath);
        return outputPath;
      }
    } catch (_) { /* try next */ }
  }

  try {
    return await pdfToExcelFallback(filePath, outputPath);
  } catch (fallbackErr) {
    throw new Error(`PDF to Excel conversion failed: ${fallbackErr.message}`);
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
      const xlsErr = new Error('The .xls (binary) format is not supported. Please save as .xlsx and try again.');
      xlsErr.statusCode = 400;
      throw xlsErr;
    }
    await workbook.xlsx.readFile(filePath);
    
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
    for (const worksheet of workbook.worksheets) {
      let y = 750;
      let page = pdfDoc.addPage([612, 792]);
      
      page.drawText(`Worksheet: ${sanitizeForPdf(worksheet.name)}`, {
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
                const displayText = sanitizeForPdf(value.substring(0, 100));
                try {
                  page.drawText(displayText, { x, y, size: 10, font, color: rgb(0, 0, 0) });
                } catch (drawErr) {
                  if (drawErr.message && drawErr.message.includes('cannot encode')) {
                    const fallback = displayText.replace(/[^\x20-\x7E]/g, '').replace(/\s+/g, ' ').trim();
                    page.drawText(fallback || '.', { x, y, size: 10, font, color: rgb(0, 0, 0) });
                  } else {
                    throw drawErr;
                  }
                }
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
    
    content = sanitizeForPdf(content);
    
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
    
    content = sanitizeForPdf(content);
    
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
      page.drawText(sanitizeForPdf(text), {
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
  targetPage.drawText(sanitizeForPdf(sigText), {
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
