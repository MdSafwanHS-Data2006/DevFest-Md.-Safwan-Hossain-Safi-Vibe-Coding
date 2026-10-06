import React from 'react';
import { useI18n } from '../i18n/I18nContext';
import type { Requirement, UploadedFile, TenderInfo, BlockingIssue, RequirementStatus } from '../types';
import { evaluateRequirementStatus } from '../utils/statusEngine';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  CalendarClock,
  ClockAlert,
  MinusCircle,
  FileText,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

interface StatusOverviewProps {
  tender: TenderInfo;
  requirements: Requirement[];
  files: UploadedFile[];
  matches: Record<string, string | undefined>;
  expiryDates: Record<string, string | undefined>;
  blockingIssues: BlockingIssue[];
  isReadyToGenerate: boolean;
  onNextStep: () => void;
  onPrevStep: () => void;
  onJumpToMatch: () => void;
}

export const StatusOverview: React.FC<StatusOverviewProps> = ({
  tender,
  requirements,
  files,
  matches,
  expiryDates,
  blockingIssues,
  onNextStep,
  onPrevStep,
  onJumpToMatch,
}) => {
  const { language, t } = useI18n();

  // Calculate status counts
  const statusCounts = {
    OK: 0,
    MISSING: 0,
    EXPIRY_NEEDED: 0,
    EXPIRED: 0,
    NOT_PROVIDED: 0,
  };

  for (const req of requirements) {
    const fileId = matches[req.id];
    const file = fileId ? files.find(f => f.id === fileId) : undefined;
    const expiry = expiryDates[req.id];
    const status = evaluateRequirementStatus(req, file, expiry, tender.submission_deadline);
    statusCounts[status]++;
  }

  const renderBadge = (status: RequirementStatus) => {
    switch (status) {
      case 'OK':
        return (
          <span className="badge badge-success">
            <CheckCircle2 size={13} />
            <span>{t('statusOk')}</span>
          </span>
        );
      case 'MISSING':
        return (
          <span className="badge badge-danger">
            <AlertCircle size={13} />
            <span>{t('statusMissing')}</span>
          </span>
        );
      case 'EXPIRY_NEEDED':
        return (
          <span className="badge badge-warning">
            <CalendarClock size={13} />
            <span>{t('statusExpiryNeeded')}</span>
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="badge badge-danger-solid">
            <ClockAlert size={13} />
            <span>{t('statusExpired')}</span>
          </span>
        );
      case 'NOT_PROVIDED':
        return (
          <span className="badge badge-neutral">
            <MinusCircle size={13} />
            <span>{t('statusNotProvided')}</span>
          </span>
        );
    }
  };

  return (
    <div className="section-container">
      {/* Header */}
      <div className="section-header-actions">
        <div>
          <h2 className="section-title">{t('validationTitle')}</h2>
          <p className="section-subtitle">{t('validationSubtitle')}</p>
        </div>
      </div>

      {/* Summary Scoreboard Cards */}
      <div className="status-metric-grid">
        <div className="metric-card metric-ok">
          <div className="metric-header">
            <CheckCircle2 size={20} />
            <span className="metric-title">{t('statusOk')}</span>
          </div>
          <span className="metric-number">{statusCounts.OK}</span>
          <span className="metric-subtext">Verified & Compliant</span>
        </div>

        <div className="metric-card metric-missing">
          <div className="metric-header">
            <AlertCircle size={20} />
            <span className="metric-title">{t('statusMissing')}</span>
          </div>
          <span className="metric-number">{statusCounts.MISSING}</span>
          <span className="metric-subtext">Mandatory Missing</span>
        </div>

        <div className="metric-card metric-expiry">
          <div className="metric-header">
            <CalendarClock size={20} />
            <span className="metric-title">{t('statusExpiryNeeded')}</span>
          </div>
          <span className="metric-number">{statusCounts.EXPIRY_NEEDED}</span>
          <span className="metric-subtext">Expiry Date Missing</span>
        </div>

        <div className="metric-card metric-expired">
          <div className="metric-header">
            <ClockAlert size={20} />
            <span className="metric-title">{t('statusExpired')}</span>
          </div>
          <span className="metric-number">{statusCounts.EXPIRED}</span>
          <span className="metric-subtext">Invalid / Expired</span>
        </div>

        <div className="metric-card metric-not-provided">
          <div className="metric-header">
            <MinusCircle size={20} />
            <span className="metric-title">{t('statusNotProvided')}</span>
          </div>
          <span className="metric-number">{statusCounts.NOT_PROVIDED}</span>
          <span className="metric-subtext">Optional Omitted</span>
        </div>
      </div>

      {/* Blocking Issues Alert Box or Ready Banner */}
      {blockingIssues.length > 0 ? (
        <div className="blocking-alert-box">
          <div className="blocking-alert-header">
            <ShieldAlert size={24} />
            <div>
              <h3 className="blocking-alert-title">{t('generationBlocked')}</h3>
              <p className="blocking-alert-desc">{t('blockedExplanation')}</p>
            </div>
          </div>

          <div className="blocking-issues-list">
            {blockingIssues.map((issue) => {
              const msg = language === 'bn' ? issue.messageBn : issue.messageEn;
              return (
                <div key={issue.id} className="blocking-issue-item">
                  <AlertCircle size={16} />
                  <div className="blocking-issue-text">
                    <span className="issue-order-tag">Req #{issue.reqOrder}</span>
                    <span>{msg}</span>
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary-sm"
                    onClick={onJumpToMatch}
                  >
                    Fix in Match
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="ready-banner-card">
          <ShieldCheck size={28} />
          <div>
            <h3 className="ready-banner-title">{t('readyToGenerate')}</h3>
            <p className="ready-banner-desc">
              All mandatory tender requirements have been matched with valid documents. No blocking issues detected.
            </p>
          </div>
        </div>
      )}

      {/* Comprehensive Requirements Matrix Table */}
      <div className="matrix-table-card">
        <div className="table-card-header">
          <h3 className="table-card-title">
            <FileText size={18} />
            <span>Complete Requirements Status Engine Matrix</span>
          </h3>
          <span className="table-badge-note">
            {t('summaryStats', {
              ok: statusCounts.OK,
              missing: statusCounts.MISSING,
              expiryNeeded: statusCounts.EXPIRY_NEEDED,
              expired: statusCounts.EXPIRED,
              notProvided: statusCounts.NOT_PROVIDED,
            })}
          </span>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '50px', textAlign: 'center' }}>#</th>
                <th>Requirement Description</th>
                <th style={{ width: '110px', textAlign: 'center' }}>Requirement Type</th>
                <th>Matched Document</th>
                <th style={{ width: '130px', textAlign: 'center' }}>Expiry Date</th>
                <th style={{ width: '160px', textAlign: 'center' }}>Current Status</th>
              </tr>
            </thead>
            <tbody>
              {requirements.map((req) => {
                const title = language === 'bn' ? req.title_bn : req.title_en;
                const fileId = matches[req.id];
                const file = fileId ? files.find(f => f.id === fileId) : undefined;
                const expiry = expiryDates[req.id];
                const status = evaluateRequirementStatus(
                  req,
                  file,
                  expiry,
                  tender.submission_deadline
                );

                return (
                  <tr key={req.id}>
                    <td style={{ textAlign: 'center' }}>
                      <span className="order-number-badge">#{req.order}</span>
                    </td>
                    <td>
                      <span className="font-semibold">{title}</span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span
                        className={`badge ${
                          req.is_mandatory ? 'badge-mandatory' : 'badge-optional'
                        }`}
                      >
                        {req.is_mandatory ? t('mandatoryBadge') : t('optionalBadge')}
                      </span>
                    </td>
                    <td>
                      {file ? (
                        <div className="file-name-cell">
                          <FileText size={14} />
                          <span className="text-navy">{file.name} ({file.pageCount} pp)</span>
                        </div>
                      ) : (
                        <span className="text-muted italic">None</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {req.has_expiry ? (
                        expiry ? (
                          <span className="font-mono text-sm">{expiry}</span>
                        ) : (
                          <span className="badge badge-warning">Required</span>
                        )
                      ) : (
                        <span className="text-muted">N/A</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>{renderBadge(status)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="table-card-footer">
          <button type="button" className="btn btn-secondary" onClick={onPrevStep}>
            <ArrowLeft size={16} />
            <span>{t('back')}</span>
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={onNextStep}
          >
            <span>{t('next')}: {t('stepGenerate')}</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
