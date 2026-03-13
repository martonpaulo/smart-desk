'use client';

import type { Session } from '@supabase/supabase-js';
import { useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

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
const SUCCESS_CONNECTED_QUERY_VALUE = 'google_connected';
const CALENDAR_DAY_ITEMS_QUERY_KEY = ['calendar-items-day'];

interface GoogleStartResponse {
  url: string;
}

interface GoogleStatusResponse {
  connected: boolean;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Unknown error';
}

export function GoogleAuthControls() {
  const { t } = useTranslation();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();

  const [session, setSession] = useState<Session | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isStatusLoading, setIsStatusLoading] = useState(false);
  const [isGoogleConnected, setIsGoogleConnected] = useState<boolean | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const previousSessionRef = useRef<Session | null>(null);
  const hasHydratedConnectionStatusRef = useRef(false);
  const previousGoogleConnectedRef = useRef<boolean | null>(null);

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
        if (!isCancelled) {
          toast.error(t('auth.actionFailed', { message: getErrorMessage(error) }));
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
  }, [session, successCode, t]);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    const hadSessionBefore = previousSessionRef.current !== null;

    if (!session) {
      if (hadSessionBefore) {
        toast.info(t('auth.signedOut'));
      }

      hasHydratedConnectionStatusRef.current = false;
      previousGoogleConnectedRef.current = null;
      previousSessionRef.current = null;
      return;
    }

    previousSessionRef.current = session;

    if (isStatusLoading || isGoogleConnected === null) {
      return;
    }

    if (!hasHydratedConnectionStatusRef.current) {
      hasHydratedConnectionStatusRef.current = true;
      previousGoogleConnectedRef.current = isGoogleConnected;
      return;
    }

    if (previousGoogleConnectedRef.current !== isGoogleConnected) {
      if (isGoogleConnected) {
        toast.success(t('auth.connected'));
      } else {
        toast.info(t('auth.disconnected'));
      }
    }

    previousGoogleConnectedRef.current = isGoogleConnected;
  }, [isAuthLoading, isGoogleConnected, isStatusLoading, session, t]);

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
          await queryClient.invalidateQueries({ queryKey: CALENDAR_DAY_ITEMS_QUERY_KEY });
        }
      } catch {
        // Ignore transient background sync errors to avoid user-facing spam.
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
    const { error } = await supabase.auth.signInWithOAuth({
      provider: GOOGLE_PROVIDER,
      options: {
        redirectTo: `${window.location.origin}${APP_HOME_PATH}`,
      },
    });

    if (error) {
      toast.error(t('auth.actionFailed', { message: error.message }));
    }
  }

  async function handleConnectGoogle(): Promise<void> {
    if (!session) {
      return;
    }

    setIsConnecting(true);

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
      toast.error(t('auth.actionFailed', { message: getErrorMessage(error) }));
    } finally {
      setIsConnecting(false);
    }
  }

  async function handleSignOut(): Promise<void> {
    setIsSigningOut(true);

    const { error } = await supabase.auth.signOut();

    if (error) {
      toast.error(t('auth.actionFailed', { message: error.message }));
    }

    setIsSigningOut(false);
    setIsGoogleConnected(null);
  }

  if (isAuthLoading) {
    return (
      <Button disabled size="sm" variant="outline">
        {t('google.loading')}
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
          {t('google.signIn')}
        </Button>
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
            {isConnecting ? t('google.connecting') : t('google.connect')}
          </Button>
        ) : null}
        {shouldShowConnectionLoading ? (
          <Button disabled size="sm" variant="outline">
            {t('google.checking')}
          </Button>
        ) : null}
        {shouldShowConnectedState ? (
          <Button disabled size="sm" variant="secondary">
            {t('google.connected')}
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
          {isSigningOut ? t('google.signingOut') : t('google.signOut')}
        </Button>
      </div>
    </div>
  );
}
