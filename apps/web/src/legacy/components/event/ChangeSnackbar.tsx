import { useEffect, useRef, useState } from 'react';

import { Typography } from '@mui/material';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import { useAlertSound } from 'src/legacy/hooks/useAlertSound';
import { useEventChanges } from 'src/legacy/hooks/useEventChanges';
import type { Event } from 'src/legacy/types/Event';
import { IAlertType } from 'src/legacy/types/IAlertType';
import { filterTodayEvents } from 'src/legacy/utils/eventUtils';
import { parseBold } from 'src/legacy/utils/textUtils';

interface ChangeSnackbarProps {
  events: Event[];
  eventChangesAlertEnabled: boolean;
}

const AUTO_HIDE_DURATION = 1000 * 20; // 20 seconds

export function ChangeSnackbar({ events, eventChangesAlertEnabled }: ChangeSnackbarProps) {
  const withoutFullDay = events.filter(e => !e.allDay);
  const todaysEvents = filterTodayEvents(withoutFullDay);

  const changes = useEventChanges(todaysEvents);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const { playAlert } = useAlertSound(IAlertType.UPDATE);

  const enabledRef = useRef(eventChangesAlertEnabled);
  enabledRef.current = eventChangesAlertEnabled;

  const playRef = useRef(playAlert);
  playRef.current = playAlert;

  useEffect(() => {
    if (!changes.length) return;
    // join with two newlines to create a blank line between items
    setMessage(changes.join('\n\n'));
    setOpen(true);
    if (enabledRef.current) playRef.current();
  }, [changes]);

  const handleClose = (_event: unknown, reason?: string) => {
    if (reason === 'clickaway') return;
    setOpen(false);
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={AUTO_HIDE_DURATION}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert onClose={handleClose} severity="info">
        {/* preserve line breaks */}
        <Typography sx={{ whiteSpace: 'pre-line' }}>{parseBold(message)}</Typography>
      </Alert>
    </Snackbar>
  );
}
