import { ReactNode } from 'react';

import CloseIcon from '@mui/icons-material/Close';
import { IconButton } from '@mui/material';
import { closeSnackbar, SnackbarProvider } from 'notistack';

interface SnackbarWrapperProviderProps {
  children: ReactNode;
}

export function SnackbarWrapperProvider({ children }: SnackbarWrapperProviderProps) {
  return (
    <SnackbarProvider
      maxSnack={3}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      action={snackbarId => (
        <IconButton onClick={() => closeSnackbar(snackbarId)} color="inherit" size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      )}
    >
      {children}
    </SnackbarProvider>
  );
}
