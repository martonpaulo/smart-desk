import { SyncInterval } from '@/core/constants/SyncInterval';
import { FeatureDef } from '@/core/types/FeatureDef';

export const SYNC_FEATURES: readonly FeatureDef[] = [
  {
    key: 'dashboard',
    module: '@/legacy/store/board/store',
    exportName: 'useBoardStore',
    interval: SyncInterval.HIGH,
  },
  {
    key: 'notes',
    routes: ['/notes'],
    module: '@/features/note/store/useNotesStore',
    exportName: 'useNotesStore',
    interval: SyncInterval.HIGH,
  },
  {
    key: 'events',
    routes: ['/calendar'],
    module: '@/features/event/store/useLocalEventsStore',
    exportName: 'useLocalEventsStore',
    interval: SyncInterval.HIGH,
  },
  {
    key: 'maps',
    routes: ['/maps'],
    module: '@/features/map/store/useMapsStore',
    exportName: 'useMapsStore',
    interval: SyncInterval.HIGH,
  },
  {
    key: 'files',
    module: '@/features/file/store/useFilesStore',
    exportName: 'useFilesStore',
    interval: SyncInterval.HIGH,
  },
  {
    key: 'settings',
    module: '@/legacy/store/settings/store',
    exportName: 'useSettingsStorage',
    interval: SyncInterval.MEDIUM,
  },
  {
    key: 'locations',
    module: '@/features/location/store/useLocationsStore',
    exportName: 'useLocationsStore',
    interval: SyncInterval.LOW,
  },
  {
    key: 'tags',
    routes: ['/tags'],
    module: '@/features/tag/store/useTagsStore',
    exportName: 'useTagsStore',
    interval: SyncInterval.LOW,
  },
] as const;
