import { SYNC_FEATURES } from 'src/core/config/syncStores';
import type { FeatureDef } from 'src/core/types/FeatureDef';

interface SyncStoreConfig {
  useStore: {
    getState: () => {
      syncFromServer?: () => Promise<void>;
      syncPending?: () => Promise<void>;
    };
  };
  syncFromServer: () => Promise<void>;
  syncPending: () => Promise<void>;
  intervalMs: number;
}

// A feature is "always on" when routes are empty or undefined.
function isAlways(def: FeatureDef): boolean {
  return !def.routes || def.routes.length === 0;
}

// Match the current pathname against configured routes.
//
// The root path '/' is treated specially to avoid matching every route
// (since every pathname starts with '/'). This allows features to opt-in
// to a one-time sync on the home screen without syncing again on other
// pages.
function matchesRoute(def: FeatureDef, pathname: string): boolean {
  if (isAlways(def)) return true;
  return def.routes!.some(route => (route === '/' ? pathname === '/' : pathname.startsWith(route)));
}

// Import the store using the feature-provided static loader.
async function importStore(def: FeatureDef): Promise<SyncStoreConfig> {
  const mod = await def.loader();
  const useStore = mod[def.exportName] as SyncStoreConfig['useStore'];

  if (!useStore || typeof useStore.getState !== 'function') {
    throw new Error(
      `Failed to resolve export "${def.exportName}" from loader for feature "${def.key}".`,
    );
  }

  return {
    useStore,
    intervalMs: def.interval,
    async syncPending() {
      const state = useStore.getState();
      if (state.syncPending) await state.syncPending();
    },
    async syncFromServer() {
      const state = useStore.getState();
      if (state.syncFromServer) await state.syncFromServer();
    },
  };
}

// Resolve all stores that should sync for a given route.
export async function getStoresToSyncForRouteAsync(pathname: string): Promise<SyncStoreConfig[]> {
  const defs = SYNC_FEATURES.filter(def => matchesRoute(def, pathname));
  return Promise.all(defs.map(importStore));
}
