import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

import { fetchGoogleEvents } from '@/services/googleEventsService';

export function useGoogleEvents(date?: string) {
  const { status } = useSession();

  const enabled = status === 'authenticated';

  return useQuery({
    queryKey: ['google-events'],
    queryFn: () => fetchGoogleEvents(date),
    enabled,
    // API rate limit: 600 requests per minute
    refetchInterval: 1000 * 60 * 1, // 1 minute
  });
}
