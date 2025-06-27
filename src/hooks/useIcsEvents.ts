import { useQuery } from '@tanstack/react-query';

import { fetchIcsEvents } from '@/services/icsEventsService';

export function useIcsEvents() {
  return useQuery({
    queryKey: ['ics-events'],
    queryFn: fetchIcsEvents,
    // refresh rate: commonly between 6h and 24h
    refetchInterval: 1000 * 60 * 5, // 5 minutes
  });
}
