'use client';

import { useMediaQuery, useTheme } from '@mui/material';

export function useResponsiveness() {
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down('mobileLg'), { noSsr: true });

  return { isMobile };
}
