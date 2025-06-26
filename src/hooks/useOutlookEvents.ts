import { useQuery } from '@tanstack/react-query';

import { fetchOutlookEvents } from '@/services/outlookEventsService';

export function useOutlookEvents() {
  return useQuery({
    queryKey: ['outlook-events'],
    queryFn: fetchOutlookEvents,
    // refresh rate: commonly between 6h and 24h
    refetchInterval: 1000 * 60 * 5, // 5 minutes
  });
}
