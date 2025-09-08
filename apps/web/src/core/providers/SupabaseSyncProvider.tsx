'use client';

import { createContext, ReactNode, useCallback, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

import { SyncInterval } from 'src/core/constants/SyncInterval';
import { useSupabaseSessionMonitor } from 'src/core/hooks/useSupabaseSessionMonitor';
import { useSyncTrigger } from 'src/core/hooks/useSyncTriggers';
import { useConnectivityStore } from 'src/core/store/useConnectivityStore';
import {
  combineCleanups,
  runIdle,
  schedulePeriodicSync,
  syncOnVisibilityChange,
  syncStoresBatch,
} from 'src/core/utils/syncHelpers';
import { getStoresToSyncForRouteAsync } from 'src/core/utils/syncRegistry';
import { useOnlineStatus } from 'src/shared/hooks/useOnlineStatus';

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
  const { status } = useSession(); // 'loading' | 'authenticated' | 'unauthenticated'
  const online = useOnlineStatus();

  // Monitor Supabase session status
  useSupabaseSessionMonitor();

  // Monitor connectivity changes and show snackbars
  useSyncTrigger();

  const setAuthStatus = useConnectivityStore(s => s.setAuthStatus);
  const setOnline = useConnectivityStore(s => s.setOnline);
  const setConnectionError = useConnectivityStore(s => s.setConnectionError);
  const isConnected = useConnectivityStore(s => s.isConnected);

  // Keep store in sync with auth status
  useEffect(() => {
    setAuthStatus(status);
  }, [status, setAuthStatus]);

  // Keep store in sync with navigator online
  useEffect(() => {
    setOnline(online);
  }, [online, setOnline]);

  // Resolve stores to sync for the current route with error handling
  const syncActive = useCallback(async () => {
    try {
      const stores = await getStoresToSyncForRouteAsync(pathname);
      await syncStoresBatch(stores);
    } catch (error) {
      console.error('Sync failed:', error);
      setConnectionError('server_error');
    }
  }, [pathname, setConnectionError]);

  // First sync after idle when connected
  useEffect(() => {
    if (!isConnected) return;
    runIdle(() => {
      if (useConnectivityStore.getState().isConnected) {
        void syncActive();
      }
    });
  }, [isConnected, pathname, syncActive]);

  // Periodic background sync and resume on visibility while connected
  useEffect(() => {
    if (!isConnected) return;

    let cleanupAll: (() => void) | undefined;
    let cancelled = false;

    void (async () => {
      const stores = await getStoresToSyncForRouteAsync(pathname);
      if (cancelled) return;

      const periodicCleanups = stores.map(s =>
        schedulePeriodicSync(async () => {
          if (!useConnectivityStore.getState().isConnected) return;
          try {
            await s.syncPending();
            await s.syncFromServer();
          } catch (error) {
            console.error('Periodic sync failed:', error);
            setConnectionError('server_error');
          }
        }, SyncInterval.BACKGROUND),
      );

      const cancelVisibility = syncOnVisibilityChange(async () => {
        if (cancelled) return;
        if (useConnectivityStore.getState().isConnected) {
          try {
            await syncStoresBatch(stores);
          } catch (error) {
            console.error('Visibility sync failed:', error);
            setConnectionError('server_error');
          }
        }
      }, SyncInterval.VISIBILITY);

      cleanupAll = combineCleanups([...periodicCleanups, cancelVisibility]);
    })();

    return () => {
      cancelled = true;
      if (cleanupAll) cleanupAll();
    };
  }, [isConnected, pathname, setConnectionError]);

  // Flush before unload if connected
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!useConnectivityStore.getState().isConnected) return;
      void syncActive();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [syncActive, pathname]);

  const value: SyncContextValue = {
    syncNowForActiveFeatures: syncActive,
  };

  return <SupabaseSyncContext.Provider value={value}>{children}</SupabaseSyncContext.Provider>;
}
