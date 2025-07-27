import { useEffect, useRef, useState } from 'react';

import { Add as AddIcon } from '@mui/icons-material';
import {
  alpha,
  Box,
  Chip,
  darken,
  InputAdornment,
  List,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import { EditEventModal } from '@/legacy/components/event/EditEventModal';
import { EventListItem } from '@/legacy/components/event/EventListItem';
import { useEventListPrefsStore } from '@/legacy/store/eventListPrefsStore';
import { useEventStore } from '@/legacy/store/eventStore';
import { showUndo } from '@/legacy/store/undoStore';
import { Event } from '@/legacy/types/Event';
import {
  filterCurrentOrFutureEvents,
  filterNonFullDayEvents,
  filterTodayEvents,
  sortEventsByStart,
} from '@/legacy/utils/eventUtils';
import { generateId } from '@/legacy/utils/idUtils';
import { useResponsiveness } from '@/shared/hooks/useResponsiveness';
import { theme } from '@/theme';

export function EventList({ events }: { events: Event[] | null }) {
  const { isMobile } = useResponsiveness();
  const storedWidth = useEventListPrefsStore(state => state.width);
  const setStoredWidth = useEventListPrefsStore(state => state.setWidth);
  const [width, setWidth] = useState(storedWidth);
  const startX = useRef(0);
  const startWidth = useRef(0);

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

  const onMouseMove = (e: MouseEvent) => {
    const delta = e.clientX - startX.current;
    const newWidth = Math.max(200, startWidth.current + delta);
    setWidth(newWidth);
  };

  const stopResize = (e: MouseEvent) => {
    const delta = e.clientX - startX.current;
    const finalWidth = Math.max(200, startWidth.current + delta);
    setWidth(finalWidth);
    setStoredWidth(finalWidth);
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', stopResize);
  };

  const startResize = (e: React.MouseEvent<HTMLDivElement>) => {
    startX.current = e.clientX;
    startWidth.current = width;
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', stopResize);
  };

  useEffect(() => {
    setWidth(storedWidth);
  }, [storedWidth]);

  return (
    <Box sx={{ display: 'flex' }}>
      <Stack
        width={isMobile ? '100%' : width}
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
      {!isMobile && (
        <Box
          onMouseDown={startResize}
          sx={{
            width: theme => theme.spacing(0.5),
            cursor: 'col-resize',
            ml: 0.5,
            userSelect: 'none',
          }}
        />
      )}
    </Box>
  );
}
