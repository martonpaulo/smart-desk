import { useEffect } from 'react';

import { useGoogleEvents } from '@/hooks/useGoogleEvents';
import { useIcsEvents } from '@/hooks/useIcsEvents';
import { useEventStore } from '@/store/eventStore';
import { mergeEvents } from '@/utils/eventUtils';

export function useEvents(date?: string) {
  const setEvents = useEventStore(store => store.setEvents);

  const {
    data: googleEvents = [],
    isLoading: loadingGoogle,
    isError: errorGoogle,
    error: googleError,
    refetch: refetchGoogle,
  } = useGoogleEvents(date);

  const {
    data: icsEvents = [],
    isLoading: loadingIcs,
    isError: errorIcs,
    error: icsError,
    refetch: refetchIcs,
  } = useIcsEvents();

  const isLoading = loadingGoogle || loadingIcs;
  const hasError = errorGoogle || errorIcs;
  const error = googleError || icsError;

  useEffect(() => {
    if (isLoading || hasError) return;

    // read previous events from the store without subscribing and triggering a re-render
    const prevEvents = useEventStore.getState().events;

    const fetched = [...googleEvents, ...icsEvents];
    const merged = mergeEvents(prevEvents, fetched);

    setEvents(merged);
  }, [googleEvents, icsEvents, isLoading, hasError, setEvents]);

  function refetchAll() {
    refetchGoogle();
    refetchIcs();
  }

  return { isLoading, isError: hasError, error, refetch: refetchAll };
}
