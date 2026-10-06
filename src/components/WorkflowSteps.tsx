import React from 'react';
import { useI18n } from '../i18n/I18nContext';
import { ClipboardList, Upload, Link2, ShieldCheck, Download } from 'lucide-react';

export type StepKey = 'requirements' | 'upload' | 'match' | 'validation' | 'generate';

interface WorkflowStepsProps {
  currentStep: StepKey;
  onStepChange: (step: StepKey) => void;
  requirementsCount: number;
  filesCount: number;
  matchesCount: number;
  blockingCount: number;
  isReadyToGenerate: boolean;
}

export const WorkflowSteps: React.FC<WorkflowStepsProps> = ({
  currentStep,
  onStepChange,
  requirementsCount,
  filesCount,
  matchesCount,
  blockingCount,
  isReadyToGenerate,
}) => {
  const { t } = useI18n();

  const steps: {
    key: StepKey;
    labelKey: 'stepRequirements' | 'stepUpload' | 'stepMatch' | 'stepValidation' | 'stepGenerate';
    icon: React.ComponentType<{ size: number }>;
    badge?: string | number;
    badgeType?: 'neutral' | 'success' | 'warning' | 'danger';
  }[] = [
    {
      key: 'requirements',
      labelKey: 'stepRequirements',
      icon: ClipboardList,
      badge: requirementsCount > 0 ? requirementsCount : undefined,
      badgeType: 'neutral',
    },
    {
      key: 'upload',
      labelKey: 'stepUpload',
      icon: Upload,
      badge: filesCount > 0 ? filesCount : undefined,
      badgeType: 'neutral',
    },
    {
      key: 'match',
      labelKey: 'stepMatch',
      icon: Link2,
      badge: requirementsCount > 0 ? `${matchesCount}/${requirementsCount}` : undefined,
      badgeType: matchesCount === requirementsCount && requirementsCount > 0 ? 'success' : 'neutral',
    },
    {
      key: 'validation',
      labelKey: 'stepValidation',
      icon: ShieldCheck,
      badge: blockingCount > 0 ? `${blockingCount}` : (isReadyToGenerate ? '✓' : undefined),
      badgeType: blockingCount > 0 ? 'danger' : 'success',
    },
    {
      key: 'generate',
      labelKey: 'stepGenerate',
      icon: Download,
      badge: isReadyToGenerate ? 'Ready' : undefined,
      badgeType: isReadyToGenerate ? 'success' : 'neutral',
    },
  ];

  return (
    <nav className="workflow-nav" aria-label="Workflow Steps">
      <div className="workflow-steps-list">
        {steps.map((step, index) => {
          const isActive = currentStep === step.key;
          const Icon = step.icon;

          return (
            <button
              key={step.key}
              type="button"
              className={`step-btn ${isActive ? 'active' : ''}`}
              onClick={() => onStepChange(step.key)}
            >
              <div className="step-indicator">
                <span className="step-icon-wrapper">
                  <Icon size={18} />
                </span>
                <span className="step-label">{t(step.labelKey)}</span>
                {step.badge !== undefined && (
                  <span className={`step-badge badge-${step.badgeType || 'neutral'}`}>
                    {step.badge}
                  </span>
                )}
              </div>
              {index < steps.length - 1 && <span className="step-connector" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
