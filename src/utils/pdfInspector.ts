import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument } from 'pdf-lib';

// Configure pdfjs worker if available
try {
  // Use worker url from pdfjs-dist
  if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url
    ).toString();
  }
} catch (e) {
  console.warn('Could not initialize pdf.js worker URL, using fallback:', e);
}

/**
 * Inspects a PDF's ArrayBuffer to retrieve its total page count.
 * Uses pdf.js first as requested by technical direction, falling back to pdf-lib.
 */
export async function getPdfPageCount(data: Uint8Array): Promise<number> {
  // Try pdf.js first
  try {
    const loadingTask = pdfjsLib.getDocument({
      data: data.slice(0),
      useSystemFonts: true,
    });
    const pdfDoc = await loadingTask.promise;
    return pdfDoc.numPages;
  } catch (pdfjsErr) {
    console.warn('pdf.js inspection encountered an issue, falling back to pdf-lib:', pdfjsErr);
    // Reliable fallback using pdf-lib
    const pdfDoc = await PDFDocument.load(data, { ignoreEncryption: true });
    return pdfDoc.getPageCount();
  }
}
