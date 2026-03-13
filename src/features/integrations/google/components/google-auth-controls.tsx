'use client';

import type { Session } from '@supabase/supabase-js';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
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
const SUCCESS_CONNECTED_QUERY_VALUE = 'google_connected';

interface GoogleStartResponse {
  url: string;
}

interface GoogleStatusResponse {
  connected: boolean;
}

export function GoogleAuthControls() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
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
      <div className="flex flex-col items-end gap-2">
        <Button
          size="sm"
          onClick={() => {
            void handleSignIn();
          }}
        >
          {SIGN_IN_BUTTON_LABEL}
        </Button>
        {errorMessage ? <p className="text-xs text-destructive">{errorMessage}</p> : null}
      </div>
    );
  }

  const shouldShowConnectButton = isGoogleConnected === false;
  const shouldShowConnectedState = isGoogleConnected === true;
  const shouldShowConnectionLoading = isStatusLoading || isGoogleConnected === null;

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-2">
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
      {shouldShowConnectedState ? (
        <p className="text-xs text-muted-foreground">Google Calendar already connected.</p>
      ) : null}
      {errorMessage ? <p className="text-xs text-destructive">{errorMessage}</p> : null}
    </div>
  );
}
