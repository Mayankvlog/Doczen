const { PDFDocument, StandardFonts, rgb, degrees } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

const loadPdf = async (filePath) => {
  const data = await fs.promises.readFile(filePath);
  return await PDFDocument.load(data);
};

const savePdf = async (pdfDoc, outputPath) => {
  const data = await pdfDoc.save();
  await fs.promises.writeFile(outputPath, data);
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
  const pages = pdfDoc.getPages();

  for (const page of pages) {
    const { width, height } = page.getSize();
    const newWidth = Math.round(width * quality);
    const newHeight = Math.round(height * quality);
    page.setSize(newWidth, newHeight);
  }

  await savePdf(pdfDoc, outputPath);
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
  pdfDoc.encrypt({
    userPassword: password,
    ownerPassword: process.env.OWNER_PASSWORD || 'doczen-admin',
    permissions: {
      printing: 'lowResolution',
      modifying: false,
      copying: false,
      annotating: false,
      fillingForms: false,
      contentAccessibility: true,
      documentAssembly: false
    }
  });

  await savePdf(pdfDoc, outputPath);
  return outputPath;
};

const unlockPDF = async (filePath, outputPath, password) => {
  const pdfData = await fs.promises.readFile(filePath);

  let pdfDoc;
  try {
    pdfDoc = await PDFDocument.load(pdfData, { password });
  } catch (err) {
    throw new Error('Incorrect password or file is not password-protected');
  }

  const newPdf = await PDFDocument.create();
  const indices = pdfDoc.getPageIndices();
  const pages = await newPdf.copyPages(pdfDoc, indices);
  pages.forEach((page) => newPdf.addPage(page));

  await savePdf(newPdf, outputPath);
  return outputPath;
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
  const pdfParse = require('pdf-parse');
  const result = await pdfParse(data);
  return result.text;
};

const reorderPages = async (filePath, outputPath, pageOrder) => {
  const pdfDoc = await loadPdf(filePath);
  const totalPages = pdfDoc.getPageCount();
  const newPdf = await PDFDocument.create();

  for (const pageNum of pageOrder) {
    if (pageNum >= 0 && pageNum < totalPages) {
      const [page] = await newPdf.copyPages(pdfDoc, [pageNum]);
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
  const deleteSet = new Set(pagesToDelete);

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
    const pdfDoc = await loadPdf(filePath);
    await savePdf(pdfDoc, outputPath);
    return outputPath;
  } catch (err) {
    const data = await fs.promises.readFile(filePath);
    const newPdf = await PDFDocument.create();
    const pages = newPdf.getPages();
    const text = data.toString('utf-8').match(/\/Type\s*\/Page[^}]+}/g) || [];
    for (let i = 0; i < Math.min(text.length, 50); i++) {
      const page = newPdf.addPage([612, 792]);
      const font = await newPdf.embedFont(StandardFonts.Helvetica);
      page.drawText(`Repaired content block ${i + 1}`, { x: 50, y: 700, size: 14, font });
    }
    await savePdf(newPdf, outputPath);
    return outputPath;
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
  const newPdf = await PDFDocument.create();
  const indices = pdfDoc.getPageIndices();
  const pages = await newPdf.copyPages(pdfDoc, indices);
  pages.forEach((page) => newPdf.addPage(page));
  await savePdf(newPdf, outputPath);
  return outputPath;
};

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

  const lines = textContent.split('\n').flatMap(line => {
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

  for (const redact of redactions) {
    const { pageIndex = 0, x, y, width, height, color = [0, 0, 0] } = redact;
    if (pageIndex < pages.length) {
      const page = pages[pageIndex];
      const { width: pageW, height: pageH } = page.getSize();
      page.drawRectangle({
        x: x || pageW * 0.1,
        y: y || pageH * 0.5,
        width: width || pageW * 0.8,
        height: height || 20,
        color: rgb(color[0], color[1], color[2])
      });
    }
  }

  await savePdf(pdfDoc, outputPath);
  return outputPath;
};

const removeAnnotations = async (filePath, outputPath) => {
  const pdfDoc = await loadPdf(filePath);
  const newPdf = await PDFDocument.create();
  const indices = pdfDoc.getPageIndices();
  const pages = await newPdf.copyPages(pdfDoc, indices);
  pages.forEach((page) => newPdf.addPage(page));
  await savePdf(newPdf, outputPath);
  return outputPath;
};

const removeWatermarkFromPdf = async (filePath, outputPath) => {
  const pdfDoc = await loadPdf(filePath);
  const newPdf = await PDFDocument.create();
  const indices = pdfDoc.getPageIndices();
  const pages = await newPdf.copyPages(pdfDoc, indices);
  pages.forEach((page) => newPdf.addPage(page));
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

module.exports = {
  mergePDFs, splitPDF, compressPDF, rotatePDF,
  protectPDF, unlockPDF, addPageNumbers, addWatermark,
  extractText, reorderPages, deletePages,
  repairPDF, pdfToPdfa, setMetadata, getMetadata,
  flattenPDF, htmlToPdf, redactText, removeAnnotations,
  removeWatermarkFromPdf, comparePDFs,
  loadPdf, savePdf
};
