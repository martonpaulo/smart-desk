'use client';

import { createContext, ReactNode, useCallback, useEffect } from 'react';

import { usePathname } from 'next/navigation';

import { SyncInterval } from '@/core/constants/SyncInterval';
import { useConnectionStore } from '@/core/store/useConnectionStore';
import {
  combineCleanups,
  isOnline,
  runIdle,
  schedulePeriodicSync,
  syncOnVisibilityChange,
  syncStoresBatch,
} from '@/core/utils/syncHelpers';
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

export function SupabaseSyncProvider({ children }: Props) {
  const pathname = usePathname();
  const setOnline = useConnectionStore(s => s.setOnline);

  // Resolve stores for the current route and run a full sync pass.
  const syncActive = useCallback(async () => {
    const stores = await getStoresToSyncForRouteAsync(pathname);
    await syncStoresBatch(stores);
  }, [pathname]);

  // Keep connection flag in sync with navigator state.
  useEffect(() => {
    setOnline(isOnline());
  }, [setOnline]);

  // React to online/offline changes.
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

  // First sync after idle, not during hydration.
  useEffect(() => {
    if (!isOnline()) return;
    runIdle(() => {
      void syncActive();
    });
  }, [syncActive]);

  // Periodic background sync and resume-on-visibility.
  useEffect(() => {
    let aborted = false;

    async function setup() {
      if (!isOnline()) return;

      const stores = await getStoresToSyncForRouteAsync(pathname);

      // Set periodic sync per store with the configured background interval.
      const periodicCleanups = stores.map(s =>
        schedulePeriodicSync(async () => {
          if (isOnline()) {
            await s.syncPending();
            await s.syncFromServer();
          }
        }, SyncInterval.BACKGROUND),
      );

      // Resume sync when tab becomes visible and enough time has passed.
      const cancelVisibility = syncOnVisibilityChange(async () => {
        if (aborted) return;
        await syncStoresBatch(stores);
      }, SyncInterval.VISIBILITY);

      return combineCleanups([...periodicCleanups, cancelVisibility]);
    }

    let cleanupAll: (() => void) | undefined;
    void setup().then(c => {
      cleanupAll = c;
    });

    return () => {
      aborted = true;
      if (cleanupAll) cleanupAll();
    };
  }, [pathname]);

  // Try to flush pending changes before unload if online.
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
