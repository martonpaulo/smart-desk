// Determine online status with a safe fallback for server environments.
export function isOnline(): boolean {
  return typeof navigator === 'undefined' ? true : navigator.onLine;
}

// Run a callback after the browser is idle. Fall back to a timeout when
// `requestIdleCallback` is unavailable (e.g. Safari). This ensures the sync
// triggers once the UI is painted without blocking hydration.
export function runIdle(fn: () => void): void {
  if (typeof window === 'undefined') return;

  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(fn);
    return;
  }

  window.setTimeout(fn, 0);
}

// Schedule a periodic async sync function and return a cleanup callback.
export function schedulePeriodicSync(storeSyncFn: () => Promise<void>, ms: number): () => void {
  const id = window.setInterval(() => {
    void storeSyncFn();
  }, ms);
  return () => clearInterval(id);
}

// Trigger sync when the document becomes visible after a stale period.
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

type StoreSync = {
  syncPending: () => Promise<void>;
  syncFromServer: () => Promise<void>;
};

// Run the standard two-step sync sequence for a single store.
async function runStoreSync(store: StoreSync): Promise<void> {
  await store.syncPending();
  await store.syncFromServer();
}

// Run the standard sync sequence for a list of stores.
export async function syncStoresBatch(stores: StoreSync[]): Promise<void> {
  await Promise.all(stores.map(s => runStoreSync(s)));
}

// Compose multiple cleanup callbacks into one.
export function combineCleanups(cleanups: Array<() => void>): () => void {
  return () => cleanups.forEach(fn => fn());
}
