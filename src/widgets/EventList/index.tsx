import { List, ListItem, ListItemText } from '@mui/material';
import { useEventStore } from '@/store/eventStore';

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
  const deleteEvent = useEventStore(state => state.deleteEvent);
  if (!events || events.length === 0) {
    return (
      <List dense sx={{ opacity: 0.5 }}>
        <ListItem>
          <ListItemText primary="É necessário conectar pelo menos uma agenda (Google ou ICS)." />
        </ListItem>
      </List>
    );
  }

  const sortedByStart = sortEventsByStart(events);
  const withoutFullDay = filterNonFullDayEvents(sortedByStart);
  const todaysEvents = filterTodayEvents(withoutFullDay);
  const upcomingEvents = filterCurrentOrFutureEvents(todaysEvents);

  return (
    <List dense>
      {upcomingEvents.map(event => (
        <EventListItem key={event.id} event={event} onDelete={deleteEvent} />
      ))}
    </List>
  );
}
