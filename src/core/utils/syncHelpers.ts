import type { BaseType } from '@/core/types/BaseType';
import type { SyncStoreConfig } from '@/core/types/SyncStoreConfig';

// Register a store for synchronization with optional configuration.
export function defineSync<
  T extends { syncFromServer: () => Promise<void>; syncPending: () => Promise<void> },
>(
  store: { getState: () => T },
  intervalMs: number,
  options: { alwaysSync?: boolean } = {},
): SyncStoreConfig {
  const state = store.getState();
  return {
    syncFromServer: state.syncFromServer,
    syncPending: state.syncPending,
    intervalMs,
    alwaysSync: options.alwaysSync ?? false,
  };
}

// Determine online status with a safe fallback for server environments.
export function isOnline(): boolean {
  return typeof navigator === 'undefined' ? true : navigator.onLine;
}

// Schedule a periodic sync function and return a cleanup callback.
export function schedulePeriodicSync(
  storeSyncFn: () => Promise<void>,
  minutes: number,
): () => void {
  const id = window.setInterval(() => {
    void storeSyncFn();
  }, minutes * 60_000);
  return () => clearInterval(id);
}

// Trigger sync whenever the document becomes visible again after a stale period.
export function syncOnVisibilityChange(
  storeSyncFn: () => Promise<void>,
  staleAfterMs: number,
): () => void {
  let lastSync = 0;
  const handler = () => {
    if (document.visibilityState === 'visible' && Date.now() - lastSync > staleAfterMs) {
      lastSync = Date.now();
      void storeSyncFn();
    }
  };
  document.addEventListener('visibilitychange', handler);
  return () => document.removeEventListener('visibilitychange', handler);
}

// Resolve conflicts by preferring the entity with the latest updatedAt value.
export function resolveByUpdatedAt<T extends BaseType>(local: T, remote: T): T {
  return local.updatedAt > remote.updatedAt ? local : remote;
}
