import { useEffect, useRef, useState } from 'react';

import type { Event } from '@/types/Event';
import { getEventChangeMessages } from '@/utils/eventChangeUtils';

export function useEventChanges(events: Event[]): string[] {
  const previousEventsRef = useRef<Event[]>(events);
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
