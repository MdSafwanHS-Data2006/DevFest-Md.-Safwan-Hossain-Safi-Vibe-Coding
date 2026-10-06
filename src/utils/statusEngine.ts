import type { Requirement, UploadedFile, RequirementStatus, BlockingIssue } from '../types';

/**
 * Normalizes a date string to YYYY-MM-DD.
 * Handles ISO dates (e.g. 2026-11-20T14:00:00Z) or plain YYYY-MM-DD.
 */
export function normalizeDate(dateStr: string): string {
  if (!dateStr) return '';
  const trimmed = dateStr.trim();
  // If format contains 'T' or space, take the first part
  const match = trimmed.match(/^(\d{4}-\d{2}-\d{2})/);
  if (match) return match[1];

  // Try parsing with Date object as fallback
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }
  return trimmed;
}

/**
 * Checks if the expiry date is on or after the tender submission deadline.
 * Same-day expiry as submission deadline is valid.
 */
export function isExpiryValid(expiryDateStr: string, deadlineStr: string): boolean {
  if (!expiryDateStr || !deadlineStr) return false;
  const exp = normalizeDate(expiryDateStr);
  const dl = normalizeDate(deadlineStr);
  if (!exp || !dl) return false;
  return exp >= dl;
}

/**
 * Evaluates the status of a single requirement according to contest rules:
 * - Missing: mandatory + no file
 * - Not provided: optional + no file
 * - Expiry date needed: has_expiry + matched file + no expiry date
 * - Expired: expiry date before submission deadline
 * - OK: matched + expiry valid when applicable
 */
export function evaluateRequirementStatus(
  req: Requirement,
  matchedFile: UploadedFile | undefined,
  expiryDate: string | undefined,
  submissionDeadline: string
): RequirementStatus {
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

/**
 * Gathers all blocking issues preventing package generation:
 * - Mandatory requirement missing a file
 * - Expiry date needed for a matched file
 * - Document has expired before submission deadline
 * - Duplicate files (identical content hash) matched to different requirements
 */
export function getBlockingIssues(
  requirements: Requirement[],
  files: UploadedFile[],
  matches: Record<string, string | undefined>,
  expiryDates: Record<string, string | undefined>,
  submissionDeadline: string
): BlockingIssue[] {
  const issues: BlockingIssue[] = [];

  // Check requirement statuses
  for (const req of requirements) {
    const fileId = matches[req.id];
    const file = fileId ? files.find(f => f.id === fileId) : undefined;
    const expiry = expiryDates[req.id];
    const status = evaluateRequirementStatus(req, file, expiry, submissionDeadline);

    if (status === 'MISSING') {
      issues.push({
        id: `missing-${req.id}`,
        reqOrder: req.order,
        reqTitleEn: req.title_en,
        reqTitleBn: req.title_bn,
        type: 'MISSING',
        messageEn: `Mandatory requirement #${req.order} (${req.title_en}) is missing an attached PDF document.`,
        messageBn: `বাধ্যতামূলক শর্ত #${req.order} (${req.title_bn})-এ কোনো পিডিএফ নথি সংযুক্ত করা হয়নি।`,
      });
    } else if (status === 'EXPIRY_NEEDED') {
      issues.push({
        id: `expiry-needed-${req.id}`,
        reqOrder: req.order,
        reqTitleEn: req.title_en,
        reqTitleBn: req.title_bn,
        type: 'EXPIRY_NEEDED',
        messageEn: `Requirement #${req.order} (${req.title_en}) requires an expiry date for the matched document.`,
        messageBn: `শর্ত #${req.order} (${req.title_bn})-এর সংযুক্ত নথির মেয়াদের তারিখ প্রদান করা প্রয়োজন।`,
      });
    } else if (status === 'EXPIRED') {
      issues.push({
        id: `expired-${req.id}`,
        reqOrder: req.order,
        reqTitleEn: req.title_en,
        reqTitleBn: req.title_bn,
        type: 'EXPIRED',
        messageEn: `Document for #${req.order} (${req.title_en}) expired on ${expiry} (before submission deadline ${normalizeDate(submissionDeadline)}).`,
        messageBn: `শর্ত #${req.order} (${req.title_bn})-এর নথির মেয়াদ ${expiry} তারিখে উত্তীর্ণ হয়েছে (জমা দেওয়ার সময়সীমা ${normalizeDate(submissionDeadline)}-এর পূর্বে)।`,
      });
    }
  }

  // Check duplicate matches:
  // "Do not allow duplicate files to be matched to different requirements."
  const matchedHashes = new Map<string, { reqOrder: number; reqTitleEn: string; reqTitleBn: string; fileName: string }>();

  for (const req of requirements) {
    const fileId = matches[req.id];
    if (!fileId) continue;
    const file = files.find(f => f.id === fileId);
    if (!file) continue;

    if (matchedHashes.has(file.hash)) {
      const prev = matchedHashes.get(file.hash)!;
      issues.push({
        id: `duplicate-match-${req.id}`,
        reqOrder: req.order,
        reqTitleEn: req.title_en,
        reqTitleBn: req.title_bn,
        type: 'DUPLICATE_MATCH',
        messageEn: `Duplicate content matched: "${file.name}" has identical content to "${prev.fileName}" (matched to #${prev.reqOrder}). Duplicate files cannot be matched to different requirements.`,
        messageBn: `অনুরূপ ফাইল ম্যাচ করা হয়েছে: "${file.name}"-এর বিষয়বস্তু #${prev.reqOrder}-এর "${prev.fileName}"-এর সাথে হুবহু এক। একই ফাইল একাধিক শর্তে ব্যবহার করা যাবে না।`,
      });
    } else {
      matchedHashes.set(file.hash, {
        reqOrder: req.order,
        reqTitleEn: req.title_en,
        reqTitleBn: req.title_bn,
        fileName: file.name,
      });
    }
  }

  return issues;
}
