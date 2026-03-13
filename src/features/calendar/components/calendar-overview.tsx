'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { DayItemsOverview } from '@/features/calendar/components/day-items-overview';
import { GoogleAuthControls } from '@/features/integrations/google/components/google-auth-controls';
import { LanguageSelector } from '@/features/preferences/components/language-selector';
import { TasksOverview } from '@/features/tasks/components/tasks-overview';

const SUCCESS_MESSAGE_KEYS: Record<string, string> = {
  google_connected: 'callback.success.google_connected',
};

const ERROR_MESSAGE_KEYS: Record<string, string> = {
  oauth_failed: 'callback.error.oauth_failed',
  invalid_state: 'callback.error.invalid_state',
  state_mismatch: 'callback.error.state_mismatch',
  token_exchange_failed: 'callback.error.token_exchange_failed',
  profile_fetch_failed: 'callback.error.profile_fetch_failed',
  connection_save_failed: 'callback.error.connection_save_failed',
  no_refresh_token: 'callback.error.no_refresh_token',
  callback_failed: 'callback.error.callback_failed',
};

export function CalendarOverview() {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const successCode = searchParams.get('success');
  const errorCode = searchParams.get('error');
  const successMessage = successCode ? SUCCESS_MESSAGE_KEYS[successCode] : null;
  const errorMessage = errorCode ? ERROR_MESSAGE_KEYS[errorCode] : null;

  useEffect(() => {
    if (!successMessage && !errorMessage) {
      return;
    }

    if (successMessage) {
      toast.success(t(successMessage));
    }

    if (errorMessage) {
      toast.error(t(errorMessage));
    }

    router.replace(pathname);
  }, [errorMessage, pathname, router, successMessage, t]);

  return (
    <main className="min-h-screen bg-background px-4 py-8 sm:px-6 sm:py-10">
      <section className="mx-auto flex w-full max-w-4xl flex-col gap-4">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold tracking-tight">{t('app.title')}</h1>
            <p className="text-muted-foreground">{t('app.subtitle')}</p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2 self-end sm:self-auto">
            <LanguageSelector />
            <GoogleAuthControls />
          </div>
        </header>

        <div className="grid gap-4 lg:grid-cols-2">
          <DayItemsOverview />
          <TasksOverview />
        </div>
      </section>
    </main>
  );
}
