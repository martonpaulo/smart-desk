'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';

import { DayEventsOverview } from '@/features/calendar/components/day-events-overview';
import { GoogleAuthControls } from '@/features/integrations/google/components/google-auth-controls';

const SUCCESS_MESSAGES: Record<string, string> = {
  google_connected: 'Google Calendar connected successfully. Initial sync started.',
};

const ERROR_MESSAGES: Record<string, string> = {
  oauth_failed: 'Google authorization was cancelled or failed.',
  invalid_state: 'Invalid OAuth state. Please try connecting again.',
  state_mismatch: 'Security validation failed. Please reconnect Google.',
  token_exchange_failed: 'Could not exchange Google authorization code.',
  profile_fetch_failed: 'Could not fetch your Google profile details.',
  connection_save_failed: 'Connected to Google, but saving your connection failed.',
  no_refresh_token: 'Google did not return a refresh token. Try again with consent.',
  callback_failed: 'Unexpected callback error. Please try again.',
};

export function CalendarOverview() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const successCode = searchParams.get('success');
  const errorCode = searchParams.get('error');
  const successMessage = successCode ? SUCCESS_MESSAGES[successCode] : null;
  const errorMessage = errorCode ? ERROR_MESSAGES[errorCode] : null;

  useEffect(() => {
    if (!successMessage && !errorMessage) {
      return;
    }

    if (successMessage) {
      toast.success(successMessage);
    }

    if (errorMessage) {
      toast.error(errorMessage);
    }

    router.replace(pathname);
  }, [errorMessage, pathname, router, successMessage]);

  return (
    <main className="min-h-screen bg-background px-4 py-8 sm:px-6 sm:py-10">
      <section className="mx-auto flex w-full max-w-4xl flex-col gap-4">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold tracking-tight">Smart Desk</h1>
            <p className="text-muted-foreground">
              Calendar events are read from local SQLite. Remote sync is handled in the background.
            </p>
          </div>
          <div className="self-end sm:self-auto">
            <GoogleAuthControls />
          </div>
        </header>

        <DayEventsOverview />
      </section>
    </main>
  );
}
