import { UseQueryResult } from '@tanstack/react-query';
import { endOfToday, startOfToday } from 'date-fns';

import { useLocalEventsStore } from '@/features/event/store/useLocalEventsStore';
import { useGoogleEvents } from '@/legacy/hooks/useGoogleEvents';
import { useIcsEvents } from '@/legacy/hooks/useIcsEvents';
import { Event } from '@/legacy/types/Event';
import { mapToLegacyEvent } from '@/legacy/utils/eventLegacyMapper';

export function useCombinedEvents(start: Date = startOfToday(), end: Date = endOfToday()) {
  const startTime = start.getTime();
  const endTime = end.getTime();

  // 1. Source hooks
  const localItems = useLocalEventsStore(s => s.items).map(mapToLegacyEvent);
  const googleQuery: UseQueryResult<Event[], Error> = useGoogleEvents(start, end);
  const icsQuery: UseQueryResult<Event[], Error> = useIcsEvents(start, end);

  // 2. Derived helpers
  const filterByRange = (items: Event[]): Event[] =>
    items.filter(ev => {
      if (ev.trashed) return false;
      const evStart = ev.start instanceof Date ? ev.start.getTime() : new Date(ev.start).getTime();
      const evEnd = ev.end instanceof Date ? ev.end.getTime() : new Date(ev.end).getTime();

      const intersects = evStart < endTime && evEnd > startTime;
      return intersects;
    });

  const byStartAsc = (a: Event, b: Event) =>
    new Date(a.start).getTime() - new Date(b.start).getTime();

  const mergeDeDupe = (locals: Event[], google: Event[], ics: Event[]): Event[] => {
    const map = new Map<string, Event>();

    const addIfMissing = (ev: Event) => {
      if (!map.has(ev.id)) map.set(ev.id, ev);
    };

    const upsert = (ev: Event, overwrite: boolean) => {
      if (!map.has(ev.id)) {
        map.set(ev.id, ev);
        return;
      }
      if (overwrite) map.set(ev.id, ev);
    };

    google.forEach(addIfMissing);
    ics.forEach(addIfMissing);
    locals.forEach(ev => upsert(ev, true));

    return Array.from(map.values()).sort(byStartAsc);
  };

  // 3. Filter per source
  const filteredLocal = filterByRange(localItems);
  const filteredGoogle = filterByRange(googleQuery.data ?? []).map(event => ({
    ...event,
    source: 'google' as const,
  }));
  const filteredIcs = filterByRange(icsQuery.data ?? []).map(event => ({
    ...event,
    source: 'ics' as const,
  }));

  // 4. Merge with de-dupe
  const data = mergeDeDupe(filteredLocal, filteredGoogle, filteredIcs);

  const isLoading = googleQuery.isLoading || icsQuery.isLoading;
  const isFetching = googleQuery.isFetching || icsQuery.isFetching;
  const error = googleQuery.error ?? icsQuery.error ?? null;

  const refetch = async () => {
    await Promise.all([googleQuery.refetch(), icsQuery.refetch()]);
  };

  return {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  };
}
