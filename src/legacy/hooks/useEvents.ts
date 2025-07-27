import { useEffect } from 'react';

import { useGoogleEvents } from '@/legacy/hooks/useGoogleEvents';
import { useIcsEvents } from '@/legacy/hooks/useIcsEvents';
import { useEventStore } from '@/legacy/store/eventStore';

export function useEvents(start?: Date, end?: Date) {
  const setRemoteEvents = useEventStore(s => s.setRemoteEvents);

  const {
    data: googleEvents = [],
    isLoading: loadingGoogle,
    isError: errorGoogle,
    error: googleError,
    refetch: refetchGoogle,
  } = useGoogleEvents(start, end);

  const {
    data: icsEvents = [],
    isLoading: loadingIcs,
    isError: errorIcs,
    error: icsError,
    refetch: refetchIcs,
  } = useIcsEvents(start, end);

  const isLoading = loadingGoogle || loadingIcs;
  const bothFailed = Boolean(errorGoogle && errorIcs);
  const firstError = googleError ?? icsError;

  useEffect(() => {
    if (isLoading) return;
    if (bothFailed) return;

    const combined = [...(errorGoogle ? [] : googleEvents), ...(errorIcs ? [] : icsEvents)];

    if (combined.length > 0) setRemoteEvents(combined);
  }, [googleEvents, icsEvents, isLoading, errorGoogle, errorIcs, setRemoteEvents, bothFailed]);

  function refetchAll() {
    refetchGoogle();
    refetchIcs();
  }

  return {
    isLoading,
    isError: bothFailed,
    error: firstError,
    refetch: refetchAll,
  };
}
