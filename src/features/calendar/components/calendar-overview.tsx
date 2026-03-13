'use client';

import { useSearchParams } from 'next/navigation';

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
  const searchParams = useSearchParams();

  const successCode = searchParams.get('success');
  const errorCode = searchParams.get('error');
  const successMessage = successCode ? SUCCESS_MESSAGES[successCode] : null;
  const errorMessage = errorCode ? ERROR_MESSAGES[errorCode] : null;

  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <section className="mx-auto flex w-full max-w-4xl flex-col gap-4">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold tracking-tight">Smart Desk</h1>
            <p className="text-muted-foreground">
              Calendar events are read from local SQLite. Remote sync is handled in the background.
            </p>
          </div>
          <GoogleAuthControls />
        </header>

        {successMessage ? (
          <div className="rounded-md border border-green-500/40 bg-green-500/10 px-3 py-2 text-sm text-green-300">
            {successMessage}
          </div>
        ) : null}

        {errorMessage ? (
          <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {errorMessage}
          </div>
        ) : null}

        <DayEventsOverview />
      </section>
    </main>
  );
}
