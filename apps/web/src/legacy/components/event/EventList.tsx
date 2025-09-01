import { useMemo, useState } from 'react';

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
import { useSnackbar } from 'notistack';
import { EventModal } from 'src/features/event/components/EventModal';
import { Event as LocalEvent } from 'src/features/event/types/Event';
import { EventListItem } from 'src/legacy/components/event/EventListItem';
import { useCombinedEvents } from 'src/legacy/hooks/useCombinedEvents';
import { mapFromLegacyEvent } from 'src/legacy/utils/eventLegacyMapper';
import { useCurrentTime } from 'src/shared/hooks/useCurrentTime';
import { useResponsiveness } from 'src/shared/hooks/useResponsiveness';
import { theme } from 'src/theme';

export function EventList() {
  const isMobile = useResponsiveness();
  const { data: events } = useCombinedEvents();

  const { enqueueSnackbar } = useSnackbar();

  const now = useCurrentTime();

  const [editingEvent, setEditingEvent] = useState<LocalEvent | null>(null);
  const [newModalOpen, setNewModalOpen] = useState(false);

  const filteredEvents = useMemo(
    () => (events ?? []).filter(e => !e.allDay && new Date(e.end) >= now),
    [events, now],
  );

  const columnColor = alpha(theme.palette.primary.light, 0.2);
  const darkenColor = alpha(theme.palette.primary.light, 0.4);

  return (
    <Stack
      borderRadius={1}
      flexGrow={1}
      p={1.5}
      sx={{
        boxShadow: `0 1px 3px ${alpha(darken(columnColor, 0.5), 0.1)}`,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: darkenColor,
      }}
    >
      {!isMobile && (
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
          <Typography variant="h3" color="primary">
            Event List
          </Typography>

          {filteredEvents && filteredEvents.length > 0 && (
            <Chip
              label={filteredEvents?.length}
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
      )}

      <List dense disablePadding>
        {filteredEvents.map(ev => (
          <EventListItem
            key={ev.id}
            event={ev}
            onClick={() => {
              if (ev.source === 'local') {
                setEditingEvent(mapFromLegacyEvent(ev));
              } else {
                enqueueSnackbar("This event can't be edited", { variant: 'info' });
              }
            }}
            color={columnColor}
          />
        ))}

        {isMobile && !filteredEvents.length && (
          <Typography variant="body2" color="text.secondary">
            No upcoming events
          </Typography>
        )}
      </List>

      {!isMobile && (
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
      )}

      <EventModal open={newModalOpen} onClose={() => setNewModalOpen(false)} />
      <EventModal
        open={!!editingEvent}
        onClose={() => setEditingEvent(null)}
        event={editingEvent ?? undefined}
      />
    </Stack>
  );
}
