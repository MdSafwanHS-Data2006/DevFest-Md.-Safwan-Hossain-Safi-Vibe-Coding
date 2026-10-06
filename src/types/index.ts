export type Language = 'en' | 'bn';

export interface TenderInfo {
  tender_id: string;
  title: string;
  procuring_entity: string;
  bidder: string;
  submission_deadline: string;
}

export interface Requirement {
  id: string;
  order: number;
  title_en: string;
  title_bn: string;
  is_mandatory: boolean;
  has_expiry: boolean;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  pageCount: number;
  hash: string;
  data: Uint8Array;
  uploadedAt: number;
}

export type RequirementStatus =
  | 'MISSING'
  | 'EXPIRY_NEEDED'
  | 'EXPIRED'
  | 'NOT_PROVIDED'
  | 'OK';

export interface BlockingIssue {
  id: string;
  reqOrder: number;
  reqTitleEn: string;
  reqTitleBn: string;
  type: 'MISSING' | 'EXPIRY_NEEDED' | 'EXPIRED' | 'DUPLICATE_MATCH';
  messageEn: string;
  messageBn: string;
}

export interface RequirementMatchState {
  requirementId: string;
  matchedFileId?: string;
  expiryDate?: string;
}
