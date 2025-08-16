import { useEffect } from 'react';

import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

import {
  EVENT_CACHE_KEYS,
  filterEventsByRange,
  mergeEventsById,
  pruneByRangeWithBuffer,
} from '@/features/event/utils/eventCacheUtils';
import { fetchGoogleEvents } from '@/legacy/services/googleEventsService';
import type { Event } from '@/legacy/types/Event';

const FETCH_INTERVAL_MS = 60_000;
const DERIVED_STALE_TIME_MS = 30_000;
const GC_TIME_MS = 5 * 60_000;

export function useGoogleEvents(start?: Date, end?: Date) {
  const { status } = useSession();
  const enabled = status === 'authenticated';
  const qc = useQueryClient();

  const fetchQuery = useQuery<Event[], Error>({
    queryKey: [EVENT_CACHE_KEYS.google.fetch, start?.toISOString(), end?.toISOString()],
    queryFn: () => fetchGoogleEvents(start, end),
    enabled,
    refetchInterval: FETCH_INTERVAL_MS,
    placeholderData: keepPreviousData,
    structuralSharing: true,
    gcTime: GC_TIME_MS, // NEW
  });

  useEffect(() => {
    if (!fetchQuery.data) return;
    qc.setQueryData<Event[]>([EVENT_CACHE_KEYS.google.cache], old => {
      const merged = mergeEventsById(old, fetchQuery.data!, 'google');
      return pruneByRangeWithBuffer(merged, { start, end }, 60, 60);
    });
  }, [fetchQuery.data, qc, start, end]);

  return useQuery<Event[], Error>({
    queryKey: [EVENT_CACHE_KEYS.google.range, start?.toISOString(), end?.toISOString()],
    queryFn: () => {
      const all = qc.getQueryData<Event[]>([EVENT_CACHE_KEYS.google.cache]) ?? [];
      return filterEventsByRange(all, { start, end });
    },
    enabled,
    placeholderData: keepPreviousData,
    staleTime: DERIVED_STALE_TIME_MS,
    structuralSharing: true,
    gcTime: GC_TIME_MS,
  });
}
