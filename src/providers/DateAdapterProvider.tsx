'use client';

import { ReactNode } from 'react';

import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

interface DateAdapterProviderProps {
  children: ReactNode;
}

export function DateAdapterProvider({ children }: DateAdapterProviderProps) {
  return <LocalizationProvider dateAdapter={AdapterDateFns}>{children}</LocalizationProvider>;
}
