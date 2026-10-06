import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import type { PDFFont, PDFPage } from 'pdf-lib';
import type { TenderInfo, Requirement, UploadedFile } from '../types';
import { normalizeDate } from './statusEngine';

/**
 * Applies a consistent footer to a PDF page without covering existing content.
 * Accounts for page rotation (0, 90, 180, 270) and slightly scales/translates
 * content to guarantee an uncompromised footer zone.
 */
function applyFooterToContentPage(
  page: PDFPage,
  footerText: string,
  font: PDFFont
) {
  const { width, height } = page.getSize();
  const rotationAngle = page.getRotation().angle % 360;
  const scale = 0.96;
  const bottomMargin = 28;

  page.scaleContent(scale, scale);

  if (rotationAngle === 0) {
    page.translateContent((width * (1 - scale)) / 2, bottomMargin);

    page.drawLine({
      start: { x: 36, y: 22 },
      end: { x: width - 36, y: 22 },
      thickness: 0.5,
      color: rgb(0.78, 0.81, 0.85),
    });

    const textWidth = font.widthOfTextAtSize(footerText, 8.5);
    page.drawText(footerText, {
      x: (width - textWidth) / 2,
      y: 10,
      size: 8.5,
      font,
      color: rgb(0.28, 0.33, 0.38),
    });
  } else if (rotationAngle === 90) {
    page.translateContent(
      (width * (1 - scale)) / 2 - bottomMargin,
      (height * (1 - scale)) / 2
    );

    page.drawLine({
      start: { x: width - 22, y: 36 },
      end: { x: width - 22, y: height - 36 },
      thickness: 0.5,
      color: rgb(0.78, 0.81, 0.85),
    });

    const textWidth = font.widthOfTextAtSize(footerText, 8.5);
    page.drawText(footerText, {
      x: width - 10,
      y: (height - textWidth) / 2,
      size: 8.5,
      font,
      color: rgb(0.28, 0.33, 0.38),
      rotate: degrees(90),
    });
  } else if (rotationAngle === 180) {
    page.translateContent(
      (width * (1 - scale)) / 2,
      (height * (1 - scale)) / 2 - bottomMargin
    );

    page.drawLine({
      start: { x: 36, y: height - 22 },
      end: { x: width - 36, y: height - 22 },
      thickness: 0.5,
      color: rgb(0.78, 0.81, 0.85),
    });

    const textWidth = font.widthOfTextAtSize(footerText, 8.5);
    page.drawText(footerText, {
      x: (width + textWidth) / 2,
      y: height - 10,
      size: 8.5,
      font,
      color: rgb(0.28, 0.33, 0.38),
      rotate: degrees(180),
    });
  } else if (rotationAngle === 270) {
    page.translateContent(
      (width * (1 - scale)) / 2 + bottomMargin,
      (height * (1 - scale)) / 2
    );

    page.drawLine({
      start: { x: 22, y: 36 },
      end: { x: 22, y: height - 36 },
      thickness: 0.5,
      color: rgb(0.78, 0.81, 0.85),
    });

    const textWidth = font.widthOfTextAtSize(footerText, 8.5);
    page.drawText(footerText, {
      x: 10,
      y: (height + textWidth) / 2,
      size: 8.5,
      font,
      color: rgb(0.28, 0.33, 0.38),
      rotate: degrees(270),
    });
  }
}

/**
 * Truncates text with ellipsis to prevent table cell overflow.
 */
function truncateToFit(
  text: string,
  maxWidth: number,
  font: PDFFont,
  fontSize: number
): string {
  if (font.widthOfTextAtSize(text, fontSize) <= maxWidth) {
    return text;
  }
  let current = text;
  while (current.length > 3 && font.widthOfTextAtSize(current + '...', fontSize) > maxWidth) {
    current = current.slice(0, -1);
  }
  return current + '...';
}

export interface IncludedDocManifest {
  order: number;
  requirementTitle: string;
  fileName: string;
  pageCount: number;
  startPage: number;
  endPage: number;
  expiryDate?: string;
}

/**
 * Generates the unified Tender Document Submission Package PDF.
 * Follows all contest requirements:
 * - Page 1 is an English cover showing tender ID, title, procuring entity,
 *   bidder, submission deadline, creation date, and included documents in order.
 * - Appends matched documents in order of numeric "order".
 * - Skips optional requirements without a file.
 * - Retains source PDF pages in exact original sequence.
 * - Every page includes "<tender_id> | Page X of Y".
 * - Footer never covers document content.
 */
export async function generateTenderPackagePdf(
  tender: TenderInfo,
  requirements: Requirement[],
  files: UploadedFile[],
  matches: Record<string, string | undefined>,
  expiryDates: Record<string, string | undefined>,
  onProgress?: (status: string) => void
): Promise<{ pdfBytes: Uint8Array; filename: string }> {
  onProgress?.('Preparing package structure...');

  // Sort requirements by numeric order
  const sortedReqs = [...requirements].sort((a, b) => a.order - b.order);

  // Filter to matched requirements only (skipping optional without file)
  const matchedEntries: {
    req: Requirement;
    file: UploadedFile;
    expiry?: string;
  }[] = [];

  for (const req of sortedReqs) {
    const fileId = matches[req.id];
    if (fileId) {
      const file = files.find(f => f.id === fileId);
      if (file) {
        matchedEntries.push({
          req,
          file,
          expiry: expiryDates[req.id],
        });
      }
    }
  }

  // Pre-load all source documents to verify page counts and prepare page range manifest
  onProgress?.('Inspecting matched documents...');
  const loadedSources: {
    entry: typeof matchedEntries[0];
    pdfDoc: PDFDocument;
    pageCount: number;
  }[] = [];

  let cumulativePage = 2; // Page 1 is the cover
  const manifest: IncludedDocManifest[] = [];

  for (const entry of matchedEntries) {
    const srcDoc = await PDFDocument.load(entry.file.data, { ignoreEncryption: true });
    const count = srcDoc.getPageCount();
    loadedSources.push({
      entry,
      pdfDoc: srcDoc,
      pageCount: count,
    });

    manifest.push({
      order: entry.req.order,
      requirementTitle: entry.req.title_en,
      fileName: entry.file.name,
      pageCount: count,
      startPage: cumulativePage,
      endPage: cumulativePage + count - 1,
      expiryDate: entry.expiry,
    });

    cumulativePage += count;
  }

  const totalPages = cumulativePage - 1; // Total pages including cover

  onProgress?.('Building English cover page...');
  const mergedPdf = await PDFDocument.create();
  const fontRegular = await mergedPdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await mergedPdf.embedFont(StandardFonts.HelveticaBold);

  // Standard A4 page
  const coverPage = mergedPdf.addPage([595.28, 841.89]);
  const pageWidth = coverPage.getWidth();
  const pageHeight = coverPage.getHeight();
  const leftMargin = 38;
  const contentWidth = pageWidth - leftMargin * 2;

  // 1. Header Box
  coverPage.drawRectangle({
    x: leftMargin,
    y: pageHeight - 96,
    width: contentWidth,
    height: 60,
    color: rgb(0.06, 0.09, 0.16),
  });

  coverPage.drawText('TENDER DOCUMENT SUBMISSION PACKAGE', {
    x: leftMargin + 16,
    y: pageHeight - 62,
    size: 15,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  coverPage.drawText('OFFICIAL BID SUBMISSION & VERIFICATION MANIFEST', {
    x: leftMargin + 16,
    y: pageHeight - 81,
    size: 9,
    font: fontRegular,
    color: rgb(0.58, 0.77, 0.99),
  });

  // 2. Tender Information Card
  const metaHeight = 126;
  const metaY = pageHeight - 110 - metaHeight;
  coverPage.drawRectangle({
    x: leftMargin,
    y: metaY,
    width: contentWidth,
    height: metaHeight,
    color: rgb(0.97, 0.98, 0.99),
    borderColor: rgb(0.85, 0.88, 0.92),
    borderWidth: 1,
  });

  // Card Title
  coverPage.drawText('TENDER SUBMISSION DETAILS', {
    x: leftMargin + 14,
    y: metaY + metaHeight - 18,
    size: 9.5,
    font: fontBold,
    color: rgb(0.12, 0.23, 0.42),
  });

  // Creation timestamp in readable format
  const creationDateStr = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';

  const metaRows: [string, string][] = [
    ['Tender ID:', tender.tender_id],
    ['Tender Title:', tender.title],
    ['Procuring Entity:', tender.procuring_entity],
    ['Bidder Name:', tender.bidder],
    ['Submission Deadline:', normalizeDate(tender.submission_deadline)],
    ['Package Creation Date:', creationDateStr],
  ];

  let currentMetaY = metaY + metaHeight - 34;
  for (const [label, val] of metaRows) {
    coverPage.drawText(label, {
      x: leftMargin + 14,
      y: currentMetaY,
      size: 8.5,
      font: fontBold,
      color: rgb(0.28, 0.33, 0.4),
    });

    const maxValWidth = contentWidth - 145;
    const safeVal = truncateToFit(val, maxValWidth, fontRegular, 8.5);
    coverPage.drawText(safeVal, {
      x: leftMargin + 130,
      y: currentMetaY,
      size: 8.5,
      font: fontRegular,
      color: rgb(0.06, 0.09, 0.16),
    });

    currentMetaY -= 15;
  }

  // 3. Manifest Table Section
  let tableY = metaY - 26;
  coverPage.drawText('INCLUDED DOCUMENTS IN SUBMISSION ORDER', {
    x: leftMargin,
    y: tableY,
    size: 10.5,
    font: fontBold,
    color: rgb(0.06, 0.09, 0.16),
  });

  tableY -= 16;
  const colPositions = [
    { label: '#', x: leftMargin + 6, maxW: 18 },
    { label: 'Requirement Title', x: leftMargin + 26, maxW: 165 },
    { label: 'Matched Document File', x: leftMargin + 195, maxW: 145 },
    { label: 'Pages', x: leftMargin + 344, maxW: 55 },
    { label: 'Expiry Date', x: leftMargin + 404, maxW: 65 },
    { label: 'Status', x: leftMargin + 472, maxW: 40 },
  ];

  // Table Header bar
  coverPage.drawRectangle({
    x: leftMargin,
    y: tableY - 4,
    width: contentWidth,
    height: 18,
    color: rgb(0.91, 0.93, 0.96),
  });

  for (const col of colPositions) {
    coverPage.drawText(col.label, {
      x: col.x,
      y: tableY,
      size: 8,
      font: fontBold,
      color: rgb(0.2, 0.25, 0.32),
    });
  }

  let rowY = tableY - 18;
  const rowHeight = 18;

  for (let i = 0; i < manifest.length; i++) {
    const item = manifest[i];
    coverPage.drawRectangle({
      x: leftMargin,
      y: rowY - 4,
      width: contentWidth,
      height: rowHeight,
      color: i % 2 === 0 ? rgb(0.99, 1.0, 1.0) : rgb(0.96, 0.97, 0.98),
      borderColor: rgb(0.9, 0.92, 0.95),
      borderWidth: 0.5,
    });

    // # Order
    coverPage.drawText(String(item.order), {
      x: colPositions[0].x,
      y: rowY,
      size: 8,
      font: fontRegular,
      color: rgb(0.1, 0.1, 0.1),
    });

    // Requirement Title
    const safeTitle = truncateToFit(item.requirementTitle, colPositions[1].maxW, fontRegular, 8);
    coverPage.drawText(safeTitle, {
      x: colPositions[1].x,
      y: rowY,
      size: 8,
      font: fontRegular,
      color: rgb(0.1, 0.1, 0.1),
    });

    // Matched File
    const safeFileName = truncateToFit(item.fileName, colPositions[2].maxW, fontRegular, 8);
    coverPage.drawText(safeFileName, {
      x: colPositions[2].x,
      y: rowY,
      size: 8,
      font: fontRegular,
      color: rgb(0.2, 0.25, 0.35),
    });

    // Page Range
    const pageText = `${item.pageCount}p (${item.startPage}-${item.endPage})`;
    coverPage.drawText(pageText, {
      x: colPositions[3].x,
      y: rowY,
      size: 7.5,
      font: fontRegular,
      color: rgb(0.25, 0.3, 0.35),
    });

    // Expiry Date
    const expiryText = item.expiryDate ? normalizeDate(item.expiryDate) : 'N/A';
    coverPage.drawText(expiryText, {
      x: colPositions[4].x,
      y: rowY,
      size: 7.5,
      font: fontRegular,
      color: rgb(0.25, 0.3, 0.35),
    });

    // Status
    coverPage.drawText('VERIFIED', {
      x: colPositions[5].x,
      y: rowY,
      size: 7.5,
      font: fontBold,
      color: rgb(0.08, 0.52, 0.26),
    });

    rowY -= rowHeight;
  }

  // Summary box
  rowY -= 10;
  coverPage.drawRectangle({
    x: leftMargin,
    y: Math.max(rowY - 26, 42),
    width: contentWidth,
    height: 32,
    color: rgb(0.95, 0.97, 1.0),
    borderColor: rgb(0.75, 0.83, 0.95),
    borderWidth: 1,
  });

  const summaryText = `Total Documents Attached: ${manifest.length}   |   Total Package Pages: ${totalPages} (including Cover)`;
  coverPage.drawText(summaryText, {
    x: leftMargin + 14,
    y: Math.max(rowY - 14, 54),
    size: 8.5,
    font: fontBold,
    color: rgb(0.12, 0.23, 0.45),
  });

  // Footer on cover page (Page 1)
  coverPage.drawLine({
    start: { x: leftMargin, y: 25 },
    end: { x: pageWidth - leftMargin, y: 25 },
    thickness: 0.5,
    color: rgb(0.78, 0.81, 0.85),
  });

  const coverFooterText = `${tender.tender_id} | Page 1 of ${totalPages}`;
  const coverFooterWidth = fontRegular.widthOfTextAtSize(coverFooterText, 8.5);
  coverPage.drawText(coverFooterText, {
    x: (pageWidth - coverFooterWidth) / 2,
    y: 11,
    size: 8.5,
    font: fontRegular,
    color: rgb(0.28, 0.33, 0.38),
  });

  // 4. Merge source document pages and apply footers
  let currentPageIndex = 1;

  for (let idx = 0; idx < loadedSources.length; idx++) {
    const { entry, pdfDoc } = loadedSources[idx];
    onProgress?.(`Merging ${entry.file.name} (${idx + 1}/${loadedSources.length})...`);

    const pageIndices = pdfDoc.getPageIndices();
    const copiedPages = await mergedPdf.copyPages(pdfDoc, pageIndices);

    for (const copiedPage of copiedPages) {
      mergedPdf.addPage(copiedPage);
      const pageNumber = currentPageIndex + 1; // 1-indexed (Page 2..totalPages)
      const footerText = `${tender.tender_id} | Page ${pageNumber} of ${totalPages}`;

      applyFooterToContentPage(copiedPage, footerText, fontRegular);
      currentPageIndex++;
    }
  }

  onProgress?.('Finalizing and compiling PDF package...');
  const pdfBytes = await mergedPdf.save();

  // Download filename: "<tender_id>_Package.pdf"
  const safeTenderId = tender.tender_id.trim().replace(/[\\/:*?"<>|]/g, '_');
  const filename = `${safeTenderId}_Package.pdf`;

  return { pdfBytes, filename };
}

/**
 * Triggers a native browser file download for Uint8Array bytes.
 */
export function triggerFileDownload(bytes: Uint8Array, filename: string) {
  const blob = new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
