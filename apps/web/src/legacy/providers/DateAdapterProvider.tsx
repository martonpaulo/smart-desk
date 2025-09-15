'use client';

import React from 'react';

import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

interface DateAdapterProviderProps {
  children: React.ReactNode;
}

export function DateAdapterProvider({ children }: DateAdapterProviderProps) {
  return <LocalizationProvider dateAdapter={AdapterDateFns}>{children}</LocalizationProvider>;
}
