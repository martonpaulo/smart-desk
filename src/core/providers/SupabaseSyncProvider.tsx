'use client';

import { createContext, ReactNode, useCallback, useEffect } from 'react';

import { usePathname } from 'next/navigation';

import { SyncConfig } from '@/core/constants/SyncInterval';
import { useConnectionStore } from '@/core/store/useConnectionStore';
import { isOnline, schedulePeriodicSync, syncOnVisibilityChange } from '@/core/utils/syncHelpers';
import { getStoresToSyncForRouteAsync } from '@/core/utils/syncRegistry';

interface Props {
  children: ReactNode;
}

interface SyncContextValue {
  syncNowForActiveFeatures: () => Promise<void>;
}

export const SupabaseSyncContext = createContext<SyncContextValue>({
  syncNowForActiveFeatures: async () => {},
});

// simple helper to run after first paint
function runIdle(fn: () => void) {
  if (typeof window === 'undefined') return;
  const asSoonAsPossible = () => setTimeout(fn, 0);
  // use requestIdleCallback when available
  return window.requestIdleCallback ? window.requestIdleCallback(fn) : asSoonAsPossible();
}

export function SupabaseSyncProvider({ children }: Props) {
  const pathname = usePathname();
  const setOnline = useConnectionStore(s => s.setOnline);

  const syncActive = useCallback(async () => {
    const stores = await getStoresToSyncForRouteAsync(pathname);
    await Promise.all(
      stores.map(async s => {
        await s.syncPending();
        await s.syncFromServer();
      }),
    );
  }, [pathname]);

  useEffect(() => {
    setOnline(isOnline());
  }, [setOnline]);

  useEffect(() => {
    function handleOnline() {
      setOnline(true);
      void syncActive();
    }
    function handleOffline() {
      setOnline(false);
    }
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOnline, syncActive]);

  // first sync after idle, not during hydration
  useEffect(() => {
    if (!isOnline()) return;
    runIdle(() => {
      void syncActive();
    });
  }, [syncActive]);

  // periodic background sync only for route features
  useEffect(() => {
    let cleanups: Array<() => void> = [];
    let cancelVisibility: (() => void) | undefined;

    let aborted = false;
    async function setup() {
      if (!isOnline()) return;
      const stores = await getStoresToSyncForRouteAsync(pathname);

      cleanups = stores.map(s =>
        schedulePeriodicSync(async () => {
          if (isOnline()) {
            await s.syncPending();
            await s.syncFromServer();
          }
        }, SyncConfig.BACKGROUND_SYNC),
      );

      cancelVisibility = syncOnVisibilityChange(async () => {
        if (aborted) return;
        await Promise.all(
          stores.map(async s => {
            await s.syncPending();
            await s.syncFromServer();
          }),
        );
      }, SyncConfig.RESUME_SYNC_DELAY);
    }
    void setup();

    return () => {
      aborted = true;
      cleanups.forEach(fn => fn());
      if (cancelVisibility) cancelVisibility();
    };
  }, [pathname]);

  useEffect(() => {
    function handleBeforeUnload() {
      if (isOnline()) void syncActive();
    }
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [syncActive]);

  return (
    <SupabaseSyncContext.Provider value={{ syncNowForActiveFeatures: syncActive }}>
      {children}
    </SupabaseSyncContext.Provider>
  );
}
