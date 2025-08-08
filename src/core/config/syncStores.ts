import { SyncInterval } from '@/core/constants/SyncInterval';
import type { SyncStoreConfig } from '@/core/types/SyncStoreConfig';
import { defineSync } from '@/core/utils/syncHelpers';
import { useLocalEventsStore } from '@/features/event/store/useLocalEventsStore';
import { useFilesStore } from '@/features/file/store/useFilesStore';
import { useLocationsStore } from '@/features/location/store/useLocationsStore';
import { useMapsStore } from '@/features/map/store/useMapsStore';
import { useNotesStore } from '@/features/note/store/useNotesStore';
import { useTagsStore } from '@/features/tag/store/useTagsStore';
import { useBoardStore } from '@/legacy/store/board/store';
import { useSettingsStorage } from '@/legacy/store/settings/store';

export type StoreDef = SyncStoreConfig;

// Registry of all syncable stores keyed by feature name.
const storeRegistry: Record<string, StoreDef> = {
  dashboard: defineSync(useBoardStore, SyncInterval.HIGH, { alwaysSync: true }),
  notes: defineSync(useNotesStore, SyncInterval.HIGH, { alwaysSync: true }),
  events: defineSync(useLocalEventsStore, SyncInterval.HIGH),
  maps: defineSync(useMapsStore, SyncInterval.HIGH),
  files: defineSync(useFilesStore, SyncInterval.HIGH),
  settings: defineSync(useSettingsStorage, SyncInterval.MEDIUM),
  locations: defineSync(useLocationsStore, SyncInterval.LOW),
  tags: defineSync(useTagsStore, SyncInterval.LOW),
};

export const syncStores: Array<StoreDef> = Object.values(storeRegistry);

// Map route prefixes to features.
const routeFeatureMap: Record<string, Array<keyof typeof storeRegistry>> = {
  '/notes': ['notes'],
  '/maps': ['maps'],
  '/calendar': ['events'],
  '/tags': ['tags'],
};

// Resolve the set of stores to sync for a given route considering always-sync stores.
export function getStoresToSyncForRoute(route: string): Array<StoreDef> {
  const active = new Set<keyof typeof storeRegistry>();
  Object.entries(routeFeatureMap).forEach(([prefix, feats]) => {
    if (route.startsWith(prefix)) {
      feats.forEach(f => active.add(f));
    }
  });
  return Object.entries(storeRegistry)
    .filter(([feature, def]) => def.alwaysSync || active.has(feature as keyof typeof storeRegistry))
    .map(([, def]) => def);
}
