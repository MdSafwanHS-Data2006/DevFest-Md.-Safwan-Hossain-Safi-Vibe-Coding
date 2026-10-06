import React from 'react';
import { useI18n } from '../i18n/I18nContext';
import type { Requirement, UploadedFile, TenderInfo, RequirementStatus } from '../types';
import { evaluateRequirementStatus, isExpiryValid, normalizeDate } from '../utils/statusEngine';
import {
  Calendar,
  AlertCircle,
  CheckCircle2,
  ClockAlert,
  CalendarClock,
  MinusCircle,
  FileText,
  X,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Info
} from 'lucide-react';

interface MatchingSectionProps {
  tender: TenderInfo;
  requirements: Requirement[];
  files: UploadedFile[];
  matches: Record<string, string | undefined>;
  expiryDates: Record<string, string | undefined>;
  onMatchChange: (reqId: string, fileId: string | undefined) => void;
  onExpiryChange: (reqId: string, date: string) => void;
  onAutoMatch: () => void;
  onNextStep: () => void;
  onPrevStep: () => void;
}

export const MatchingSection: React.FC<MatchingSectionProps> = ({
  tender,
  requirements,
  files,
  matches,
  expiryDates,
  onMatchChange,
  onExpiryChange,
  onAutoMatch,
  onNextStep,
  onPrevStep,
}) => {
  const { language, t } = useI18n();

  // Create lookup of matched file IDs and their hashes
  // fileId -> req
  const matchedFileToReq = new Map<string, Requirement>();
  // hash -> { file: UploadedFile, req: Requirement }
  const matchedHashToInfo = new Map<string, { file: UploadedFile; req: Requirement }>();

  for (const [rId, fId] of Object.entries(matches)) {
    if (!fId) continue;
    const req = requirements.find(r => r.id === rId);
    const file = files.find(f => f.id === fId);
    if (req && file) {
      matchedFileToReq.set(file.id, req);
      matchedHashToInfo.set(file.hash, { file, req });
    }
  }

  const renderStatusBadge = (status: RequirementStatus) => {
    switch (status) {
      case 'OK':
        return (
          <span className="badge badge-success" title={t('descOk')}>
            <CheckCircle2 size={13} />
            <span>{t('statusOk')}</span>
          </span>
        );
      case 'MISSING':
        return (
          <span className="badge badge-danger" title={t('descMissing')}>
            <AlertCircle size={13} />
            <span>{t('statusMissing')}</span>
          </span>
        );
      case 'EXPIRY_NEEDED':
        return (
          <span className="badge badge-warning" title={t('descExpiryNeeded')}>
            <CalendarClock size={13} />
            <span>{t('statusExpiryNeeded')}</span>
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="badge badge-danger-solid" title={t('descExpired')}>
            <ClockAlert size={13} />
            <span>{t('statusExpired')}</span>
          </span>
        );
      case 'NOT_PROVIDED':
        return (
          <span className="badge badge-neutral" title={t('descNotProvided')}>
            <MinusCircle size={13} />
            <span>{t('statusNotProvided')}</span>
          </span>
        );
    }
  };

  return (
    <div className="section-container">
      {/* Section Header */}
      <div className="section-header-actions">
        <div>
          <h2 className="section-title">{t('matchTitle')}</h2>
          <p className="section-subtitle">{t('matchSubtitle')}</p>
        </div>

        <div className="header-button-group">
          {files.length > 0 && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onAutoMatch}
              title={t('autoMatchBtn')}
            >
              <Sparkles size={16} />
              <span>{t('autoMatchBtn')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Matching Instructions Notice */}
      <div className="info-callout-card">
        <div className="callout-icon">
          <Info size={18} />
        </div>
        <div className="callout-content">
          <p className="callout-text">{t('matchInstructions')}</p>
          <p className="callout-subtext">
            {t('submissionDeadline')}:{' '}
            <strong className="text-navy">{normalizeDate(tender.submission_deadline)}</strong>{' '}
            (Same-day expiry is accepted as valid).
          </p>
        </div>
      </div>

      {files.length === 0 && (
        <div className="alert-banner alert-warning">
          <AlertCircle size={18} />
          <span>{t('noFilesUploadedHint')}</span>
        </div>
      )}

      {/* Requirements List Cards */}
      <div className="match-cards-list">
        {requirements.map((req) => {
          const title = language === 'bn' ? req.title_bn : req.title_en;
          const secondaryTitle = language === 'bn' ? req.title_en : req.title_bn;
          const matchedFileId = matches[req.id];
          const matchedFile = matchedFileId ? files.find(f => f.id === matchedFileId) : undefined;
          const expiryDate = expiryDates[req.id] || '';

          const status = evaluateRequirementStatus(
            req,
            matchedFile,
            expiryDate,
            tender.submission_deadline
          );

          const isExpValid = expiryDate
            ? isExpiryValid(expiryDate, tender.submission_deadline)
            : false;

          return (
            <div
              key={req.id}
              className={`match-card status-border-${status.toLowerCase()}`}
            >
              {/* Top row: Order, Title, Badges, Status */}
              <div className="match-card-header">
                <div className="match-card-title-group">
                  <span className="order-number-badge">#{req.order}</span>
                  <div>
                    <h3 className="match-req-title">{title}</h3>
                    {secondaryTitle && (
                      <span className="match-req-secondary">{secondaryTitle}</span>
                    )}
                  </div>
                </div>

                <div className="match-card-meta-badges">
                  <span
                    className={`badge ${
                      req.is_mandatory ? 'badge-mandatory' : 'badge-optional'
                    }`}
                  >
                    {req.is_mandatory ? t('mandatoryBadge') : t('optionalBadge')}
                  </span>

                  <span
                    className={`badge ${
                      req.has_expiry ? 'badge-warning' : 'badge-neutral'
                    }`}
                  >
                    {req.has_expiry ? t('expiryNeededBadge') : t('noExpiryNeededBadge')}
                  </span>

                  {renderStatusBadge(status)}
                </div>
              </div>

              {/* Bottom row: File Selector & Expiry Input */}
              <div className="match-controls-row">
                {/* File Dropdown Selector */}
                <div className="match-field-group flex-1">
                  <label className="match-field-label">
                    <FileText size={14} />
                    <span>{t('matchedFileLabel')}</span>
                  </label>

                  <div className="match-select-wrapper">
                    <select
                      className="match-select-input"
                      value={matchedFileId || ''}
                      onChange={(e) => onMatchChange(req.id, e.target.value || undefined)}
                    >
                      <option value="">{t('selectFilePlaceholder')}</option>
                      {files.map((file) => {
                        const isCurrentlySelected = file.id === matchedFileId;
                        const isMatchedToOther =
                          !isCurrentlySelected && matchedFileToReq.has(file.id);
                        const otherReq = isMatchedToOther
                          ? matchedFileToReq.get(file.id)
                          : undefined;

                        // Check duplicate content match restriction
                        // "Do not allow duplicate files to be matched to different requirements."
                        const matchedHashInfo = matchedHashToInfo.get(file.hash);
                        const isDuplicateOfOtherMatched =
                          !isCurrentlySelected &&
                          !isMatchedToOther &&
                          matchedHashInfo &&
                          matchedHashInfo.req.id !== req.id;

                        let disabledReason = '';
                        if (isMatchedToOther && otherReq) {
                          disabledReason = ` — ${t('matchedToOther', { order: otherReq.order })}`;
                        } else if (isDuplicateOfOtherMatched && matchedHashInfo) {
                          disabledReason = ` — ${t('duplicateOfMatched', {
                            file: matchedHashInfo.file.name,
                            order: matchedHashInfo.req.order,
                          })}`;
                        }

                        const isDisabled = isMatchedToOther || isDuplicateOfOtherMatched;

                        return (
                          <option
                            key={file.id}
                            value={file.id}
                            disabled={isDisabled}
                          >
                            {file.name} ({file.pageCount} pp, {(file.size / 1024).toFixed(0)} KB)
                            {disabledReason}
                          </option>
                        );
                      })}
                    </select>

                    {matchedFileId && (
                      <button
                        type="button"
                        className="btn-unmatch"
                        onClick={() => onMatchChange(req.id, undefined)}
                        title={t('unmatchBtn')}
                      >
                        <X size={14} />
                        <span>{t('unmatchBtn')}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Expiry Date Input (Shown when has_expiry is true) */}
                {req.has_expiry && (
                  <div className="match-field-group expiry-field-group">
                    <label className="match-field-label">
                      <Calendar size={14} />
                      <span>{t('expiryDateLabel')}</span>
                    </label>

                    <div className="expiry-input-wrapper">
                      <input
                        type="date"
                        className={`expiry-date-input ${
                          matchedFileId && !expiryDate
                            ? 'input-warning'
                            : expiryDate && !isExpValid
                            ? 'input-danger'
                            : expiryDate && isExpValid
                            ? 'input-success'
                            : ''
                        }`}
                        value={expiryDate}
                        onChange={(e) => onExpiryChange(req.id, e.target.value)}
                        placeholder={t('expiryDatePlaceholder')}
                      />
                    </div>

                    {/* Expiry validity hint */}
                    {expiryDate && (
                      <span
                        className={`expiry-hint ${
                          isExpValid ? 'hint-success' : 'hint-danger'
                        }`}
                      >
                        {isExpValid
                          ? t('expiryValidHint', { deadline: normalizeDate(tender.submission_deadline) })
                          : t('expiryInvalidHint', { deadline: normalizeDate(tender.submission_deadline) })}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Buttons */}
      <div className="section-footer-nav">
        <button type="button" className="btn btn-secondary" onClick={onPrevStep}>
          <ArrowLeft size={16} />
          <span>{t('back')}</span>
        </button>

        <button type="button" className="btn btn-primary" onClick={onNextStep}>
          <span>{t('next')}: {t('stepValidation')}</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};
