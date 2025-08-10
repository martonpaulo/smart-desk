import { SYNC_FEATURES } from '@/core/config/syncStores';
import type { FeatureDef } from '@/core/types/FeatureDef';

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

// Match when the current pathname starts with any configured route.
function matchesRoute(def: FeatureDef, pathname: string): boolean {
  if (isAlways(def)) return true;
  return def.routes!.some(route => pathname.startsWith(route));
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
