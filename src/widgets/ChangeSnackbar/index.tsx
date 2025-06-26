import { SyntheticEvent, useEffect, useRef, useState } from 'react';

import { Typography } from '@mui/material';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';

import { useAlertSound } from '@/hooks/useAlertSound';
import { IAlertType } from '@/types/IAlertType';
import type { IEvent } from '@/types/IEvent';
import { filterNonFullDayEvents, filterTodayEvents } from '@/utils/eventUtils';
import { useEventChanges } from '@/widgets/ChangeSnackbar/useEventChanges';

interface ChangeSnackbarProps {
  events: IEvent[];
  eventChangesAlertEnabled: boolean;
}

const AUTO_HIDE_DURATION = 1000 * 20; // 20 seconds

export function ChangeSnackbar({ events, eventChangesAlertEnabled }: ChangeSnackbarProps) {
  const withoutFullDay = filterNonFullDayEvents(events);
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
    setMessage(changes.join('<br /><br />'));
    setOpen(true);
    if (enabledRef.current) playRef.current();
  }, [changes]);

  const handleClose = (_event: SyntheticEvent | Event, reason?: string) => {
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
        <Typography dangerouslySetInnerHTML={{ __html: message }} />
      </Alert>
    </Snackbar>
  );
}
