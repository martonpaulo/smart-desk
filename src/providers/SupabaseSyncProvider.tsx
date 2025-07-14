'use client';

import { ReactNode, useEffect } from 'react';

import { isSupabaseLoggedIn } from '@/hooks/useSupabaseAuth';
import { useBoardStore } from '@/store/board/store';
import { useSettingsStorage } from '@/store/settings/store';
import { useSyncStatusStore } from '@/store/syncStatus';

interface SupabaseSyncProviderProps {
  children: ReactNode;
}

export function SupabaseSyncProvider({ children }: SupabaseSyncProviderProps) {
  const setStatus = useSyncStatusStore.getState().setStatus;

  useEffect(() => {
    const boardStore = useBoardStore.getState();
    const settingsStore = useSettingsStorage.getState();

    // full sync: pull remote supabase data then push local pending
    async function fullSync() {
      const loggedIn = await isSupabaseLoggedIn();
      if (!loggedIn) {
        console.warn('no Supabase session, skipping full sync');
        setStatus('disconnected');
        return;
      }

      try {
        await boardStore.syncFromServer();
        await boardStore.syncPending();
        await settingsStore.syncFromServer();
        await settingsStore.syncPending();
        setStatus('connected');
      } catch (err) {
        console.error('fullSync error', err);
        setStatus('error');
      }
    }

    // periodic sync: only push pending supabase & changes
    async function periodicSync() {
      const loggedIn = await isSupabaseLoggedIn();
      if (!loggedIn) {
        setStatus('disconnected');
        return;
      }

      try {
        await boardStore.syncPending();
        await settingsStore.syncPending();
        setStatus('connected');
      } catch (err) {
        console.error('periodicSync error', err);
        setStatus('error');
      }
    }

    // run once on mount
    void fullSync();

    // retry every 10 seconds
    const intervalId = window.setInterval(periodicSync, 10_000);

    // also retry when browser goes back online
    window.addEventListener('online', periodicSync);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('online', periodicSync);
    };
  }, [setStatus]);

  return children;
}
