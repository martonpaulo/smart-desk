export const DEFAULT_LANGUAGE = 'en' as const;

export const SUPPORTED_LANGUAGES = ['en', 'es'] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const DATE_LOCALE_BY_LANGUAGE: Record<SupportedLanguage, string> = {
  en: 'en-US',
  es: 'es-ES',
};

function isSupportedLanguage(value: string): value is SupportedLanguage {
  return SUPPORTED_LANGUAGES.includes(value as SupportedLanguage);
}

export function toSupportedLanguage(value: string | null | undefined): SupportedLanguage {
  if (!value) {
    return DEFAULT_LANGUAGE;
  }

  return isSupportedLanguage(value) ? value : DEFAULT_LANGUAGE;
}
