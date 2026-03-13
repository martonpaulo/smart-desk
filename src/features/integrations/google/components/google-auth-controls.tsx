'use client';

import type { Session } from '@supabase/supabase-js';
import { useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  GOOGLE_LIVE_SYNC_INTERVAL_MS,
  GOOGLE_SYNC_ME_ENDPOINT,
} from '@/features/integrations/google/constants';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';

const GOOGLE_PROVIDER = 'google' as const;
const APP_HOME_PATH = '/';
const AUTHORIZATION_HEADER = 'Authorization';
const BEARER_PREFIX = 'Bearer ';
const START_GOOGLE_CONNECT_ENDPOINT = '/api/auth/google';
const GOOGLE_STATUS_ENDPOINT = '/api/auth/google';
const CONNECT_BUTTON_LABEL = 'Connect & Sync Google';
const CONNECTING_BUTTON_LABEL = 'Connecting...';
const CONNECTED_BUTTON_LABEL = 'Google Connected';
const CHECKING_CONNECTION_BUTTON_LABEL = 'Checking Google...';
const SIGN_IN_BUTTON_LABEL = 'Sign in with Google';
const SIGNING_OUT_BUTTON_LABEL = 'Signing out...';
const SIGN_OUT_BUTTON_LABEL = 'Sign out';
const AUTH_ERROR_PREFIX = 'Action failed:';
const AUTH_STATUS_SIGNED_OUT_MESSAGE = 'You are signed out. Sign in to connect Google Calendar.';
const AUTH_STATUS_CHECKING_MESSAGE = 'Checking Google connection status...';
const AUTH_STATUS_CONNECTED_MESSAGE =
  'Google Calendar connected. Updates sync automatically every few seconds.';
const AUTH_STATUS_DISCONNECTED_MESSAGE =
  'Google Calendar is not connected. Connect it to sync events into your local calendar.';
const ALERT_BASE_CLASS_NAME = 'w-full rounded-md border px-3 py-2 text-xs';
const ALERT_INFO_CLASS_NAME = 'border-border bg-muted text-muted-foreground';
const ALERT_SUCCESS_CLASS_NAME = 'border-green-500/40 bg-green-500/10 text-green-300';
const ALERT_WARNING_CLASS_NAME = 'border-amber-500/40 bg-amber-500/10 text-amber-300';
const ALERT_ERROR_CLASS_NAME = 'border-destructive/40 bg-destructive/10 text-destructive';
const SUCCESS_CONNECTED_QUERY_VALUE = 'google_connected';
const CALENDAR_DAY_EVENTS_QUERY_KEY = ['calendar-events-day'];

interface GoogleStartResponse {
  url: string;
}

interface GoogleStatusResponse {
  connected: boolean;
}

export function GoogleAuthControls() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();

  const [session, setSession] = useState<Session | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isStatusLoading, setIsStatusLoading] = useState(false);
  const [isGoogleConnected, setIsGoogleConnected] = useState<boolean | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const successCode = searchParams.get('success');

  useEffect(() => {
    let isMounted = true;

    void supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!isMounted) {
          return;
        }

        setSession(data.session ?? null);
      })
      .finally(() => {
        if (isMounted) {
          setIsAuthLoading(false);
        }
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    if (!session) {
      setIsGoogleConnected(null);
      setIsStatusLoading(false);
      return;
    }

    if (successCode === SUCCESS_CONNECTED_QUERY_VALUE) {
      setIsGoogleConnected(true);
    }

    let isCancelled = false;
    setIsStatusLoading(true);

    void fetch(GOOGLE_STATUS_ENDPOINT, {
      method: 'GET',
      headers: {
        [AUTHORIZATION_HEADER]: `${BEARER_PREFIX}${session.access_token}`,
      },
    })
      .then(async response => {
        if (!response.ok) {
          throw new Error(`status ${response.status}`);
        }

        const data = (await response.json()) as GoogleStatusResponse;
        if (!isCancelled) {
          setIsGoogleConnected(data.connected);
        }
      })
      .catch(error => {
        const message = error instanceof Error ? error.message : 'Unknown error';
        if (!isCancelled) {
          setErrorMessage(`${AUTH_ERROR_PREFIX} ${message}`);
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsStatusLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [session, successCode]);

  useEffect(() => {
    if (!session || !isGoogleConnected) {
      return;
    }

    let isCancelled = false;

    const syncUserCalendar = async (): Promise<void> => {
      if (document.visibilityState === 'hidden') {
        return;
      }

      try {
        const response = await fetch(GOOGLE_SYNC_ME_ENDPOINT, {
          method: 'POST',
          headers: {
            [AUTHORIZATION_HEADER]: `${BEARER_PREFIX}${session.access_token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`status ${response.status}`);
        }

        if (!isCancelled) {
          await queryClient.invalidateQueries({ queryKey: CALENDAR_DAY_EVENTS_QUERY_KEY });
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.warn('Google background sync failed', message);
      }
    };

    void syncUserCalendar();
    const intervalId = window.setInterval(() => {
      void syncUserCalendar();
    }, GOOGLE_LIVE_SYNC_INTERVAL_MS);
    const visibilityHandler = (): void => {
      if (document.visibilityState === 'visible') {
        void syncUserCalendar();
      }
    };
    document.addEventListener('visibilitychange', visibilityHandler);

    return () => {
      isCancelled = true;
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', visibilityHandler);
    };
  }, [isGoogleConnected, queryClient, session]);

  async function handleSignIn(): Promise<void> {
    setErrorMessage(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: GOOGLE_PROVIDER,
      options: {
        redirectTo: `${window.location.origin}${APP_HOME_PATH}`,
      },
    });

    if (error) {
      setErrorMessage(`${AUTH_ERROR_PREFIX} ${error.message}`);
    }
  }

  async function handleConnectGoogle(): Promise<void> {
    if (!session) {
      return;
    }

    setIsConnecting(true);
    setErrorMessage(null);

    try {
      const response = await fetch(START_GOOGLE_CONNECT_ENDPOINT, {
        method: 'POST',
        headers: {
          [AUTHORIZATION_HEADER]: `${BEARER_PREFIX}${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`status ${response.status}`);
      }

      const data = (await response.json()) as GoogleStartResponse;
      window.location.assign(data.url);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setErrorMessage(`${AUTH_ERROR_PREFIX} ${message}`);
    } finally {
      setIsConnecting(false);
    }
  }

  async function handleSignOut(): Promise<void> {
    setIsSigningOut(true);
    setErrorMessage(null);

    const { error } = await supabase.auth.signOut();

    if (error) {
      setErrorMessage(`${AUTH_ERROR_PREFIX} ${error.message}`);
    }

    setIsSigningOut(false);
    setIsGoogleConnected(null);
  }

  if (isAuthLoading) {
    return (
      <Button disabled size="sm" variant="outline">
        Loading...
      </Button>
    );
  }

  if (!session) {
    return (
      <div className="flex w-full flex-col items-end gap-2 sm:w-auto">
        <Button
          size="sm"
          onClick={() => {
            void handleSignIn();
          }}
        >
          {SIGN_IN_BUTTON_LABEL}
        </Button>
        <p className={`${ALERT_BASE_CLASS_NAME} ${ALERT_WARNING_CLASS_NAME}`}>
          {AUTH_STATUS_SIGNED_OUT_MESSAGE}
        </p>
        {errorMessage ? <p className={`${ALERT_BASE_CLASS_NAME} ${ALERT_ERROR_CLASS_NAME}`}>{errorMessage}</p> : null}
      </div>
    );
  }

  const shouldShowConnectButton = isGoogleConnected === false;
  const shouldShowConnectedState = isGoogleConnected === true;
  const shouldShowConnectionLoading = isStatusLoading || isGoogleConnected === null;

  return (
    <div className="flex w-full flex-col items-end gap-2 sm:w-auto">
      <div className="flex w-full flex-wrap items-center justify-end gap-2">
        {shouldShowConnectButton ? (
          <Button
            disabled={isConnecting}
            size="sm"
            onClick={() => {
              void handleConnectGoogle();
            }}
          >
            {isConnecting ? CONNECTING_BUTTON_LABEL : CONNECT_BUTTON_LABEL}
          </Button>
        ) : null}
        {shouldShowConnectionLoading ? (
          <Button disabled size="sm" variant="outline">
            {CHECKING_CONNECTION_BUTTON_LABEL}
          </Button>
        ) : null}
        {shouldShowConnectedState ? (
          <Button disabled size="sm" variant="secondary">
            {CONNECTED_BUTTON_LABEL}
          </Button>
        ) : null}
        <Button
          disabled={isSigningOut}
          size="sm"
          variant="outline"
          onClick={() => {
            void handleSignOut();
          }}
        >
          {isSigningOut ? SIGNING_OUT_BUTTON_LABEL : SIGN_OUT_BUTTON_LABEL}
        </Button>
      </div>
      {shouldShowConnectionLoading ? (
        <p className={`${ALERT_BASE_CLASS_NAME} ${ALERT_INFO_CLASS_NAME}`}>{AUTH_STATUS_CHECKING_MESSAGE}</p>
      ) : null}
      {shouldShowConnectedState ? (
        <p className={`${ALERT_BASE_CLASS_NAME} ${ALERT_SUCCESS_CLASS_NAME}`}>
          {AUTH_STATUS_CONNECTED_MESSAGE}
        </p>
      ) : null}
      {shouldShowConnectButton ? (
        <p className={`${ALERT_BASE_CLASS_NAME} ${ALERT_WARNING_CLASS_NAME}`}>
          {AUTH_STATUS_DISCONNECTED_MESSAGE}
        </p>
      ) : null}
      {errorMessage ? <p className={`${ALERT_BASE_CLASS_NAME} ${ALERT_ERROR_CLASS_NAME}`}>{errorMessage}</p> : null}
    </div>
  );
}
