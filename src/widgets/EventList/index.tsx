import { useState } from 'react';

import { Button, List, Stack, TextField } from '@mui/material';

import { useEventStore } from '@/store/eventStore';
import { IEvent } from '@/types/IEvent';
import {
  filterCurrentOrFutureEvents,
  filterNonFullDayEvents,
  filterTodayEvents,
  sortEventsByStart,
} from '@/utils/eventUtils';
import { EventListItem } from '@/widgets/EventList/EventListItem';
import { generateId } from '@/utils/idUtils';

interface EventListProps {
  events: IEvent[] | null;
}

export function EventList({ events }: EventListProps) {
  const deleteEvent = useEventStore(state => state.deleteEvent);
  const addLocalEvent = useEventStore(state => state.addLocalEvent);
  const [title, setTitle] = useState('');

  const sortedByStart = sortEventsByStart(events || []);
  const withoutFullDay = filterNonFullDayEvents(sortedByStart);
  const todaysEvents = filterTodayEvents(withoutFullDay);
  const upcomingEvents = filterCurrentOrFutureEvents(todaysEvents);

  return (
    <Stack>
      <List dense disablePadding>
        {upcomingEvents.map(event => (
          <EventListItem key={event.id} event={event} onDelete={deleteEvent} />
        ))}
      </List>
      <Stack direction="row" spacing={1} mt={upcomingEvents.length > 0 ? 1 : 0}>
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
            addLocalEvent({ id: generateId(), title: text, start, end });
            setTitle('');
          }}
        >
          Add
        </Button>
      </Stack>
    </Stack>
  );
}
