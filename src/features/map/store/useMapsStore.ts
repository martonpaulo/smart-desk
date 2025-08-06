import { createSyncedEntityStore } from '@/core/store/createSyncedEntityStore';
import { MapRecord } from '@/features/map/types/MapRecord';

export const useMapsStore = createSyncedEntityStore<MapRecord>({
  table: 'maps',
  requiredFields: ['name', 'filePublicId', 'fileUrl'],
  defaults: {
    // start with empty objects so your UI can safely read them
    regionColors: {},
    regionLabels: {},
    regionTooltips: {},
  },
});
