'use client';

import { createContext, ReactNode, useCallback, useEffect } from 'react';

import { usePathname } from 'next/navigation';

import { getStoresToSyncForRoute } from '@/core/config/syncStores';
import { SyncConfig } from '@/core/constants/SyncInterval';
import { useConnectionStore } from '@/core/store/useConnectionStore';
import { isOnline, schedulePeriodicSync } from '@/core/utils/syncHelpers';

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
  const setOnline = useConnectionStore(state => state.setOnline);

  const syncActive = useCallback(async () => {
    const stores = getStoresToSyncForRoute(pathname);
    await Promise.all(stores.map(async s => {
      await s.syncPending();
      await s.syncFromServer();
    }));
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

  useEffect(() => {
    if (!isOnline()) return;
    const stores = getStoresToSyncForRoute(pathname);
    const cleanups = stores.map(s =>
      schedulePeriodicSync(async () => {
        if (isOnline()) {
          await s.syncPending();
          await s.syncFromServer();
        }
      }, SyncConfig.BACKGROUND_MINUTES),
    );
    return () => cleanups.forEach(fn => fn());
  }, [pathname]);

  useEffect(() => {
    function handleBeforeUnload() {
      if (isOnline()) {
        void syncActive();
      }
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
