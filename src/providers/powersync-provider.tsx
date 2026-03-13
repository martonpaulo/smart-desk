'use client';

import type { Session } from '@supabase/supabase-js';
import { useEffect, useMemo } from 'react';

import { db } from '@/db/powersync';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';

const NEXT_PUBLIC_POWERSYNC_URL = process.env.NEXT_PUBLIC_POWERSYNC_URL;
const POWERSYNC_LOG_PREFIX = '[powersync]';
const SLOW_CONNECT_LOG_MS = 20_000;

export function PowerSyncProvider(): null {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  useEffect(() => {
    let isActive = true;
    let slowConnectLogTimeoutId: number | null = null;

    const connectIfPossible = async (session: Session | null): Promise<void> => {
      if (!isActive) {
        return;
      }

      if (!NEXT_PUBLIC_POWERSYNC_URL) {
        console.warn(`${POWERSYNC_LOG_PREFIX} NEXT_PUBLIC_POWERSYNC_URL is not set`);
        return;
      }

      if (!session) {
        console.info(`${POWERSYNC_LOG_PREFIX} skipping connect: no active session`);
        if (db.connected || db.connecting) {
          await db.disconnectAndClear();
        }
        return;
      }

      if (db.connected || db.connecting) {
        return;
      }

      try {
        slowConnectLogTimeoutId = window.setTimeout(() => {
          console.warn(`${POWERSYNC_LOG_PREFIX} connect is taking longer than expected`, {
            slowAfterMs: SLOW_CONNECT_LOG_MS,
          });
        }, SLOW_CONNECT_LOG_MS);

        await db.connect({
          fetchCredentials: async () => {
            const { data } = await supabase.auth.getSession();
            const accessToken = data.session?.access_token;

            if (!accessToken) {
              console.warn(`${POWERSYNC_LOG_PREFIX} no access token available for credentials`);
              return null;
            }

            return {
              endpoint: NEXT_PUBLIC_POWERSYNC_URL,
              token: accessToken,
            };
          },
          uploadData: async () => {
            // Read-only sync for now; local uploads are not implemented in this phase.
          },
        });

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
      }
    };

    void supabase.auth
      .getSession()
      .then(({ data }) => connectIfPossible(data.session ?? null))
      .catch(() => {
        // Keep UI usable even if sync bootstrap fails.
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      void connectIfPossible(nextSession).catch(error => {
        console.error(`${POWERSYNC_LOG_PREFIX} auth state connect handler failed`, error);
      });
    });

    return () => {
      isActive = false;
      subscription.unsubscribe();
      if (db.connected || db.connecting) {
        void db.disconnect();
      }
    };
  }, [supabase]);

  return null;
}
