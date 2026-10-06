import React, { useState, useMemo, useEffect } from 'react';
import { I18nProvider, useI18n } from './i18n/I18nContext';
import type { TenderInfo, Requirement, UploadedFile, BlockingIssue } from './types';
import { SAMPLE_TENDER, SAMPLE_REQUIREMENTS } from './utils/sampleData';
import { getBlockingIssues } from './utils/statusEngine';
import { Header } from './components/Header';
import { WorkflowSteps } from './components/WorkflowSteps';
import type { StepKey } from './components/WorkflowSteps';
import { TenderOverview } from './components/TenderOverview';
import { FileUploadSection } from './components/FileUploadSection';
import { MatchingSection } from './components/MatchingSection';
import { StatusOverview } from './components/StatusOverview';
import { GenerateSection } from './components/GenerateSection';
import { CheckCircle2, AlertCircle } from 'lucide-react';

const AppContent: React.FC = () => {
  const { t } = useI18n();

  // Primary State
  const [tender, setTender] = useState<TenderInfo | null>(SAMPLE_TENDER);
  const [requirements, setRequirements] = useState<Requirement[]>(SAMPLE_REQUIREMENTS);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [matches, setMatches] = useState<Record<string, string | undefined>>({});
  const [expiryDates, setExpiryDates] = useState<Record<string, string | undefined>>({});
  const [currentStep, setCurrentStep] = useState<StepKey>('requirements');
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'info' | 'warning' } | null>(null);

  // Set default sample expiry dates for demonstration convenience
  useEffect(() => {
    // If sample tender is loaded and we have sample requirements, prepopulate realistic valid expiries
    if (tender?.tender_id === SAMPLE_TENDER.tender_id) {
      setExpiryDates(prev => ({
        ...prev,
        'req-01': '2027-06-30', // Trade License (Valid)
        'req-04': '2026-12-31', // MAF (Valid)
        'req-05': '2026-11-20', // Bank Solvency (Same-day as deadline, valid)
        'req-06': '2027-01-15', // ISO (Valid)
      }));
    }
  }, [tender]);

  const showToast = (text: string, type: 'success' | 'info' | 'warning' = 'info') => {
    setToastMsg({ text, type });
    setTimeout(() => {
      setToastMsg(null);
    }, 4000);
  };

  // Compute blocking issues whenever requirements, files, matches, or expiry dates change
  const blockingIssues: BlockingIssue[] = useMemo(() => {
    if (!tender || requirements.length === 0) return [];
    return getBlockingIssues(
      requirements,
      files,
      matches,
      expiryDates,
      tender.submission_deadline
    );
  }, [tender, requirements, files, matches, expiryDates]);

  // Count matches
  const matchesCount = useMemo(() => {
    return Object.values(matches).filter(Boolean).length;
  }, [matches]);

  const isReadyToGenerate = Boolean(
    tender &&
    requirements.length > 0 &&
    matchesCount > 0 &&
    blockingIssues.length === 0
  );

  // Load new requirements from JSON import or sample
  const handleLoadRequirements = (newTender: TenderInfo, newReqs: Requirement[]) => {
    setTender(newTender);
    setRequirements(newReqs);
    // Reset matches and expiries for fresh set
    setMatches({});
    setExpiryDates({});
    showToast(t('requirementsLoaded', { count: newReqs.length }), 'success');
  };

  // Manage files change
  const handleFilesChange = (newFiles: UploadedFile[]) => {
    setFiles(newFiles);
    // Clean up matches for removed files
    const validFileIds = new Set(newFiles.map(f => f.id));
    setMatches(prev => {
      const updated = { ...prev };
      for (const [rId, fId] of Object.entries(updated)) {
        if (fId && !validFileIds.has(fId)) {
          delete updated[rId];
        }
      }
      return updated;
    });
  };

  // Manage individual requirement match
  const handleMatchChange = (reqId: string, fileId: string | undefined) => {
    setMatches(prev => {
      const updated = { ...prev };
      if (!fileId) {
        delete updated[reqId];
      } else {
        // Enforce: one file can be matched to at most one requirement
        for (const [otherReqId, otherFileId] of Object.entries(updated)) {
          if (otherFileId === fileId && otherReqId !== reqId) {
            delete updated[otherReqId];
          }
        }
        updated[reqId] = fileId;
      }
      return updated;
    });
  };

  // Manage expiry date change
  const handleExpiryChange = (reqId: string, date: string) => {
    setExpiryDates(prev => ({
      ...prev,
      [reqId]: date,
    }));
  };

  // Heuristic Smart Auto-Match
  const handleAutoMatch = () => {
    if (files.length === 0 || requirements.length === 0) return;

    const newMatches = { ...matches };
    const usedFileIds = new Set<string>();
    const usedHashes = new Set<string>();

    let matchedCount = 0;

    // Helper keyword normalizer
    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

    for (const req of requirements) {
      if (newMatches[req.id]) {
        const existingFile = files.find(f => f.id === newMatches[req.id]);
        if (existingFile) {
          usedFileIds.add(existingFile.id);
          usedHashes.add(existingFile.hash);
          continue;
        }
      }

      const orderPrefix = String(req.order).padStart(2, '0');

      // Find best file match
      const candidate = files.find(file => {
        if (usedFileIds.has(file.id) || usedHashes.has(file.hash)) return false;

        const fileNameClean = normalize(file.name);

        // Check order prefix (e.g., "01_" matches order 1)
        if (file.name.startsWith(orderPrefix) || fileNameClean.startsWith(orderPrefix)) {
          return true;
        }

        // Check key words
        const words = req.title_en.toLowerCase().split(/\s+/).filter(w => w.length > 3);
        const matchWord = words.some(w => fileNameClean.includes(w));
        return matchWord;
      });

      if (candidate) {
        newMatches[req.id] = candidate.id;
        usedFileIds.add(candidate.id);
        usedHashes.add(candidate.hash);
        matchedCount++;
      }
    }

    setMatches(newMatches);
    showToast(t('autoMatchNotice', { count: matchedCount }), 'success');
  };

  // Reset entire application
  const handleReset = () => {
    if (window.confirm(t('confirmReset'))) {
      setTender(null);
      setRequirements([]);
      setFiles([]);
      setMatches({});
      setExpiryDates({});
      setCurrentStep('requirements');
    }
  };

  return (
    <div className="app-shell">
      <Header tender={tender} onReset={handleReset} />

      <main className="main-content">
        <WorkflowSteps
          currentStep={currentStep}
          onStepChange={setCurrentStep}
          requirementsCount={requirements.length}
          filesCount={files.length}
          matchesCount={matchesCount}
          blockingCount={blockingIssues.length}
          isReadyToGenerate={isReadyToGenerate}
        />

        {toastMsg && (
          <div className={`app-toast toast-${toastMsg.type}`}>
            {toastMsg.type === 'success' ? (
              <CheckCircle2 size={16} />
            ) : (
              <AlertCircle size={16} />
            )}
            <span>{toastMsg.text}</span>
          </div>
        )}

        {/* Step Views */}
        {currentStep === 'requirements' && (
          <TenderOverview
            tender={tender}
            requirements={requirements}
            onLoadRequirements={handleLoadRequirements}
            onNextStep={() => setCurrentStep('upload')}
          />
        )}

        {currentStep === 'upload' && (
          <FileUploadSection
            files={files}
            matches={matches}
            onFilesChange={handleFilesChange}
            onNextStep={() => setCurrentStep('match')}
            onPrevStep={() => setCurrentStep('requirements')}
          />
        )}

        {currentStep === 'match' && tender && (
          <MatchingSection
            tender={tender}
            requirements={requirements}
            files={files}
            matches={matches}
            expiryDates={expiryDates}
            onMatchChange={handleMatchChange}
            onExpiryChange={handleExpiryChange}
            onAutoMatch={handleAutoMatch}
            onNextStep={() => setCurrentStep('validation')}
            onPrevStep={() => setCurrentStep('upload')}
          />
        )}

        {currentStep === 'validation' && tender && (
          <StatusOverview
            tender={tender}
            requirements={requirements}
            files={files}
            matches={matches}
            expiryDates={expiryDates}
            blockingIssues={blockingIssues}
            isReadyToGenerate={isReadyToGenerate}
            onNextStep={() => setCurrentStep('generate')}
            onPrevStep={() => setCurrentStep('match')}
            onJumpToMatch={() => setCurrentStep('match')}
          />
        )}

        {currentStep === 'generate' && tender && (
          <GenerateSection
            tender={tender}
            requirements={requirements}
            files={files}
            matches={matches}
            expiryDates={expiryDates}
            blockingIssues={blockingIssues}
            isReadyToGenerate={isReadyToGenerate}
            onPrevStep={() => setCurrentStep('validation')}
            onGoToMatch={() => setCurrentStep('match')}
          />
        )}
      </main>

      <footer className="app-footer">
        <div className="footer-container">
          <p className="footer-copyright">
            © 2026 Tender Document Package Builder • AI DevFest 2026 Vibe Coding Edition
          </p>
          <p className="footer-tech-stack">
            Frontend Only • Browser Local Processing • pdf-lib & pdf.js • Zero Backend
          </p>
        </div>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <I18nProvider>
      <AppContent />
    </I18nProvider>
  );
};

export default App;
