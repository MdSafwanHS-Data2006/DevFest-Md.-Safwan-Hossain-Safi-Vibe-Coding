import React, { useRef, useState } from 'react';
import { useI18n } from '../i18n/I18nContext';
import type { TenderInfo, Requirement } from '../types';
import { parseRequirementsJson, SAMPLE_TENDER, SAMPLE_REQUIREMENTS } from '../utils/sampleData';
import {
  FileCode,
  Sparkles,
  Upload,
  Calendar,
  Building2,
  User,
  Hash,
  FileCheck,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { normalizeDate } from '../utils/statusEngine';

interface TenderOverviewProps {
  tender: TenderInfo | null;
  requirements: Requirement[];
  onLoadRequirements: (tender: TenderInfo, reqs: Requirement[]) => void;
  onNextStep: () => void;
}

export const TenderOverview: React.FC<TenderOverviewProps> = ({
  tender,
  requirements,
  onLoadRequirements,
  onNextStep,
}) => {
  const { language, t } = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleJsonUpload = (file: File) => {
    setErrorMsg(null);
    if (!file.name.toLowerCase().endsWith('.json') && file.type !== 'application/json') {
      setErrorMsg(t('errorInvalidJson'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        const { tender: parsedTender, requirements: parsedReqs } = parseRequirementsJson(parsed);

        if (!parsedReqs || parsedReqs.length === 0) {
          setErrorMsg(t('errorInvalidJson'));
          return;
        }

        onLoadRequirements(parsedTender, parsedReqs);
      } catch (err) {
        console.error('Error parsing JSON:', err);
        setErrorMsg(t('errorInvalidJson'));
      }
    };
    reader.onerror = () => {
      setErrorMsg(t('errorInvalidJson'));
    };
    reader.readAsText(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleJsonUpload(file);
    }
    // reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleJsonUpload(file);
    }
  };

  const handleLoadSample = () => {
    setErrorMsg(null);
    onLoadRequirements(SAMPLE_TENDER, SAMPLE_REQUIREMENTS);
  };

  return (
    <div className="section-container">
      {/* Action Bar */}
      <div className="section-header-actions">
        <div>
          <h2 className="section-title">{t('tenderInfoTitle')}</h2>
          <p className="section-subtitle">
            {tender
              ? t('requirementsLoaded', { count: requirements.length })
              : t('noRequirementsLoaded')}
          </p>
        </div>

        <div className="header-button-group">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json,application/json"
            style={{ display: 'none' }}
          />
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={16} />
            <span>{t('importJson')}</span>
          </button>

          <button
            type="button"
            className="btn btn-primary-outline"
            onClick={handleLoadSample}
          >
            <Sparkles size={16} />
            <span>{t('loadSample')}</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="alert-banner alert-danger">
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Drag & Drop Box when no tender loaded */}
      {!tender && (
        <div
          className={`dropzone-box ${isDragging ? 'dropzone-active' : ''}`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="dropzone-icon">
            <FileCode size={48} />
          </div>
          <h3 className="dropzone-title">{t('importJson')}</h3>
          <p className="dropzone-hint">{t('dropJsonHint')}</p>
          <div className="dropzone-or">OR</div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={(e) => {
              e.stopPropagation();
              handleLoadSample();
            }}
          >
            <Sparkles size={16} />
            <span>{t('loadSample')}</span>
          </button>
        </div>
      )}

      {/* Tender Metadata Card */}
      {tender && (
        <div className="tender-card">
          <div className="tender-card-header">
            <div className="tender-main-info">
              <span className="tender-id-pill">
                <Hash size={14} />
                {tender.tender_id}
              </span>
              <h3 className="tender-title-text">{tender.title}</h3>
            </div>
            <div className="tender-deadline-box">
              <Calendar size={18} />
              <div>
                <span className="deadline-label">{t('submissionDeadline')}</span>
                <span className="deadline-value">{normalizeDate(tender.submission_deadline)}</span>
              </div>
            </div>
          </div>

          <div className="tender-meta-grid">
            <div className="meta-item">
              <div className="meta-icon">
                <Building2 size={16} />
              </div>
              <div>
                <span className="meta-label">{t('procuringEntity')}</span>
                <span className="meta-value">{tender.procuring_entity}</span>
              </div>
            </div>

            <div className="meta-item">
              <div className="meta-icon">
                <User size={16} />
              </div>
              <div>
                <span className="meta-label">{t('bidder')}</span>
                <span className="meta-value">{tender.bidder}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Requirements Table */}
      {requirements.length > 0 && (
        <div className="requirements-table-card">
          <div className="table-card-header">
            <h3 className="table-card-title">
              <FileCheck size={18} />
              <span>{t('stepRequirements')} ({requirements.length})</span>
            </h3>
            <span className="table-badge-note">
              {t('requirementsLoaded', { count: requirements.length })}
            </span>
          </div>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '70px', textAlign: 'center' }}>{t('reqOrder')}</th>
                  <th>{t('reqTitle')}</th>
                  <th style={{ width: '130px', textAlign: 'center' }}>{t('reqMandatory')}</th>
                  <th style={{ width: '180px', textAlign: 'center' }}>{t('reqExpiryNeeded')}</th>
                </tr>
              </thead>
              <tbody>
                {requirements.map((req) => {
                  const title = language === 'bn' ? req.title_bn : req.title_en;
                  const secondaryTitle = language === 'bn' ? req.title_en : req.title_bn;

                  return (
                    <tr key={req.id}>
                      <td style={{ textAlign: 'center' }}>
                        <span className="order-number-badge">#{req.order}</span>
                      </td>
                      <td>
                        <div className="req-title-container">
                          <span className="req-primary-title">{title}</span>
                          {secondaryTitle && (
                            <span className="req-secondary-title">{secondaryTitle}</span>
                          )}
                        </div>
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
                      <td style={{ textAlign: 'center' }}>
                        <span
                          className={`badge ${
                            req.has_expiry ? 'badge-warning' : 'badge-neutral'
                          }`}
                        >
                          {req.has_expiry
                            ? t('expiryNeededBadge')
                            : t('noExpiryNeededBadge')}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="table-card-footer">
            <div className="footer-legend">
              <span className="legend-item">
                <span className="legend-dot dot-mandatory" />
                {t('mandatoryBadge')}: {requirements.filter(r => r.is_mandatory).length}
              </span>
              <span className="legend-item">
                <span className="legend-dot dot-optional" />
                {t('optionalBadge')}: {requirements.filter(r => !r.is_mandatory).length}
              </span>
              <span className="legend-item">
                <span className="legend-dot dot-expiry" />
                {t('expiryNeededBadge')}: {requirements.filter(r => r.has_expiry).length}
              </span>
            </div>

            <button type="button" className="btn btn-primary" onClick={onNextStep}>
              <span>{t('next')}: {t('stepUpload')}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
