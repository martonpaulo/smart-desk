import { useEffect } from 'react';

import { useGoogleEvents } from '@/hooks/useGoogleEvents';
import { useOutlookEvents } from '@/hooks/useOutlookEvents';
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
    data: outlookEvents = [],
    isLoading: loadingOutlook,
    isError: errorOutlook,
    error: outlookError,
    refetch: refetchOutlook,
  } = useOutlookEvents();

  const isLoading = loadingGoogle || loadingOutlook;
  const hasError = errorGoogle || errorOutlook;
  const error = googleError || outlookError;

  useEffect(() => {
    if (isLoading || hasError) return;

    // read previous events from the store without subscribing and triggering a re-render
    const prevEvents = useEventStore.getState().events;

    const fetched = [...googleEvents, ...outlookEvents];
    const merged = mergeEvents(prevEvents, fetched);

    setEvents(merged);
  }, [googleEvents, outlookEvents, isLoading, hasError, setEvents]);

  function refetchAll() {
    refetchGoogle();
    refetchOutlook();
  }

  return { isLoading, isError: hasError, error, refetch: refetchAll };
}
