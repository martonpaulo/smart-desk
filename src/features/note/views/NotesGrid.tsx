'use client';

import { PropsWithChildren } from 'react';

import { Stack } from '@mui/material';

import { useResponsiveness } from '@/shared/hooks/useResponsiveness';

/**
 * Simple responsive grid using Stack wrapping
 *  - phones: 1 per row
 *  - small tablets: 2 per row
 *  - md and up: 3 per row
 */
export function NotesGrid({ children }: PropsWithChildren) {
  const isMobile = useResponsiveness();

  const basis = isMobile ? '100%' : 'calc(33.333% - 10.67px)';

  return (
    <Stack direction="row" flexWrap="wrap" gap={2} mb={2}>
      {Array.isArray(children)
        ? children.map((child, i) => (
            <Stack key={i} sx={{ flexBasis: basis, minWidth: 0 }}>
              {child}
            </Stack>
          ))
        : children}
    </Stack>
  );
}
