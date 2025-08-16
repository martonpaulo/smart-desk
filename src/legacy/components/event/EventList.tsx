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
import { Event as LocalEvent } from '@/features/event/types/Event';
import { EventListItem } from '@/legacy/components/event/EventListItem';
import { useCombinedEvents } from '@/legacy/hooks/useCombinedEvents';
import { mapFromLegacyEvent } from '@/legacy/utils/eventLegacyMapper';
import { useResponsiveness } from '@/shared/hooks/useResponsiveness';
import { theme } from '@/theme';

export function EventList() {
  const isMobile = useResponsiveness();
  const { data: events } = useCombinedEvents();

  const { enqueueSnackbar } = useSnackbar();

  const [editingEvent, setEditingEvent] = useState<LocalEvent | null>(null);
  const [newModalOpen, setNewModalOpen] = useState(false);

  const filteredEvents = events.filter(e => !e.allDay);

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
