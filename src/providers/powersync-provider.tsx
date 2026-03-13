'use client';

import type { Session } from '@supabase/supabase-js';
import { useEffect, useMemo } from 'react';

import { db } from '@/db/powersync';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';

const NEXT_PUBLIC_POWERSYNC_URL = process.env.NEXT_PUBLIC_POWERSYNC_URL;
const NEXT_PUBLIC_POWERSYNC_TOKEN = process.env.NEXT_PUBLIC_POWERSYNC_TOKEN;
const POWERSYNC_LOG_PREFIX = '[powersync]';
const SLOW_CONNECT_LOG_MS = 20_000;
const CONNECT_TIMEOUT_MS = 30_000;
const RECONNECT_INTERVAL_MS = 15_000;

function getConnectTimeoutError(): Error {
  return new Error(`connect timeout after ${CONNECT_TIMEOUT_MS}ms`);
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

      if (!session && !NEXT_PUBLIC_POWERSYNC_TOKEN) {
        console.info(`${POWERSYNC_LOG_PREFIX} skipping connect: no active session`);
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
          });
        }, SLOW_CONNECT_LOG_MS);

        const connectPromise = db.connect({
          fetchCredentials: async () => {
            const { data } = await supabase.auth.getSession();
            const accessToken = data.session?.access_token;
            const token = accessToken ?? NEXT_PUBLIC_POWERSYNC_TOKEN;

            if (!token) {
              console.warn(`${POWERSYNC_LOG_PREFIX} no token available for credentials`);
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

        console.info(`${POWERSYNC_LOG_PREFIX} connected`);
      } catch (error) {
        console.error(`${POWERSYNC_LOG_PREFIX} connect failed`, error);
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
      if (!latestSession && !NEXT_PUBLIC_POWERSYNC_TOKEN) {
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
