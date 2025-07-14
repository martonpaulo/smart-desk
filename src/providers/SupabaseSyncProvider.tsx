'use client';

import { ReactNode, useEffect } from 'react';

import { isSupabaseLoggedIn } from '@/hooks/useSupabaseAuth';
import { useBoardStore } from '@/store/board/store';

interface SupabaseSyncProviderProps {
  children: ReactNode;
}

export function SupabaseSyncProvider({ children }: SupabaseSyncProviderProps) {
  useEffect(() => {
    // full sync: pull remote changes then push local pending
    async function fullSync() {
      const loggedIn = await isSupabaseLoggedIn();
      if (!loggedIn) {
        console.warn('no Supabase session, skipping full sync');
        return;
      }

      try {
        const store = useBoardStore.getState();
        await store.syncFromServer();
        await store.syncPending();
      } catch (err) {
        console.error('fullSync error', err);
      }
    }

    // periodic sync: only push pending tasks/columns
    async function periodicSync() {
      const loggedIn = await isSupabaseLoggedIn();
      if (!loggedIn) return;

      try {
        await useBoardStore.getState().syncPending();
      } catch (err) {
        console.error('periodic syncPending error', err);
      }
    }

    // initial sync on mount
    void fullSync();

    // retry every 10 seconds
    const intervalId = window.setInterval(periodicSync, 10_000);

    // retry when back online
    window.addEventListener('online', periodicSync);

    // cleanup on unmount
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('online', periodicSync);
    };
  }, []);

  return children;
}
