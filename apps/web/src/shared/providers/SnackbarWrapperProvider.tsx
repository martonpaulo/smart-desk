import React from 'react';

import CloseIcon from '@mui/icons-material/Close';
import { IconButton } from '@mui/material';
import { closeSnackbar, SnackbarProvider } from 'notistack';

interface SnackbarWrapperProviderProps {
  children: React.ReactNode;
}

export function SnackbarWrapperProvider({ children }: SnackbarWrapperProviderProps) {
  return React.createElement(
    SnackbarProvider as React.ComponentType<Record<string, unknown>>,
    {
      maxSnack: 3,
      anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
      action: (snackbarId: string | number) => React.createElement(
        IconButton,
        { onClick: () => closeSnackbar(snackbarId), color: 'inherit', size: 'small' },
        React.createElement(CloseIcon, { fontSize: 'small' })
      )
    },
    children
  );
}
