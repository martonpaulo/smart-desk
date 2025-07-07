import { Button, List, ListItem, ListItemText, Stack, TextField } from '@mui/material';
import { useState } from 'react';

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
  const addLocalEvent = useEventStore(state => state.addLocalEvent);
  const [title, setTitle] = useState('');
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
    <>
      <List dense>
        {upcomingEvents.map(event => (
          <EventListItem key={event.id} event={event} onDelete={deleteEvent} />
        ))}
      </List>
      <Stack direction="row" spacing={1} mt={1}>
        <TextField
          size="small"
          label="New event"
          value={title}
          onChange={e => setTitle(e.target.value)}
          fullWidth
        />
        <Button
          variant="contained"
          onClick={() => {
            const text = title.trim();
            if (!text) return;
            const start = new Date();
            const end = new Date(start.getTime() + 60 * 60 * 1000);
            addLocalEvent({ id: `local-${Date.now()}`, title: text, start, end });
            setTitle('');
          }}
        >
          Add
        </Button>
      </Stack>
    </>
  );
}
