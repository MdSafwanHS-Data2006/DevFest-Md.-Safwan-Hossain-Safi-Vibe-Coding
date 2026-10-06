import React from 'react';
import { useI18n } from '../i18n/I18nContext';
import type { TenderInfo } from '../types';
import { FileText, Globe, RotateCcw, Award } from 'lucide-react';

interface HeaderProps {
  tender: TenderInfo | null;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({ tender, onReset }) => {
  const { language, toggleLanguage, t } = useI18n();

  return (
    <header className="app-header">
      <div className="header-container">
        <div className="brand-group">
          <div className="brand-icon">
            <FileText size={26} strokeWidth={2.2} />
          </div>
          <div className="brand-titles">
            <div className="brand-heading-row">
              <h1 className="brand-title">{t('appTitle')}</h1>
              <span className="contest-tag">
                <Award size={13} />
                {t('contestBadge')}
              </span>
            </div>
            <p className="brand-subtitle">{t('appSubtitle')}</p>
          </div>
        </div>

        <div className="header-actions">
          {tender && (
            <div className="tender-badge">
              <span className="tender-badge-label">{t('tenderId')}:</span>
              <span className="tender-badge-id">{tender.tender_id}</span>
            </div>
          )}

          <button
            type="button"
            className="lang-toggle-btn"
            onClick={toggleLanguage}
            title={language === 'en' ? 'Switch to Bangla' : 'ইংরেজিতে পরিবর্তন করুন'}
          >
            <Globe size={16} />
            <span className="lang-text">
              {language === 'en' ? 'বাংলা' : 'English'}
            </span>
          </button>

          <button
            type="button"
            className="reset-btn"
            onClick={onReset}
            title={t('newPackage')}
          >
            <RotateCcw size={15} />
            <span className="reset-label">{t('newPackage')}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
