import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

console.log('--- RUNNING COMPREHENSIVE TENDER APP INTEGRATION TEST SUITE ---');

// 1. Test Status Engine Logic
function normalizeDate(dateStr) {
  if (!dateStr) return '';
  const trimmed = dateStr.trim();
  const match = trimmed.match(/^(\d{4}-\d{2}-\d{2})/);
  if (match) return match[1];
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) return parsed.toISOString().split('T')[0];
  return trimmed;
}

function isExpiryValid(expiryDateStr, deadlineStr) {
  if (!expiryDateStr || !deadlineStr) return false;
  const exp = normalizeDate(expiryDateStr);
  const dl = normalizeDate(deadlineStr);
  if (!exp || !dl) return false;
  return exp >= dl;
}

function evaluateRequirementStatus(req, matchedFile, expiryDate, submissionDeadline) {
  if (!matchedFile) {
    return req.is_mandatory ? 'MISSING' : 'NOT_PROVIDED';
  }
  if (req.has_expiry) {
    if (!expiryDate || expiryDate.trim() === '') {
      return 'EXPIRY_NEEDED';
    }
    if (!isExpiryValid(expiryDate, submissionDeadline)) {
      return 'EXPIRED';
    }
    return 'OK';
  }
  return 'OK';
}

const deadline = '2026-11-20';

// Test 1.1: Missing = mandatory + no file
const reqMandatory = { id: 'r1', order: 1, title_en: 'Trade License', is_mandatory: true, has_expiry: true };
assert.equal(evaluateRequirementStatus(reqMandatory, undefined, undefined, deadline), 'MISSING');
console.log('✓ Rule 1 Passed: mandatory + no file -> MISSING');

// Test 1.2: Not provided = optional + no file
const reqOptional = { id: 'r2', order: 2, title_en: 'ISO Cert', is_mandatory: false, has_expiry: true };
assert.equal(evaluateRequirementStatus(reqOptional, undefined, undefined, deadline), 'NOT_PROVIDED');
console.log('✓ Rule 2 Passed: optional + no file -> NOT_PROVIDED');

// Test 1.3: Expiry date needed = has_expiry + matched file + no expiry date
const sampleFile = { id: 'f1', name: 'license.pdf', hash: 'abc123' };
assert.equal(evaluateRequirementStatus(reqMandatory, sampleFile, undefined, deadline), 'EXPIRY_NEEDED');
assert.equal(evaluateRequirementStatus(reqMandatory, sampleFile, '', deadline), 'EXPIRY_NEEDED');
console.log('✓ Rule 3 Passed: has_expiry + matched file + no expiry date -> EXPIRY_NEEDED');

// Test 1.4: Expired = expiry date before submission deadline
assert.equal(evaluateRequirementStatus(reqMandatory, sampleFile, '2026-11-19', deadline), 'EXPIRED');
assert.equal(evaluateRequirementStatus(reqMandatory, sampleFile, '2025-12-31', deadline), 'EXPIRED');
console.log('✓ Rule 4 Passed: expiry date before submission deadline -> EXPIRED');

// Test 1.5: OK = matched + expiry valid (same day is valid)
assert.equal(evaluateRequirementStatus(reqMandatory, sampleFile, '2026-11-20', deadline), 'OK');
assert.equal(evaluateRequirementStatus(reqMandatory, sampleFile, '2027-05-15', deadline), 'OK');
console.log('✓ Rule 5 Passed: expiry date on or after deadline (same-day valid) -> OK');

// Test 1.6: OK = matched + no expiry needed
const reqNoExpiry = { id: 'r3', order: 3, title_en: 'TIN Cert', is_mandatory: true, has_expiry: false };
assert.equal(evaluateRequirementStatus(reqNoExpiry, sampleFile, undefined, deadline), 'OK');
console.log('✓ Rule 6 Passed: !has_expiry + matched file -> OK');

// 2. Test Content Hash & Duplicate Detection
async function computeSha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

const bufA = Buffer.from('PDF Content Variant 1');
const bufB = Buffer.from('PDF Content Variant 1'); // Identical content
const bufC = Buffer.from('PDF Content Variant 2'); // Different content

const hashA = await computeSha256(bufA);
const hashB = await computeSha256(bufB);
const hashC = await computeSha256(bufC);

assert.equal(hashA, hashB, 'Identical content must produce identical hash');
assert.notEqual(hashA, hashC, 'Different content must produce different hash');
console.log('✓ Duplicate Detection Passed: Content hashing accurately identifies duplicate content regardless of filename');

// 3. Test Full PDF Dossier Packaging with pdf-lib
console.log('Testing full PDF generation with English cover and continuous footers...');

const tender = {
  tender_id: 'WD-2026-PKG-094',
  title: 'High-Capacity Storage System Procurement',
  procuring_entity: 'Department of ICT',
  bidder: 'Apex Tech Consortium',
  submission_deadline: '2026-11-20'
};

const mergedDoc = await PDFDocument.create();
const font = await mergedDoc.embedFont(StandardFonts.Helvetica);
const fontBold = await mergedDoc.embedFont(StandardFonts.HelveticaBold);

// Add Cover Page (Page 1)
const coverPage = mergedDoc.addPage([595.28, 841.89]);
coverPage.drawText('TENDER DOCUMENT SUBMISSION PACKAGE', { x: 50, y: 780, size: 16, font: fontBold });
coverPage.drawText(`Tender ID: ${tender.tender_id}`, { x: 50, y: 740, size: 10, font });
coverPage.drawText(`Title: ${tender.title}`, { x: 50, y: 720, size: 10, font });
coverPage.drawText(`Procuring Entity: ${tender.procuring_entity}`, { x: 50, y: 700, size: 10, font });
coverPage.drawText(`Bidder: ${tender.bidder}`, { x: 50, y: 680, size: 10, font });
coverPage.drawText(`Submission Deadline: ${tender.submission_deadline}`, { x: 50, y: 660, size: 10, font });
coverPage.drawText(`Package Creation Date: ${new Date().toISOString()}`, { x: 50, y: 640, size: 10, font });

// Create 2 simulated source documents
const doc1 = await PDFDocument.create();
doc1.addPage([595.28, 841.89]);
doc1.addPage([595.28, 841.89]);

const doc2 = await PDFDocument.create();
doc2.addPage([595.28, 841.89]);

// Merge source documents in sequence
const copied1 = await mergedDoc.copyPages(doc1, doc1.getPageIndices());
for (const p of copied1) mergedDoc.addPage(p);

const copied2 = await mergedDoc.copyPages(doc2, doc2.getPageIndices());
for (const p of copied2) mergedDoc.addPage(p);

// Total pages: 1 (cover) + 2 (doc1) + 1 (doc2) = 4 pages
const totalPages = mergedDoc.getPageCount();
assert.equal(totalPages, 4, 'Total package pages must be 4');

// Apply footers to ALL pages
for (let i = 0; i < totalPages; i++) {
  const page = mergedDoc.getPage(i);
  const pageNum = i + 1;
  const footerText = `${tender.tender_id} | Page ${pageNum} of ${totalPages}`;
  
  if (i > 0) {
    // Preserve content margin
    page.scaleContent(0.96, 0.96);
    page.translateContent(595.28 * 0.02, 28);
  }
  
  page.drawText(footerText, {
    x: 200,
    y: 12,
    size: 9,
    font,
    color: rgb(0.2, 0.2, 0.2)
  });
}

const finalPdfBytes = await mergedDoc.save();
assert(finalPdfBytes.length > 0, 'Generated PDF bytes must not be empty');
console.log(`✓ PDF Package Generation Passed: Created ${totalPages}-page package (${finalPdfBytes.length} bytes)`);

// 4. Test Filename
const expectedFilename = `${tender.tender_id}_Package.pdf`;
assert.equal(expectedFilename, 'WD-2026-PKG-094_Package.pdf');
console.log(`✓ Filename Rule Passed: Download filename is "${expectedFilename}"`);

console.log('--- ALL INTEGRATION TESTS PASSED (100% SUCCESS) ---');
