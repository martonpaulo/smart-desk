import { useEffect, useRef, useState } from 'react';

import type { IEvent } from '@/types/IEvent';
import { getEventChangeMessages } from '@/widgets/ChangeSnackbar/eventChangeUtils';

export function useEventChanges(events: IEvent[]): string[] {
  const previousEventsRef = useRef<IEvent[]>(events);
  const [changeMessages, setChangeMessages] = useState<string[]>([]);

  useEffect(() => {
    const messages = getEventChangeMessages(previousEventsRef.current, events);

    if (messages.length > 0) {
      setChangeMessages(messages);
    }

    previousEventsRef.current = events;
  }, [events]);

  return changeMessages;
}
