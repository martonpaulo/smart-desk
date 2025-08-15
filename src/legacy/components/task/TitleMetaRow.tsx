'use client';

import { ReactNode } from 'react';

import { Stack } from '@mui/material';

type MetaRowProps = {
  opacity?: number;
  tagComp?: ReactNode;
  durationComp?: ReactNode;
  separatorComp?: ReactNode;
  dateComp?: ReactNode;
};

export function MetaRow({
  opacity = 1,
  tagComp,
  durationComp,
  separatorComp,
  dateComp,
}: MetaRowProps) {
  return (
    <Stack direction="row" alignItems="center" gap={0.5} sx={{ opacity }}>
      {tagComp}
      {durationComp}
      {separatorComp}
      {dateComp}
    </Stack>
  );
}
