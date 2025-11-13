import { SyncInterval } from 'src/core/constants/SyncInterval';
import type { FeatureDef } from 'src/core/types/FeatureDef';

export const SYNC_FEATURES: readonly FeatureDef[] = [
  {
    key: 'dashboard',
    routes: [],
    exportName: 'useBoardStore',
    interval: SyncInterval.HIGH,
    loader: () => import('src/legacy/store/board/store'),
  },
  {
    key: 'notes',
    routes: ['/notes'],
    exportName: 'useNotesStore',
    interval: SyncInterval.HIGH,
    loader: () => import('src/features/note/store/useNotesStore'),
  },
  {
    key: 'events',
    routes: ['/', '/calendar', '/content/locations', '/planner'],
    exportName: 'useLocalEventsStore',
    interval: SyncInterval.HIGH,
    loader: () => import('src/features/event/store/useLocalEventsStore'),
  },
  {
    key: 'files',
    routes: ['/content/files', '/maps'],
    exportName: 'useFilesStore',
    interval: SyncInterval.HIGH,
    loader: () => import('src/features/file/store/useFilesStore'),
  },
  {
    key: 'settings',
    routes: ['/', '/settings'],
    exportName: 'useSettingsStorage',
    interval: SyncInterval.MEDIUM,
    loader: () => import('src/legacy/store/settings/store'),
  },
  {
    key: 'locations',
    routes: ['/content/locations'],
    exportName: 'useLocationsStore',
    interval: SyncInterval.LOW,
    loader: () => import('src/features/location/store/useLocationsStore'),
  },
  {
    key: 'tags',
    routes: ['/', '/content/tags', '/planner'],
    exportName: 'useTagsStore',
    interval: SyncInterval.LOW,
    loader: () => import('src/features/tag/store/useTagsStore'),
  },
  {
    key: 'maps',
    routes: ['/maps'],
    exportName: 'useMapsStore',
    interval: SyncInterval.LOW,
    loader: () => import('src/features/map/store/useMapsStore'),
  },
] as const;
