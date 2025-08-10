import { SYNC_FEATURES } from '@/core/config/syncStores';
import { FeatureDef } from '@/core/types/FeatureDef';
import type { SyncStoreConfig } from '@/core/types/SyncStoreConfig';
import { defineSync } from '@/core/utils/syncHelpers';

type FeatureKey = (typeof SYNC_FEATURES)[number]['key'];
type Loader = () => Promise<SyncStoreConfig>;

function isAlways(def: FeatureDef): boolean {
  return !def.routes || def.routes.length === 0;
}

/**
 * Single dynamic import with webpackInclude so webpack pre-bundles allowed files.
 * You only add entries in SYNC_FEATURES. No registry duplication.
 * The regex is broad on purpose and still safe. It limits to "store" files.
 */
function createLoader(def: FeatureDef): Loader {
  return async () => {
    try {
      // Important: def.module must match a real source path that webpack can resolve
      // using your aliases. Example: '@/legacy/store/board/store' or
      // '@/features/note/store/useNotesStore'. No extension forcing here.
      const mod = await import(
        /* webpackInclude: /(?:^|\/)store\/[^/]+\.(ts|tsx|js)$/ */
        /* webpackMode: "lazy" */
        `${def.module}`
      );

      const store = (mod as Record<string, unknown>)[def.exportName] as {
        getState: () => {
          syncFromServer: () => Promise<void>;
          syncPending: () => Promise<void>;
        };
      };

      return defineSync(store, def.interval, { alwaysSync: isAlways(def) });
    } catch (err) {
      throw new Error(`Failed to import module "${def.module}" from SYNC_FEATURES: ${String(err)}`);
    }
  };
}

const featureLoaders: Record<FeatureKey, Loader> = Object.fromEntries(
  SYNC_FEATURES.map(def => [def.key, createLoader(def)]),
) as Record<FeatureKey, Loader>;

const routeFeatureMap: Record<string, FeatureKey[]> = SYNC_FEATURES.reduce(
  (acc, def) => {
    if (!isAlways(def)) {
      for (const prefix of def.routes!) {
        if (!acc[prefix]) acc[prefix] = [];
        acc[prefix].push(def.key);
      }
    }
    return acc;
  },
  {} as Record<string, FeatureKey[]>,
);

const alwaysKeys = new Set<FeatureKey>(SYNC_FEATURES.filter(isAlways).map(def => def.key));

export async function getStoresToSyncForRouteAsync(route: string): Promise<SyncStoreConfig[]> {
  const active = new Set<FeatureKey>();
  for (const [prefix, feats] of Object.entries(routeFeatureMap)) {
    if (route.startsWith(prefix)) feats.forEach(f => active.add(f));
  }
  alwaysKeys.forEach(f => active.add(f));
  return Promise.all(Array.from(active).map(f => featureLoaders[f]()));
}
