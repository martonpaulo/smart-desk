import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from '@/features/i18n/constants/languages';
import { translationResources } from '@/features/i18n/constants/resources';

const DEFAULT_NAMESPACE = 'common';

if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    resources: translationResources,
    lng: DEFAULT_LANGUAGE,
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: [...SUPPORTED_LANGUAGES],
    defaultNS: DEFAULT_NAMESPACE,
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });
}

export { i18n };
