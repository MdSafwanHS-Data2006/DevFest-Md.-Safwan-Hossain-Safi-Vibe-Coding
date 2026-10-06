import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import type { TenderInfo, Requirement, UploadedFile } from '../types';
import { computeFileHash } from './hash';

export const SAMPLE_TENDER: TenderInfo = {
  tender_id: 'WD-2026-PKG-094',
  title: 'Procurement of High-Capacity Server Hardware and Archival Storage',
  procuring_entity: 'Directorate General of Information & Communication Technology (DoICT)',
  bidder: 'Apex Technologies & Solutions Consortium Ltd.',
  submission_deadline: '2026-11-20',
};

export const SAMPLE_REQUIREMENTS: Requirement[] = [
  {
    id: 'req-01',
    order: 1,
    title_en: 'Up-to-date Valid Trade License',
    title_bn: 'হালনাগাদ বৈধ ট্রেড লাইসেন্স',
    is_mandatory: true,
    has_expiry: true,
  },
  {
    id: 'req-02',
    order: 2,
    title_en: 'TIN & Latest Income Tax Assessment Certificate',
    title_bn: 'টিআইএন ও সর্বশেষ আয়কর দাখিলের সনদ',
    is_mandatory: true,
    has_expiry: false,
  },
  {
    id: 'req-03',
    order: 3,
    title_en: 'BIN / 13-Digit VAT Registration Certificate',
    title_bn: 'বিআইএন / ১৩ ডিজিটের ভ্যাট নিবন্ধন সনদ',
    is_mandatory: true,
    has_expiry: false,
  },
  {
    id: 'req-04',
    order: 4,
    title_en: "Manufacturer's Authorization Form (MAF)",
    title_bn: 'প্রস্তুতকারকের অনুমোদনপত্র (MAF)',
    is_mandatory: true,
    has_expiry: true,
  },
  {
    id: 'req-05',
    order: 5,
    title_en: 'Bank Solvency & Credit Facility Certificate',
    title_bn: 'ব্যাংক স্বচ্ছলতা ও আর্থিক সক্ষমতার সনদ',
    is_mandatory: true,
    has_expiry: true,
  },
  {
    id: 'req-06',
    order: 6,
    title_en: 'ISO 9001:2015 Quality Management Certificate',
    title_bn: 'আইএসও ৯০০১:২০১৫ মান নিয়ন্ত্রণ সনদ',
    is_mandatory: false,
    has_expiry: true,
  },
  {
    id: 'req-07',
    order: 7,
    title_en: 'Similar Work Experience & Completion Certificates',
    title_bn: 'অনুরূপ কাজের অভিজ্ঞতা ও সমাপনী সনদপত্র',
    is_mandatory: false,
    has_expiry: false,
  },
];

/**
 * Parses an imported JSON object into TenderInfo and Requirement[] with resilient fallbacks.
 */
export function parseRequirementsJson(jsonData: any): {
  tender: TenderInfo;
  requirements: Requirement[];
} {
  const tenderSource = jsonData.tender || jsonData;

  const tender: TenderInfo = {
    tender_id: String(tenderSource.tender_id || tenderSource.id || 'TENDER-DEFAULT-001'),
    title: String(tenderSource.title || tenderSource.tender_title || 'Tender Submission'),
    procuring_entity: String(
      tenderSource.procuring_entity ||
      tenderSource.entity ||
      tenderSource.authority ||
      'Procuring Entity'
    ),
    bidder: String(tenderSource.bidder || tenderSource.bidder_name || 'Participating Bidder'),
    submission_deadline: String(
      tenderSource.submission_deadline ||
      tenderSource.deadline ||
      new Date().toISOString().split('T')[0]
    ),
  };

  const rawReqs = Array.isArray(jsonData.requirements)
    ? jsonData.requirements
    : Array.isArray(jsonData.tender?.requirements)
    ? jsonData.tender.requirements
    : [];

  const requirements: Requirement[] = rawReqs.map((r: any, idx: number) => {
    const order = typeof r.order === 'number' ? r.order : typeof r.seq === 'number' ? r.seq : idx + 1;
    const isMandatory =
      r.mandatory !== undefined
        ? Boolean(r.mandatory)
        : r.is_mandatory !== undefined
        ? Boolean(r.is_mandatory)
        : r.required !== undefined
        ? Boolean(r.required)
        : true;

    const hasExpiry =
      r.has_expiry !== undefined
        ? Boolean(r.has_expiry)
        : r.expiry_required !== undefined
        ? Boolean(r.expiry_required)
        : r.expires !== undefined
        ? Boolean(r.expires)
        : false;

    return {
      id: String(r.id || r.req_id || `req-${order}-${idx}`),
      order,
      title_en: String(r.title_en || r.title || `Requirement ${order}`),
      title_bn: String(r.title_bn || r.title || r.title_en || `শর্ত ${order}`),
      is_mandatory: isMandatory,
      has_expiry: hasExpiry,
    };
  });

  // Sort requirements by numeric order
  requirements.sort((a, b) => a.order - b.order);

  return { tender, requirements };
}

/**
 * Generates lightweight sample PDF documents entirely in the browser for instant testing.
 * Includes multiple pages and simulated official document styling.
 */
export async function createDemoPdf(
  docTitle: string,
  pageCount: number = 2,
  stampColor: [number, number, number] = [0.1, 0.3, 0.6]
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const fontRegular = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  for (let p = 1; p <= pageCount; p++) {
    const page = doc.addPage([595.28, 841.89]);
    const { width, height } = page.getSize();

    // Top decorative bar
    page.drawRectangle({
      x: 36,
      y: height - 60,
      width: width - 72,
      height: 24,
      color: rgb(stampColor[0], stampColor[1], stampColor[2]),
    });

    page.drawText('DEMO VERIFICATION DOCUMENT', {
      x: 48,
      y: height - 52,
      size: 10,
      font: fontBold,
      color: rgb(1, 1, 1),
    });

    // Main document title
    page.drawText(docTitle, {
      x: 48,
      y: height - 100,
      size: 16,
      font: fontBold,
      color: rgb(0.1, 0.15, 0.25),
    });

    page.drawText(`Page ${p} of ${pageCount} — Official Certified Copy`, {
      x: 48,
      y: height - 120,
      size: 9.5,
      font: fontRegular,
      color: rgb(0.4, 0.45, 0.5),
    });

    // Content box with sample lines
    const boxY = height - 380;
    page.drawRectangle({
      x: 48,
      y: boxY,
      width: width - 96,
      height: 230,
      color: rgb(0.98, 0.99, 1.0),
      borderColor: rgb(0.85, 0.88, 0.92),
      borderWidth: 1,
    });

    const sampleLines = [
      `Document Reference: REF-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      `Issuing Authority: Government Regulatory Licensing Division`,
      `Bidder Organization: Apex Technologies & Solutions Consortium Ltd.`,
      `Document Classification: Formal Tender Submission Attachment`,
      `Certified Authenticity: Verified electronically for tender compliance.`,
      `Page Sequence: Original page ${p} preserving internal pagination.`,
      `Remarks: This document has been generated for verification testing.`,
    ];

    let lineY = boxY + 200;
    for (const line of sampleLines) {
      page.drawText(line, {
        x: 64,
        y: lineY,
        size: 9,
        font: fontRegular,
        color: rgb(0.2, 0.25, 0.3),
      });
      lineY -= 22;
    }

    // Official Seal watermark representation
    page.drawCircle({
      x: width - 110,
      y: boxY + 70,
      size: 38,
      borderColor: rgb(stampColor[0], stampColor[1], stampColor[2]),
      borderWidth: 2,
      color: rgb(1, 1, 1),
    });

    page.drawText('VERIFIED', {
      x: width - 134,
      y: boxY + 66,
      size: 10,
      font: fontBold,
      color: rgb(stampColor[0], stampColor[1], stampColor[2]),
    });
  }

  return await doc.save();
}

/**
 * Creates a complete suite of demo uploaded files ready for test matching.
 */
export async function createDemoUploadFiles(): Promise<UploadedFile[]> {
  const demos = [
    { name: '01_Trade_License_2026.pdf', title: 'Official Trade License (2026-2027)', pages: 2, color: [0.1, 0.4, 0.2] as [number, number, number] },
    { name: '02_TIN_Tax_Assessment.pdf', title: 'Tax Identification Number (TIN) Certificate', pages: 1, color: [0.1, 0.2, 0.5] as [number, number, number] },
    { name: '03_BIN_VAT_Registration.pdf', title: '13-Digit Business Identification & VAT Certificate', pages: 1, color: [0.5, 0.2, 0.1] as [number, number, number] },
    { name: '04_Manufacturer_Authorization_MAF.pdf', title: "Manufacturer's Official Authorization Letter", pages: 3, color: [0.2, 0.1, 0.5] as [number, number, number] },
    { name: '05_Bank_Solvency_Certificate.pdf', title: 'Certified Bank Solvency & Credit Guarantee', pages: 2, color: [0.1, 0.4, 0.5] as [number, number, number] },
    { name: '06_ISO_9001_Quality_Cert.pdf', title: 'ISO 9001:2015 Quality Accreditation Certificate', pages: 2, color: [0.4, 0.3, 0.1] as [number, number, number] },
  ];

  const results: UploadedFile[] = [];

  for (const item of demos) {
    const bytes = await createDemoPdf(item.title, item.pages, item.color);
    const hash = await computeFileHash(bytes.buffer as ArrayBuffer);
    results.push({
      id: `demo-${item.name}-${Date.now()}`,
      name: item.name,
      size: bytes.byteLength,
      pageCount: item.pages,
      hash,
      data: bytes,
      uploadedAt: Date.now(),
    });
  }

  return results;
}
