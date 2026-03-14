'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LanguagesIcon } from 'lucide-react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  DEFAULT_LANGUAGE,
  SUPPORTED_LANGUAGES,
  type SupportedLanguage,
  toSupportedLanguage,
} from '@/features/i18n/constants/languages';
import {
  getLanguagePreference,
  upsertLanguagePreference,
} from '@/features/preferences/logic/language-preference';
import { useAuthUserId } from '@/features/tasks/hooks/use-auth-user-id';

const LANGUAGE_PREFERENCE_QUERY_KEY = ['preferences', 'language'] as const;

function getLanguageLabel(language: SupportedLanguage, t: (key: string) => string): string {
  if (language === 'es') {
    return t('language.spanish');
  }

  return t('language.english');
}

export function LanguageSelector() {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const { userId, isLoading: isAuthLoading } = useAuthUserId();

  const languageQuery = useQuery({
    queryKey: [...LANGUAGE_PREFERENCE_QUERY_KEY, userId],
    queryFn: async () => {
      if (!userId) {
        return DEFAULT_LANGUAGE;
      }

      return getLanguagePreference(userId);
    },
  });

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!userId) {
      return;
    }

    if (!languageQuery.data) {
      return;
    }

    if (languageQuery.data !== i18n.resolvedLanguage) {
      void i18n.changeLanguage(languageQuery.data);
    }
  }, [i18n, isAuthLoading, languageQuery.data, userId]);

  const updateLanguageMutation = useMutation({
    mutationFn: async (language: SupportedLanguage) => {
      if (!userId) {
        return;
      }

      await upsertLanguagePreference({ userId, language });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [...LANGUAGE_PREFERENCE_QUERY_KEY, userId],
      });
    },
  });

  const selectedLanguage = toSupportedLanguage(i18n.resolvedLanguage);
  const shouldRenderLoadingSkeleton = isAuthLoading || (Boolean(userId) && languageQuery.isLoading);

  const handleLanguageChange = async (nextLanguage: string): Promise<void> => {
    const supportedLanguage = toSupportedLanguage(nextLanguage);

    await i18n.changeLanguage(supportedLanguage);

    if (!userId) {
      return;
    }

    await updateLanguageMutation.mutateAsync(supportedLanguage);
  };

  const selectedLanguageLabel = getLanguageLabel(selectedLanguage, t);

  if (shouldRenderLoadingSkeleton) {
    return <div aria-hidden className="h-7 w-28 animate-pulse rounded-md bg-muted" />;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="outline">
          <LanguagesIcon />
          {selectedLanguageLabel}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{t('language.label')}</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={selectedLanguage}
          onValueChange={nextLanguage => {
            void handleLanguageChange(nextLanguage);
          }}
        >
          {SUPPORTED_LANGUAGES.map(language => (
            <DropdownMenuRadioItem key={language} value={language}>
              {getLanguageLabel(language, t)}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
