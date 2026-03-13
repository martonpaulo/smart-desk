'use client';

import type { Session, SupabaseClient } from '@supabase/supabase-js';
import { useEffect, useMemo } from 'react';

import { db } from '@/db/powersync';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';

const NEXT_PUBLIC_POWERSYNC_URL = process.env.NEXT_PUBLIC_POWERSYNC_URL;
const NEXT_PUBLIC_POWERSYNC_AUTH_MODE = process.env.NEXT_PUBLIC_POWERSYNC_AUTH_MODE;
const NEXT_PUBLIC_POWERSYNC_TOKEN = process.env.NEXT_PUBLIC_POWERSYNC_TOKEN;
const POWERSYNC_LOG_PREFIX = '[powersync]';
const SLOW_CONNECT_LOG_MS = 20_000;
const CONNECT_TIMEOUT_MS = 30_000;
const RECONNECT_INTERVAL_MS = 15_000;
const POWERSYNC_AUTH_MODE_SUPABASE = 'supabase';
const POWERSYNC_AUTH_MODE_DEVELOPMENT_TOKEN = 'development-token';

type PowerSyncAuthMode = 'supabase' | 'development-token';

function resolvePowerSyncAuthMode(): PowerSyncAuthMode {
  if (NEXT_PUBLIC_POWERSYNC_AUTH_MODE === POWERSYNC_AUTH_MODE_DEVELOPMENT_TOKEN) {
    return POWERSYNC_AUTH_MODE_DEVELOPMENT_TOKEN;
  }

  if (NEXT_PUBLIC_POWERSYNC_AUTH_MODE === POWERSYNC_AUTH_MODE_SUPABASE) {
    return POWERSYNC_AUTH_MODE_SUPABASE;
  }

  if (NEXT_PUBLIC_POWERSYNC_TOKEN) {
    return POWERSYNC_AUTH_MODE_DEVELOPMENT_TOKEN;
  }

  return POWERSYNC_AUTH_MODE_SUPABASE;
}

const POWERSYNC_AUTH_MODE = resolvePowerSyncAuthMode();

function getConnectTimeoutError(): Error {
  return new Error(`connect timeout after ${CONNECT_TIMEOUT_MS}ms`);
}

function shouldSkipConnect(session: Session | null): boolean {
  if (POWERSYNC_AUTH_MODE === POWERSYNC_AUTH_MODE_DEVELOPMENT_TOKEN) {
    return !NEXT_PUBLIC_POWERSYNC_TOKEN;
  }

  return !session;
}

async function getPowerSyncToken(
  supabase: SupabaseClient,
  session: Session | null,
): Promise<string | null> {
  if (POWERSYNC_AUTH_MODE === POWERSYNC_AUTH_MODE_DEVELOPMENT_TOKEN) {
    return NEXT_PUBLIC_POWERSYNC_TOKEN ?? null;
  }

  if (session?.access_token) {
    return session.access_token;
  }

  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

export function PowerSyncProvider(): null {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  useEffect(() => {
    let isActive = true;
    let isConnectInFlight = false;
    let latestSession: Session | null = null;
    let slowConnectLogTimeoutId: number | null = null;
    let connectTimeoutId: number | null = null;

    const connectIfPossible = async (session: Session | null): Promise<void> => {
      if (!isActive) {
        return;
      }

      latestSession = session;

      if (!NEXT_PUBLIC_POWERSYNC_URL) {
        console.warn(`${POWERSYNC_LOG_PREFIX} NEXT_PUBLIC_POWERSYNC_URL is not set`);
        return;
      }

      if (shouldSkipConnect(session)) {
        if (POWERSYNC_AUTH_MODE === POWERSYNC_AUTH_MODE_DEVELOPMENT_TOKEN) {
          console.warn(
            `${POWERSYNC_LOG_PREFIX} skipping connect: NEXT_PUBLIC_POWERSYNC_TOKEN is required in development-token mode`,
          );
        }
        if (db.connected || db.connecting) {
          await db.disconnectAndClear();
        }
        return;
      }

      if (db.connected || db.connecting || isConnectInFlight) {
        return;
      }

      try {
        isConnectInFlight = true;
        slowConnectLogTimeoutId = window.setTimeout(() => {
          console.warn(`${POWERSYNC_LOG_PREFIX} connect is taking longer than expected`, {
            slowAfterMs: SLOW_CONNECT_LOG_MS,
            authMode: POWERSYNC_AUTH_MODE,
          });
        }, SLOW_CONNECT_LOG_MS);

        const connectPromise = db.connect({
          fetchCredentials: async () => {
            const token = await getPowerSyncToken(supabase, latestSession);

            if (!token) {
              console.warn(`${POWERSYNC_LOG_PREFIX} no token available for credentials`, {
                authMode: POWERSYNC_AUTH_MODE,
              });
              return null;
            }

            return {
              endpoint: NEXT_PUBLIC_POWERSYNC_URL,
              token,
            };
          },
          uploadData: async () => {
            // Read-only sync for now local uploads are not implemented in this phase
          },
        });

        const timeoutPromise = new Promise<never>((_, reject) => {
          connectTimeoutId = window.setTimeout(() => {
            reject(getConnectTimeoutError());
          }, CONNECT_TIMEOUT_MS);
        });

        await Promise.race([connectPromise, timeoutPromise]);
      } catch (error) {
        console.error(
          `${POWERSYNC_LOG_PREFIX} connect failed. Verify that PowerSync auth mode matches the token source.`,
          {
            authMode: POWERSYNC_AUTH_MODE,
            error,
          },
        );
        if (db.connected || db.connecting) {
          try {
            await db.disconnect();
          } catch (disconnectError) {
            console.error(
              `${POWERSYNC_LOG_PREFIX} disconnect after failed connect failed`,
              disconnectError,
            );
          }
        }
      } finally {
        if (slowConnectLogTimeoutId !== null) {
          window.clearTimeout(slowConnectLogTimeoutId);
          slowConnectLogTimeoutId = null;
        }
        if (connectTimeoutId !== null) {
          window.clearTimeout(connectTimeoutId);
          connectTimeoutId = null;
        }
        isConnectInFlight = false;
      }
    };

    void supabase.auth
      .getSession()
      .then(({ data }) => {
        latestSession = data.session ?? null;
        return connectIfPossible(latestSession);
      })
      .catch(() => {
        // Keep UI usable even if sync bootstrap fails
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      latestSession = nextSession;
      void connectIfPossible(nextSession).catch(error => {
        console.error(`${POWERSYNC_LOG_PREFIX} auth state connect handler failed`, error);
      });
    });

    const reconnectIntervalId = window.setInterval(() => {
      if (shouldSkipConnect(latestSession)) {
        return;
      }

      void connectIfPossible(latestSession).catch(error => {
        console.error(`${POWERSYNC_LOG_PREFIX} periodic reconnect failed`, error);
      });
    }, RECONNECT_INTERVAL_MS);

    return () => {
      isActive = false;
      window.clearInterval(reconnectIntervalId);
      subscription.unsubscribe();
      if (db.connected || db.connecting) {
        void db.disconnect();
      }
    };
  }, [supabase]);

  return null;
}
