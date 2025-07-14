import { useQuery } from '@tanstack/react-query';

import { fetchIcsEvents } from '@/services/icsEventsService';
import { useSettingsStorage } from '@/store/settings/store';

export function useIcsEvents() {
  const calendars = useSettingsStorage(s => s.icsCalendars);

  return useQuery({
    queryKey: ['ics-events'],
    queryFn: () => fetchIcsEvents(calendars),
    // refresh rate:
    // according to some sources, commonly between 6h and 24h
    // but in practice, around 1 minute
    refetchInterval: 1000 * 60 * 1, // 1 minute
  });
}
