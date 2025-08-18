import { SyncInterval } from '@/core/constants/SyncInterval';
import type { FeatureDef } from '@/core/types/FeatureDef';

export const SYNC_FEATURES: readonly FeatureDef[] = [
  {
    key: 'dashboard',
    routes: [],
    exportName: 'useBoardStore',
    interval: SyncInterval.HIGH,
    loader: () => import('@/legacy/store/board/store'),
  },
  {
    key: 'notes',
    routes: ['/notes'],
    exportName: 'useNotesStore',
    interval: SyncInterval.HIGH,
    loader: () => import('@/features/note/store/useNotesStore'),
  },
  {
    key: 'events',
    routes: ['/calendar', '/locations', '/planner'],
    exportName: 'useLocalEventsStore',
    interval: SyncInterval.HIGH,
    loader: () => import('@/features/event/store/useLocalEventsStore'),
  },
  {
    key: 'files',
    routes: ['/files', '/maps'],
    exportName: 'useFilesStore',
    interval: SyncInterval.HIGH,
    loader: () => import('@/features/file/store/useFilesStore'),
  },
  {
    key: 'settings',
    routes: ['/', '/settings'],
    exportName: 'useSettingsStorage',
    interval: SyncInterval.MEDIUM,
    loader: () => import('@/legacy/store/settings/store'),
  },
  {
    key: 'locations',
    routes: ['/locations'],
    exportName: 'useLocationsStore',
    interval: SyncInterval.LOW,
    loader: () => import('@/features/location/store/useLocationsStore'),
  },
  {
    key: 'tags',
    routes: ['/', '/tags', '/planner'],
    exportName: 'useTagsStore',
    interval: SyncInterval.LOW,
    loader: () => import('@/features/tag/store/useTagsStore'),
  },
  {
    key: 'maps',
    routes: ['/maps'],
    exportName: 'useMapsStore',
    interval: SyncInterval.LOW,
    loader: () => import('@/features/map/store/useMapsStore'),
  },
] as const;
