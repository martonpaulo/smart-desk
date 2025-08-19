import { useEffect } from 'react';

import { Chip } from '@mui/material';
import { useSnackbar } from 'notistack';

import { useConnectionStore } from '@/core/store/useConnectionStore';

export function ConnectedChip() {
  const { enqueueSnackbar } = useSnackbar();

  const online = useConnectionStore(state => state.online);

  useEffect(() => {
    if (online) enqueueSnackbar('Back online. Syncing changes...', { variant: 'info' });
    else enqueueSnackbar("You're offline", { variant: 'warning' });
  }, [enqueueSnackbar, online]);

  return (
    <Chip
      variant="outlined"
      label={online ? 'Connected' : 'Offline'}
      color={online ? 'success' : 'default'}
    />
  );
}
