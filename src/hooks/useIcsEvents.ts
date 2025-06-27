import { useQuery } from '@tanstack/react-query';

import { fetchIcsEvents } from '@/services/icsEventsService';

export function useIcsEvents() {
  return useQuery({
    queryKey: ['ics-events'],
    queryFn: fetchIcsEvents,
    // refresh rate:
    // according to some sources, commonly between 6h and 24h
    // but in practice, around 1 minute
    refetchInterval: 1000 * 60 * 1, // 1 minute
  });
}
