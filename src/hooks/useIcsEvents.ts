import { useQuery } from '@tanstack/react-query';

import { fetchIcsEvents } from '@/services/icsEventsService';
import { useSettingsStorage } from '@/store/settings/store';

export function useIcsEvents(start?: Date, end?: Date) {
  const calendars = useSettingsStorage(s => s.icsCalendars);

  return useQuery({
    queryKey: ['ics-events', start?.toISOString(), end?.toISOString()],
    queryFn: () => fetchIcsEvents(calendars, start, end),
    // refresh rate:
    // according to some sources, commonly between 6h and 24h
    // but in practice, around 1 minute
    refetchInterval: 1000 * 60 * 1, // 1 minute
  });
}
