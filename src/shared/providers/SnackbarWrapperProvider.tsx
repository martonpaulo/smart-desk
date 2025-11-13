import CloseIcon from '@mui/icons-material/Close';
import { IconButton } from '@mui/material';
import { closeSnackbar, SnackbarProvider } from 'notistack';
import type { ReactNode } from 'react';

interface SnackbarWrapperProviderProps {
  children: ReactNode;
}

export function SnackbarWrapperProvider({ children }: SnackbarWrapperProviderProps) {
  const action = (snackbarId: string | number) => (
    <IconButton onClick={() => closeSnackbar(snackbarId)} color="inherit" size="small">
      <CloseIcon fontSize="small" />
    </IconButton>
  );

  return (
    <SnackbarProvider
      maxSnack={3}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      action={action}
    >
      {children}
    </SnackbarProvider>
  );
}
