'use client';

import { ReactNode } from 'react';

import { Stack } from '@mui/material';

type MetaRowProps = {
  opacity?: number;
  tagComp?: ReactNode;
  durationComp?: ReactNode;
  dateComp?: ReactNode;
};

export function MetaRow({ opacity = 1, tagComp, durationComp, dateComp }: MetaRowProps) {
  return (
    <Stack direction="row" alignItems="center" gap={0.5} sx={{ opacity }}>
      {tagComp}
      {durationComp}
      {dateComp}
    </Stack>
  );
}
