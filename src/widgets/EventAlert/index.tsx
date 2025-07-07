import { IEvent } from '@/types/IEvent';
import {
  calculateMinutesUntilEvent,
  computeEventStatus,
  filterCurrentOrFutureEvents,
  filterNonFullDayEvents,
  sortEventsByStart,
} from '@/utils/eventUtils';
import { EventDialog } from '@/widgets/EventAlert/EventDialog';

interface EventAlertProps {
  events: IEvent[] | null;
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

  const sortedByStart = sortEventsByStart(events);
  const withoutFullDay = filterNonFullDayEvents(sortedByStart);
  const upcomingEvents = filterCurrentOrFutureEvents(withoutFullDay);

  const eventsToShow = upcomingEvents.filter(event => {
    const now = new Date();
    const eventStatus = computeEventStatus(event, now);
    return (
      (eventStatus === 'current' ||
        (eventStatus === 'future' &&
          calculateMinutesUntilEvent(event, now) <= alertLeadTimeMinutes)) &&
      !event.aknowledged &&
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
