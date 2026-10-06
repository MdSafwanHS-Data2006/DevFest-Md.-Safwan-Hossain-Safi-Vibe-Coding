import React, { useRef, useState } from 'react';
import { useI18n } from '../i18n/I18nContext';
import type { UploadedFile } from '../types';
import { computeFileHash } from '../utils/hash';
import { getPdfPageCount } from '../utils/pdfInspector';
import { createDemoUploadFiles } from '../utils/sampleData';
import {
  UploadCloud,
  FileText,
  Trash2,
  AlertTriangle,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  FileCheck2,
  HardDrive
} from 'lucide-react';

interface FileUploadSectionProps {
  files: UploadedFile[];
  matches: Record<string, string | undefined>;
  onFilesChange: (files: UploadedFile[]) => void;
  onNextStep: () => void;
  onPrevStep: () => void;
}

const MAX_FILES = 30;
const MAX_TOTAL_BYTES = 50 * 1024 * 1024; // 50 MB

export const FileUploadSection: React.FC<FileUploadSectionProps> = ({
  files,
  matches,
  onFilesChange,
  onNextStep,
  onPrevStep,
}) => {
  const { t } = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errorMsgs, setErrorMsgs] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isGeneratingDemo, setIsGeneratingDemo] = useState(false);

  // Group files by SHA-256 hash to detect identical content
  const hashGroups = new Map<string, UploadedFile[]>();
  for (const f of files) {
    const list = hashGroups.get(f.hash) || [];
    list.push(f);
    hashGroups.set(f.hash, list);
  }

  const currentTotalBytes = files.reduce((acc, f) => acc + f.size, 0);

  const processIncomingFiles = async (selectedFiles: FileList | File[]) => {
    const errors: string[] = [];
    setIsProcessing(true);

    const validNewFiles: File[] = [];

    // 1. Check non-PDF files
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const isPdf =
        file.type === 'application/pdf' ||
        file.name.toLowerCase().endsWith('.pdf');

      if (!isPdf) {
        errors.push(t('errorNonPdf', { name: file.name }));
      } else {
        validNewFiles.push(file);
      }
    }

    // 2. Check maximum 30 files constraint
    if (files.length + validNewFiles.length > MAX_FILES) {
      errors.push(
        t('errorMaxFiles', {
          current: files.length,
          attempted: validNewFiles.length,
        })
      );
      setErrorMsgs(errors);
      setIsProcessing(false);
      return;
    }

    // 3. Check 50 MB total limit
    const newBytes = validNewFiles.reduce((acc, f) => acc + f.size, 0);
    if (currentTotalBytes + newBytes > MAX_TOTAL_BYTES) {
      const attemptedTotalMb = ((currentTotalBytes + newBytes) / (1024 * 1024)).toFixed(2);
      errors.push(t('errorMaxSize', { size: attemptedTotalMb }));
      setErrorMsgs(errors);
      setIsProcessing(false);
      return;
    }

    // Process valid PDFs
    const processedList: UploadedFile[] = [];

    for (const file of validNewFiles) {
      try {
        const buffer = await file.arrayBuffer();
        const uint8Data = new Uint8Array(buffer);

        // Verify PDF magic header bytes (%PDF)
        const header = new TextDecoder().decode(uint8Data.slice(0, 5));
        if (!header.startsWith('%PDF')) {
          errors.push(t('errorNonPdf', { name: file.name }));
          continue;
        }

        const hash = await computeFileHash(buffer);
        const pageCount = await getPdfPageCount(uint8Data);

        processedList.push({
          id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          name: file.name,
          size: file.size,
          pageCount,
          hash,
          data: uint8Data,
          uploadedAt: Date.now(),
        });
      } catch (err) {
        console.error('Error processing PDF file:', file.name, err);
        errors.push(t('errorReadPdf', { name: file.name }));
      }
    }

    if (processedList.length > 0) {
      onFilesChange([...files, ...processedList]);
    }

    setErrorMsgs(errors);
    setIsProcessing(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processIncomingFiles(e.target.files);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processIncomingFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveFile = (fileId: string) => {
    onFilesChange(files.filter(f => f.id !== fileId));
  };

  const handleClearAll = () => {
    if (window.confirm(t('confirmClearFiles'))) {
      onFilesChange([]);
      setErrorMsgs([]);
    }
  };

  const handleGenerateDemoPdfs = async () => {
    setIsGeneratingDemo(true);
    setErrorMsgs([]);
    try {
      const demoFiles = await createDemoUploadFiles();
      // Replace or merge with demo files within limits
      const totalCount = files.length + demoFiles.length;
      if (totalCount > MAX_FILES) {
        onFilesChange(demoFiles.slice(0, MAX_FILES));
      } else {
        onFilesChange([...files, ...demoFiles]);
      }
    } catch (err) {
      console.error('Error generating demo PDFs:', err);
    } finally {
      setIsGeneratingDemo(false);
    }
  };

  const currentTotalMb = (currentTotalBytes / (1024 * 1024)).toFixed(2);
  const sizePercentage = Math.min(100, (currentTotalBytes / MAX_TOTAL_BYTES) * 100);
  const countPercentage = Math.min(100, (files.length / MAX_FILES) * 100);

  return (
    <div className="section-container">
      {/* Header and Controls */}
      <div className="section-header-actions">
        <div>
          <h2 className="section-title">{t('uploadTitle')}</h2>
          <p className="section-subtitle">{t('uploadSubtitle')}</p>
        </div>

        <div className="header-button-group">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,application/pdf"
            multiple
            style={{ display: 'none' }}
          />

          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleGenerateDemoPdfs}
            disabled={isGeneratingDemo || files.length >= MAX_FILES}
          >
            <Sparkles size={16} />
            <span>
              {isGeneratingDemo ? t('generatingDemo') : t('generateDemoPdfs')}
            </span>
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing || files.length >= MAX_FILES}
          >
            <UploadCloud size={16} />
            <span>{t('selectPdfBtn')}</span>
          </button>

          {files.length > 0 && (
            <button
              type="button"
              className="btn btn-danger-outline"
              onClick={handleClearAll}
              title={t('clearAllFiles')}
            >
              <Trash2 size={16} />
              <span>{t('clearAllFiles')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Error Messages */}
      {errorMsgs.length > 0 && (
        <div className="alert-banner-stack">
          {errorMsgs.map((msg, i) => (
            <div key={i} className="alert-banner alert-danger">
              <AlertCircle size={18} />
              <span>{msg}</span>
            </div>
          ))}
        </div>
      )}

      {/* Storage and Quota Usage Tracker */}
      <div className="quota-bar-card">
        <div className="quota-stats-row">
          <div className="quota-stat-item">
            <span className="quota-label">{t('uploadStats', { count: files.length, size: currentTotalMb })}</span>
          </div>
          <div className="quota-meters-group">
            <div className="quota-pill">
              <HardDrive size={13} />
              <span>{currentTotalMb} / 50.00 MB</span>
            </div>
            <div className="quota-pill">
              <FileText size={13} />
              <span>{files.length} / 30 Files</span>
            </div>
          </div>
        </div>

        <div className="progress-track">
          <div
            className={`progress-fill ${
              sizePercentage > 90 ? 'progress-danger' : sizePercentage > 75 ? 'progress-warning' : ''
            }`}
            style={{ width: `${Math.max(sizePercentage, countPercentage)}%` }}
          />
        </div>
      </div>

      {/* Drag & Drop Upload Zone */}
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
          <UploadCloud size={46} />
        </div>
        <h3 className="dropzone-title">{t('dropPdfHint')}</h3>
        <p className="dropzone-hint">{t('uploadSubtitle')}</p>
        <button
          type="button"
          className="btn btn-primary-outline"
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
        >
          <UploadCloud size={16} />
          <span>{t('selectPdfBtn')}</span>
        </button>
      </div>

      {/* Uploaded Files Grid / Table */}
      {files.length > 0 && (
        <div className="files-table-card">
          <div className="table-card-header">
            <h3 className="table-card-title">
              <FileCheck2 size={18} />
              <span>Uploaded Documents ({files.length})</span>
            </h3>
            <span className="table-badge-note">
              {t('uploadStats', { count: files.length, size: currentTotalMb })}
            </span>
          </div>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '40px', textAlign: 'center' }}>#</th>
                  <th>{t('fileName')}</th>
                  <th style={{ width: '110px', textAlign: 'center' }}>{t('fileSize')}</th>
                  <th style={{ width: '100px', textAlign: 'center' }}>Pages</th>
                  <th style={{ width: '130px', textAlign: 'center' }}>Content Hash</th>
                  <th style={{ width: '180px' }}>Match Status</th>
                  <th style={{ width: '80px', textAlign: 'center' }}>{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file, idx) => {
                  const duplicates = (hashGroups.get(file.hash) || []).filter(f => f.id !== file.id);
                  const isDuplicate = duplicates.length > 0;
                  const matchedReqId = Object.entries(matches).find(([_, fId]) => fId === file.id)?.[0];
                  const fileSizeKb = (file.size / 1024).toFixed(1);

                  return (
                    <tr key={file.id} className={isDuplicate ? 'row-duplicate-warning' : ''}>
                      <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                        {idx + 1}
                      </td>
                      <td>
                        <div className="file-name-cell">
                          <div className="file-icon-box">
                            <FileText size={16} />
                          </div>
                          <div>
                            <span className="file-name-text">{file.name}</span>
                            {isDuplicate && (
                              <div className="duplicate-alert-tag">
                                <AlertTriangle size={13} />
                                <span>
                                  {t('duplicateWarning', {
                                    name: duplicates.map(d => `"${d.name}"`).join(', '),
                                  })}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
                        {fileSizeKb} KB
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className="pages-badge">
                          {t('pageCount', { count: file.pageCount })}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className="hash-code-pill" title={`SHA-256: ${file.hash}`}>
                          {file.hash.substring(0, 8)}...
                        </span>
                      </td>
                      <td>
                        {matchedReqId ? (
                          <span className="badge badge-success">
                            <CheckCircle size={12} />
                            <span>Matched</span>
                          </span>
                        ) : (
                          <span className="badge badge-neutral">
                            <span>Unmatched</span>
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          className="icon-action-btn btn-danger-ghost"
                          onClick={() => handleRemoveFile(file.id)}
                          title={t('removeFile')}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
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

            <button type="button" className="btn btn-primary" onClick={onNextStep}>
              <span>{t('next')}: {t('stepMatch')}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
