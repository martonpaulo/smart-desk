import { useQuery } from '@tanstack/react-query';

import { fetchOutlookEvents } from '@/services/outlookEventsService';

export function useOutlookEvents() {
  return useQuery({
    queryKey: ['outlook-events'],
    queryFn: fetchOutlookEvents,
    // refresh rate:
    // according to some sources, commonly between 6h and 24h
    // but in practice, around 1 minute
    refetchInterval: 1000 * 60 * 1, // 1 minute
  });
}
