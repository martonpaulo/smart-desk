import { EventDialog } from 'src/legacy/components/alert/EventDialog';
import { Event } from 'src/legacy/types/Event';
import {
  calculateMinutesUntilEvent,
  computeEventStatus,
  filterCurrentOrFutureEvents,
} from 'src/legacy/utils/eventUtils';

interface EventAlertProps {
  events: Event[] | null;
  onAlertAcknowledge: (eventId: string) => void;
  alertLeadTimeMinutes: number;
  meetingAlertEnabled: boolean;
}

import { useRef } from 'react';

export function EventAlert({
  events,
  onAlertAcknowledge,
  alertLeadTimeMinutes,
  meetingAlertEnabled,
}: EventAlertProps) {
  const shownRef = useRef(new Set<string>());
  if (!events) return null;

  const withoutFullDay = events.filter(e => !e.allDay);
  const upcomingEvents = filterCurrentOrFutureEvents(withoutFullDay);

  const eventsToShow = upcomingEvents.filter(event => {
    const now = new Date();
    const eventStatus = computeEventStatus(event, now);
    return (
      (eventStatus === 'current' ||
        (eventStatus === 'future' &&
          calculateMinutesUntilEvent(event, now) <= alertLeadTimeMinutes)) &&
      !event.acknowledged &&
      !shownRef.current.has(event.id)
    );
  });

  if (eventsToShow.length === 0) {
    return null;
  }

  return eventsToShow.map(event => {
    shownRef.current.add(event.id);
    return (
      <EventDialog
        key={event.id}
        event={event}
        onAlertAcknowledge={() => onAlertAcknowledge(event.id)}
        meetingAlertEnabled={meetingAlertEnabled}
      />
    );
  });
}
