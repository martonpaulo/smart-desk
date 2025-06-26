import { useQuery } from '@tanstack/react-query';

import { fetchGoogleEvents } from '@/services/googleEventsService';

export function useGoogleEvents(date?: string) {
  return useQuery({
    queryKey: ['google-events'],
    queryFn: () => fetchGoogleEvents(date),
    // API rate limit: 600 requests per minute
    refetchInterval: 1000 * 60 * 1, // 1 minute
  });
}
