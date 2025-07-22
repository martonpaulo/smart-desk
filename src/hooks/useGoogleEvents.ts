import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

import { fetchGoogleEvents } from '@/services/googleEventsService';

export function useGoogleEvents(start?: Date, end?: Date) {
  const { status } = useSession();

  const enabled = status === 'authenticated';

  return useQuery({
    queryKey: ['google-events', start?.toISOString(), end?.toISOString()],
    queryFn: () => fetchGoogleEvents(start, end),
    enabled,
    // API rate limit: 600 requests per minute
    refetchInterval: 1000 * 60 * 1, // 1 minute
  });
}
