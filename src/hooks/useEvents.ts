import { useEffect } from 'react';

import { useGoogleEvents } from '@/hooks/useGoogleEvents';
import { useIcsEvents } from '@/hooks/useIcsEvents';
import { useEventStore } from '@/store/eventStore';

export function useEvents(date?: string) {
  const setRemoteEvents = useEventStore(store => store.setRemoteEvents);

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

    const fetched = [...googleEvents, ...icsEvents];
    setRemoteEvents(fetched);
  }, [googleEvents, icsEvents, isLoading, hasError, setRemoteEvents]);

  function refetchAll() {
    refetchGoogle();
    refetchIcs();
  }

  return { isLoading, isError: hasError, error, refetch: refetchAll };
}
