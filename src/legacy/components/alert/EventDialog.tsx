'use client';

import { useState } from 'react';

import { Circle as StatusIcon } from '@mui/icons-material';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';

import { MinutesChip } from '@/legacy/components/MinutesChip';
import { useAlertSound } from '@/legacy/hooks/useAlertSound';
import type { Event } from '@/legacy/types/Event';
import { IAlertType } from '@/legacy/types/IAlertType';
import { formatEventTimeRange, getAttendeeCountLabel } from '@/legacy/utils/eventUtils';

interface EventDialogProps {
  event: Event | null;
  onAlertAcknowledge: () => void;
  meetingAlertEnabled: boolean;
}

export function EventDialog({ event, onAlertAcknowledge, meetingAlertEnabled }: EventDialogProps) {
  const [isOpen, setIsOpen] = useState(true);
  const { palette } = useTheme();
  const { playAlert } = useAlertSound(IAlertType.UPCOMING);

  if (!event) return null;

  if (meetingAlertEnabled) playAlert();

  const handleAlertAcknowledge = () => {
    setIsOpen(false);
    onAlertAcknowledge();
  };

  const handleClose = (_event: object, reason: string) => {
    // Prevent closing by clicking outside or pressing escape
    if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
      return;
    }
    handleAlertAcknowledge();
  };

  const chipColor = event.calendar?.color || palette.primary.main;

  const shouldDisplayAttendeeCount = event.attendeeCount !== undefined && event.attendeeCount > 0;

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      disableEscapeKeyDown
      fullScreen
      slotProps={{
        paper: {
          sx: {
            justifyContent: 'center',
          },
        },
      }}
    >
      <Stack justifyContent="center" spacing={4}>
        <DialogContent>
          <Stack alignItems="center" spacing={4} textAlign="center">
            <Stack direction="row" alignItems="center" justifyContent="center" gap={1}>
              <Typography variant="subtitle1">{formatEventTimeRange(event)}</Typography>
              <MinutesChip event={event} />
            </Stack>

            <Typography variant="h1">{event.title}</Typography>

            {event.calendar && (
              <Stack direction="row" alignItems="center" justifyContent="center" gap={1}>
                <StatusIcon sx={{ color: chipColor }} />
                <Typography>{event.calendar.name}</Typography>
              </Stack>
            )}

            {shouldDisplayAttendeeCount && <Typography>{getAttendeeCountLabel(event)}</Typography>}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'center' }}>
          <Button onClick={handleAlertAcknowledge} variant="contained" size="large" autoFocus>
            Acknowledge
          </Button>
        </DialogActions>
      </Stack>
    </Dialog>
  );
}
