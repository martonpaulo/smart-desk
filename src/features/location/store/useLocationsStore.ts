import { createSyncedEntityStore } from 'src/core/store/createSyncedEntityStore';
import type { Location } from 'src/features/location/types/Location';

export const useLocationsStore = createSyncedEntityStore<Location>({
  table: 'locations',
  requiredFields: ['name', 'type', 'startDate', 'endDate'],
  defaults: { type: 'city', startDate: new Date() },
  dateFields: ['startDate', 'endDate'],
});
