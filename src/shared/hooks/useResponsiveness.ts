'use client';

import { useMediaQuery, useTheme } from '@mui/material';

export function useResponsiveness() {
  const theme = useTheme();

  return useMediaQuery(theme.breakpoints.down('mobileLg'), { noSsr: true });
}
