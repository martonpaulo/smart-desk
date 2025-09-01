import { createSyncedEntityStore } from 'src/core/store/createSyncedEntityStore';
import { Event } from 'src/features/event/types/Event';

export const useLocalEventsStore = createSyncedEntityStore<Event>({
  table: 'events',
  requiredFields: ['startTime', 'endTime', 'summary'],
  defaults: { allDay: false, acknowledged: false },
  dateFields: ['startTime', 'endTime'],
});
