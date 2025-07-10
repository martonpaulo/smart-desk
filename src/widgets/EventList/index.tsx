import { useState } from 'react';

import { Add as AddIcon } from '@mui/icons-material';
import { InputAdornment, List, Stack, TextField } from '@mui/material';

import { useEventStore } from '@/store/eventStore';
import { showUndo } from '@/store/undoStore';
import { theme } from '@/styles/theme';
import { IEvent } from '@/types/IEvent';
import {
  filterCurrentOrFutureEvents,
  filterNonFullDayEvents,
  filterTodayEvents,
  sortEventsByStart,
} from '@/utils/eventUtils';
import { generateId } from '@/utils/idUtils';
import { EditEventModal } from '@/widgets/EventList/EditEventModal';
import { EventListItem } from '@/widgets/EventList/EventListItem';

export function EventList({ events }: { events: IEvent[] | null }) {
  const deleteEvent = useEventStore(s => s.deleteEvent);
  const addLocalEvent = useEventStore(s => s.addLocalEvent);
  const updateLocalEvent = useEventStore(s => s.updateLocalEvent);

  const [selectedEvent, setSelectedEvent] = useState<IEvent | null>(null);
  const [title, setTitle] = useState('');

  const upcomingEvents = filterCurrentOrFutureEvents(
    filterTodayEvents(filterNonFullDayEvents(sortEventsByStart(events || []))),
  );

  const handleAdd = () => {
    const text = title.trim();
    if (!text) return;
    const start = new Date();
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    addLocalEvent({ id: generateId(), title: text, start, end });
    setTitle('');
  };

  const columnColor = theme.palette.grey[200];
  const lightenColor = theme.palette.grey[300];

  return (
    <Stack>
      <List dense disablePadding>
        {upcomingEvents.map(ev => (
          <EventListItem key={ev.id} event={ev} onClick={() => setSelectedEvent(ev)} />
        ))}
      </List>

      <Stack direction="row" alignItems="center" mt={upcomingEvents.length > 0 ? 1 : 0} spacing={0}>
        <TextField
          fullWidth
          size="small"
          placeholder="New event"
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') handleAdd();
          }}
          sx={{
            borderColor: columnColor,
            '& input': {
              cursor: 'pointer',
            },
            '& .MuiInputBase-root': {
              cursor: 'pointer',
              transition: 'background-color 0.15s',
              '&:hover': { backgroundColor: columnColor },
            },
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: lightenColor,
              },
              '&:hover fieldset': {
                borderColor: lightenColor,
              },
              '&.Mui-focused fieldset': {
                borderColor: lightenColor,
              },
            },
          }}
          slotProps={{
            input: {
              sx: theme => ({
                fontSize: theme.typography.body2.fontSize,
                lineHeight: theme.typography.body2.lineHeight,
                fontWeight: theme.typography.body2.fontWeight,
              }),
              startAdornment: (
                <InputAdornment position="start">
                  <AddIcon color="action" fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />
      </Stack>

      <EditEventModal
        open={!!selectedEvent}
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onDelete={id => {
          deleteEvent(id);
          showUndo('Event deleted', () => useEventStore.getState().restoreEvent(id));
        }}
        onSave={updateLocalEvent}
      />
    </Stack>
  );
}
