import { useState } from 'react';

import { Add as AddIcon } from '@mui/icons-material';
import {
  alpha,
  Chip,
  darken,
  InputAdornment,
  List,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import { useResponsiveness } from '@/hooks/useResponsiveness';
import { useEventStore } from '@/store/eventStore';
import { showUndo } from '@/store/undoStore';
import { theme } from '@/styles/theme';
import { Event } from '@/types/Event';
import {
  filterCurrentOrFutureEvents,
  filterNonFullDayEvents,
  filterTodayEvents,
  sortEventsByStart,
} from '@/utils/eventUtils';
import { generateId } from '@/utils/idUtils';
import { EditEventModal } from '@/widgets/EventList/EditEventModal';
import { EventListItem } from '@/widgets/EventList/EventListItem';

export function EventList({ events }: { events: Event[] | null }) {
  const { isMobile } = useResponsiveness();

  const deleteEvent = useEventStore(s => s.deleteEvent);
  const addLocalEvent = useEventStore(s => s.addLocalEvent);
  const updateLocalEvent = useEventStore(s => s.updateLocalEvent);

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
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

  const columnColor = alpha(theme.palette.primary.light, 0.2);
  const darkenColor = alpha(theme.palette.primary.light, 0.4);

  return (
    <Stack
      width={isMobile ? '100%' : 250}
      borderRadius={1}
      p={1.5}
      sx={{
        boxShadow: `0 1px 3px ${alpha(darken(columnColor, 0.5), 0.1)}`,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: darkenColor,
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
        <Typography variant="h3" color="primary">
          Event List
        </Typography>

        {upcomingEvents && upcomingEvents.length > 0 && (
          <Chip
            label={upcomingEvents?.length}
            size="small"
            disabled
            sx={{
              '&.Mui-disabled': {
                opacity: 1,
              },
            }}
          />
        )}
      </Stack>

      <List dense disablePadding>
        {upcomingEvents.map(ev => (
          <EventListItem
            key={ev.id}
            event={ev}
            onClick={() => setSelectedEvent(ev)}
            color={columnColor}
          />
        ))}
      </List>

      <Stack direction="row" alignItems="center" spacing={0}>
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
                borderColor: columnColor,
              },
              '&:hover fieldset': {
                borderColor: columnColor,
              },
              '&.Mui-focused fieldset': {
                borderColor: columnColor,
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
