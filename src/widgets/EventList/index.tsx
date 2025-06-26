import { List } from '@mui/material';

import { IEvent } from '@/types/IEvent';
import {
  filterCurrentOrFutureEvents,
  filterNonFullDayEvents,
  filterTodayEvents,
  sortEventsByStart,
} from '@/utils/eventUtils';
import { EventListItem } from '@/widgets/EventList/EventListItem';

interface EventListProps {
  events: IEvent[] | null;
}

export function EventList({ events }: EventListProps) {
  if (!events) return null;

  const sortedByStart = sortEventsByStart(events);
  const withoutFullDay = filterNonFullDayEvents(sortedByStart);
  const todaysEvents = filterTodayEvents(withoutFullDay);
  const upcomingEvents = filterCurrentOrFutureEvents(todaysEvents);

  return (
    <List dense>
      {upcomingEvents.map(event => (
        <EventListItem key={event.id} event={event} />
      ))}
    </List>
  );
}
