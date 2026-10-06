import React, { useState } from 'react';
import { useI18n } from '../i18n/I18nContext';
import type { Requirement, UploadedFile, TenderInfo, BlockingIssue } from '../types';
import { generateTenderPackagePdf, triggerFileDownload } from '../utils/pdfGenerator';
import { normalizeDate } from '../utils/statusEngine';
import {
  Download,
  AlertOctagon,
  ShieldAlert,
  ShieldCheck,
  CheckCircle,
  FileText,
  ListOrdered,
  Layers,
  ArrowLeft,
  Loader2,
  FileDown
} from 'lucide-react';

interface GenerateSectionProps {
  tender: TenderInfo;
  requirements: Requirement[];
  files: UploadedFile[];
  matches: Record<string, string | undefined>;
  expiryDates: Record<string, string | undefined>;
  blockingIssues: BlockingIssue[];
  isReadyToGenerate: boolean;
  onPrevStep: () => void;
  onGoToMatch: () => void;
}

export const GenerateSection: React.FC<GenerateSectionProps> = ({
  tender,
  requirements,
  files,
  matches,
  expiryDates,
  blockingIssues,
  onPrevStep,
  onGoToMatch,
}) => {
  const { language, t } = useI18n();
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [lastGenerated, setLastGenerated] = useState<{
    bytes: Uint8Array;
    filename: string;
    totalPages: number;
  } | null>(null);

  // Filter and sort included documents by numeric order
  const sortedReqs = [...requirements].sort((a, b) => a.order - b.order);
  const includedDocs: {
    req: Requirement;
    file: UploadedFile;
    pageCount: number;
    expiryDate?: string;
  }[] = [];

  const omittedReqs: Requirement[] = [];

  for (const req of sortedReqs) {
    const fileId = matches[req.id];
    if (fileId) {
      const file = files.find(f => f.id === fileId);
      if (file) {
        includedDocs.push({
          req,
          file,
          pageCount: file.pageCount,
          expiryDate: expiryDates[req.id],
        });
        continue;
      }
    }
    if (!req.is_mandatory) {
      omittedReqs.push(req);
    }
  }

  // Calculate total pages (1 cover page + sum of doc pages)
  const totalDocPages = includedDocs.reduce((acc, d) => acc + d.pageCount, 0);
  const totalPackagePages = 1 + totalDocPages;

  const isBlocked = blockingIssues.length > 0 || includedDocs.length === 0;

  const handleGenerate = async () => {
    if (isBlocked) return;

    setIsGenerating(true);
    setProgressMsg('Initializing PDF package builder...');

    try {
      const result = await generateTenderPackagePdf(
        tender,
        requirements,
        files,
        matches,
        expiryDates,
        (status) => setProgressMsg(status)
      );

      setLastGenerated({
        bytes: result.pdfBytes,
        filename: result.filename,
        totalPages: totalPackagePages,
      });

      // Automatically trigger browser download
      triggerFileDownload(result.pdfBytes, result.filename);
    } catch (err) {
      console.error('Error generating PDF package:', err);
      alert('Failed to generate PDF package: ' + (err as Error).message);
    } finally {
      setIsGenerating(false);
      setProgressMsg('');
    }
  };

  const handleDownloadAgain = () => {
    if (lastGenerated) {
      triggerFileDownload(lastGenerated.bytes, lastGenerated.filename);
    }
  };

  return (
    <div className="section-container">
      {/* Header */}
      <div className="section-header-actions">
        <div>
          <h2 className="section-title">{t('generateTitle')}</h2>
          <p className="section-subtitle">{t('generateSubtitle')}</p>
        </div>
      </div>

      {/* Blocking Alert or Ready Action Banner */}
      {isBlocked ? (
        <div className="blocking-alert-box">
          <div className="blocking-alert-header">
            <AlertOctagon size={24} />
            <div>
              <h3 className="blocking-alert-title">{t('generationBlocked')}</h3>
              <p className="blocking-alert-desc">
                {includedDocs.length === 0
                  ? t('zeroMatchesError')
                  : t('blockedExplanation')}
              </p>
            </div>
          </div>

          <div className="blocking-issues-list">
            {blockingIssues.map((issue) => {
              const msg = language === 'bn' ? issue.messageBn : issue.messageEn;
              return (
                <div key={issue.id} className="blocking-issue-item">
                  <ShieldAlert size={16} />
                  <div className="blocking-issue-text">
                    <span className="issue-order-tag">Req #{issue.reqOrder}</span>
                    <span>{msg}</span>
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary-sm"
                    onClick={onGoToMatch}
                  >
                    Fix in Matching
                  </button>
                </div>
              );
            })}
          </div>

          <div className="blocked-action-footer">
            <button
              type="button"
              className="btn btn-primary"
              onClick={onGoToMatch}
            >
              Resolve Blocking Issues in Matching
            </button>
          </div>
        </div>
      ) : (
        <div className="ready-action-card">
          <div className="ready-action-info">
            <ShieldCheck size={32} className="text-emerald" />
            <div>
              <h3 className="ready-action-title">{t('readyToGenerate')}</h3>
              <p className="ready-action-desc">
                {includedDocs.length} document(s) verified and queued. Final dossier will consist of{' '}
                <strong>{totalPackagePages} pages</strong> with an English cover and continuous page numbering.
              </p>
            </div>
          </div>

          <div className="ready-buttons-group">
            <button
              type="button"
              className="btn btn-emerald-lg"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 size={18} className="spinner-icon" />
                  <span>{progressMsg || t('generatingBtn')}</span>
                </>
              ) : (
                <>
                  <Download size={20} />
                  <span>{t('generateBtn')}</span>
                </>
              )}
            </button>

            {lastGenerated && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleDownloadAgain}
              >
                <FileDown size={16} />
                <span>{t('downloadReadyBtn', { filename: lastGenerated.filename })}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Package Content Preview Cards */}
      <div className="package-preview-grid">
        {/* Left: Included documents sequence */}
        <div className="preview-card flex-2">
          <div className="table-card-header">
            <h3 className="table-card-title">
              <ListOrdered size={18} />
              <span>Compiled Document Sequence ({includedDocs.length} files)</span>
            </h3>
            <span className="table-badge-note">
              Total Pages: {totalPackagePages} (Cover + {totalDocPages} source pages)
            </span>
          </div>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '45px', textAlign: 'center' }}>#</th>
                  <th>Requirement</th>
                  <th>Source Document File</th>
                  <th style={{ width: '110px', textAlign: 'center' }}>Package Pages</th>
                  <th style={{ width: '110px', textAlign: 'center' }}>Expiry Date</th>
                </tr>
              </thead>
              <tbody>
                {/* Cover page entry */}
                <tr className="cover-preview-row">
                  <td style={{ textAlign: 'center' }}>
                    <span className="order-number-badge">★</span>
                  </td>
                  <td>
                    <strong>Cover Page (English Submission Dossier)</strong>
                  </td>
                  <td>
                    <span className="text-muted italic">System Generated</span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className="page-range-pill">Page 1</span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className="text-muted">N/A</span>
                  </td>
                </tr>

                {/* Included documents */}
                {(() => {
                  let runningPage = 2;
                  return includedDocs.map((item) => {
                    const title = language === 'bn' ? item.req.title_bn : item.req.title_en;
                    const startP = runningPage;
                    const endP = runningPage + item.pageCount - 1;
                    runningPage += item.pageCount;

                    return (
                      <tr key={item.req.id}>
                        <td style={{ textAlign: 'center' }}>
                          <span className="order-number-badge">#{item.req.order}</span>
                        </td>
                        <td>
                          <span className="font-medium">{title}</span>
                        </td>
                        <td>
                          <div className="file-name-cell">
                            <FileText size={14} />
                            <span>{item.file.name}</span>
                          </div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span className="page-range-pill">
                            pp. {startP}–{endP} ({item.pageCount}p)
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {item.expiryDate ? (
                            <span className="font-mono text-sm">{normalizeDate(item.expiryDate)}</span>
                          ) : (
                            <span className="text-muted">N/A</span>
                          )}
                        </td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
          </div>

          {omittedReqs.length > 0 && (
            <div className="omitted-docs-notice">
              <span className="text-muted">
                <strong>Omitted Optional Requirements ({omittedReqs.length}):</strong>{' '}
                {omittedReqs.map(r => `#${r.order} (${language === 'bn' ? r.title_bn : r.title_en})`).join(', ')}
              </span>
            </div>
          )}
        </div>

        {/* Right: Rules & Compliance Manifest */}
        <div className="preview-card flex-1">
          <div className="table-card-header">
            <h3 className="table-card-title">
              <Layers size={18} />
              <span>{t('packageRulesTitle')}</span>
            </h3>
          </div>

          <div className="rules-list-container">
            <div className="rule-item">
              <CheckCircle size={16} className="text-emerald" />
              <span>{t('ruleCover')}</span>
            </div>
            <div className="rule-item">
              <CheckCircle size={16} className="text-emerald" />
              <span>{t('ruleOrder')}</span>
            </div>
            <div className="rule-item">
              <CheckCircle size={16} className="text-emerald" />
              <span>{t('rulePagination')}</span>
            </div>
            <div className="rule-item">
              <CheckCircle size={16} className="text-emerald" />
              <span>{t('ruleFooterMargin')}</span>
            </div>
            <div className="rule-item">
              <CheckCircle size={16} className="text-emerald" />
              <span>{t('ruleOptional')}</span>
            </div>
            <div className="rule-item">
              <CheckCircle size={16} className="text-emerald" />
              <span>{t('ruleFilename')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="section-footer-nav">
        <button type="button" className="btn btn-secondary" onClick={onPrevStep}>
          <ArrowLeft size={16} />
          <span>{t('back')}</span>
        </button>
      </div>
    </div>
  );
};
