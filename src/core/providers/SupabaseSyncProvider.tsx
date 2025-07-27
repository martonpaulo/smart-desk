import { ReactNode, useEffect } from 'react';

import { syncStores } from '@/core/config/syncStores';
import { SyncStoreConfig } from '@/core/types/SyncStoreConfig';
import { isSupabaseLoggedIn } from '@/legacy/hooks/useSupabaseAuth';
import { useSyncStatusStore } from '@/legacy/store/syncStatus';

interface Props {
  children: ReactNode;
}

export function SupabaseSyncProvider({ children }: Props) {
  const setStatus = useSyncStatusStore.getState().setStatus;

  useEffect(() => {
    // full sync: pull remote supabase data then push local pending
    async function fullSync() {
      const ok = await isSupabaseLoggedIn();
      if (!ok) {
        setStatus('disconnected');
        return;
      }
      try {
        await Promise.all(syncStores.map(s => s.syncFromServer()));
        await Promise.all(syncStores.map(s => s.syncPending()));
        setStatus('connected');
      } catch {
        setStatus('error');
      }
    }

    // periodic sync: only push pending supabase & changes
    function setupInterval(s: SyncStoreConfig) {
      const id = window.setInterval(async () => {
        if (!(await isSupabaseLoggedIn())) {
          setStatus('disconnected');
          return;
        }
        try {
          await s.syncPending();
          setStatus('connected');
        } catch {
          setStatus('error');
        }
      }, s.intervalMs);
      window.addEventListener('online', s.syncPending);
      return () => {
        clearInterval(id);
        window.removeEventListener('online', s.syncPending);
      };
    }

    void fullSync();
    const cleanups = syncStores.map(setupInterval);
    return () => cleanups.forEach(fn => fn());
  }, [setStatus]);

  return <>{children}</>;
}
