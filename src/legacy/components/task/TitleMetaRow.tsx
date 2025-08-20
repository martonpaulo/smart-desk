'use client';

import { ReactNode } from 'react';

import { Stack } from '@mui/material';

type MetaRowProps = {
  opacity?: number;
  tagComp?: ReactNode;
  durationComp?: ReactNode;
  separatorComp?: ReactNode;
  dateComp?: ReactNode;
  dense?: boolean;
};

export function MetaRow({
  opacity = 1,
  tagComp,
  durationComp,
  separatorComp,
  dateComp,
  dense = false,
}: MetaRowProps) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      gap={dense ? 0.25 : 0.5}
      minHeight={16}
      sx={{ opacity }}
    >
      {tagComp}
      {durationComp}
      {separatorComp}
      {dateComp}
    </Stack>
  );
}
