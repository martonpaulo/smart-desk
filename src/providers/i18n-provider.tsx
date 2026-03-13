'use client';

import type { ReactNode } from 'react';
import { useEffect } from 'react';

import { i18n } from '@/features/i18n/config/i18n';
import { DEFAULT_LANGUAGE } from '@/features/i18n/constants/languages';

interface I18nProviderProps {
  children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  useEffect(() => {
    const applyLanguageToDocument = (language: string): void => {
      document.documentElement.lang = language || DEFAULT_LANGUAGE;
    };

    applyLanguageToDocument(i18n.resolvedLanguage ?? DEFAULT_LANGUAGE);
    i18n.on('languageChanged', applyLanguageToDocument);

    return () => {
      i18n.off('languageChanged', applyLanguageToDocument);
    };
  }, []);

  return children;
}
