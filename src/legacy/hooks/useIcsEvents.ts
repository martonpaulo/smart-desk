import { useEffect } from 'react';

import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  EVENT_CACHE_KEYS,
  filterEventsByRange,
  mergeEventsById,
  pruneByRangeWithBuffer,
} from '@/features/event/utils/eventCacheUtils';
import { fetchIcsEvents } from '@/legacy/services/icsEventsService';
import { useSettingsStorage } from '@/legacy/store/settings/store';
import type { Event } from '@/legacy/types/Event';

const FETCH_INTERVAL_MS = 60_000;
const DERIVED_STALE_TIME_MS = 30_000;
const GC_TIME_MS = 5 * 60_000;

export function useIcsEvents(start?: Date, end?: Date) {
  const calendars = useSettingsStorage(s => s.icsCalendars);
  const enabled = Array.isArray(calendars) && calendars.length > 0;
  const qc = useQueryClient();

  const fetchQuery = useQuery<Event[], Error>({
    queryKey: [EVENT_CACHE_KEYS.ics.fetch, start?.toISOString(), end?.toISOString()],
    queryFn: () => fetchIcsEvents(calendars, start, end),
    enabled,
    refetchInterval: FETCH_INTERVAL_MS,
    placeholderData: keepPreviousData,
    structuralSharing: true,
    gcTime: GC_TIME_MS, // NEW
  });

  useEffect(() => {
    if (!fetchQuery.data) return;
    qc.setQueryData<Event[]>([EVENT_CACHE_KEYS.ics.cache], old => {
      const merged = mergeEventsById(old, fetchQuery.data!, 'ics');
      return pruneByRangeWithBuffer(merged, { start, end }, 60, 60);
    });
  }, [fetchQuery.data, qc, start, end]);

  return useQuery<Event[], Error>({
    queryKey: [EVENT_CACHE_KEYS.ics.range, start?.toISOString(), end?.toISOString()],
    queryFn: () => {
      const all = qc.getQueryData<Event[]>([EVENT_CACHE_KEYS.ics.cache]) ?? [];
      return filterEventsByRange(all, { start, end });
    },
    enabled,
    placeholderData: keepPreviousData,
    staleTime: DERIVED_STALE_TIME_MS,
    structuralSharing: true,
    gcTime: GC_TIME_MS,
  });
}
