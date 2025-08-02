import { useState } from 'react';

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
import { useSnackbar } from 'notistack';

import { EventModal } from '@/features/event/components/EventModal';
import { useLocalEventsStore } from '@/features/event/store/LocalEventsStore';
import { Event as LocalEvent } from '@/features/event/types/Event';
import { EventListItem } from '@/legacy/components/event/EventListItem';
import { Event } from '@/legacy/types/Event';
import {
  filterCurrentOrFutureEvents,
  filterNonFullDayEvents,
  filterTodayEvents,
  sortEventsByStart,
} from '@/legacy/utils/eventUtils';
import { useResponsiveness } from '@/shared/hooks/useResponsiveness';
import { theme } from '@/theme';

export function EventList({ events }: { events: Event[] | null }) {
  const isMobile = useResponsiveness();

  const localEvents = useLocalEventsStore(s => s.items);
  const { enqueueSnackbar } = useSnackbar();

  const [editingEvent, setEditingEvent] = useState<LocalEvent | null>(null);
  const [newModalOpen, setNewModalOpen] = useState(false);

  const upcomingEvents = filterCurrentOrFutureEvents(
    filterTodayEvents(filterNonFullDayEvents(sortEventsByStart(events || []))),
  );

  const columnColor = alpha(theme.palette.primary.light, 0.2);
  const darkenColor = alpha(theme.palette.primary.light, 0.4);

  return (
    <Box sx={{ display: 'flex' }}>
      <Stack
        width={isMobile ? '100%' : 350}
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
              onClick={() => {
                const local = localEvents.find(le => le.id === ev.id);
                if (local) {
                  setEditingEvent(local);
                } else {
                  enqueueSnackbar("This event can't be edited", { variant: 'info' });
                }
              }}
              color={columnColor}
            />
          ))}
        </List>

        <Stack direction="row" alignItems="center" spacing={0}>
          <TextField
            fullWidth
            size="small"
            placeholder="New event"
            onClick={() => setNewModalOpen(true)}
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
                readOnly: true,
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

        <EventModal open={newModalOpen} onClose={() => setNewModalOpen(false)} />
        <EventModal
          open={!!editingEvent}
          onClose={() => setEditingEvent(null)}
          event={editingEvent ?? undefined}
        />
      </Stack>
    </Box>
  );
}
