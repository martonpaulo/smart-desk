'use client';

import { ReactNode } from 'react';

import { ButtonGroup, Stack } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

type ActionsBarProps = {
  items: ReactNode[];
  showOnHover?: boolean;
  right?: boolean;
};

export function ActionsBar({ items, showOnHover = true, right = true }: ActionsBarProps) {
  const theme = useTheme();

  if (items.length === 0) return null;

  return (
    <Stack
      direction="row"
      className={showOnHover ? 'task-actions' : undefined}
      sx={{
        position: 'absolute',
        right: right ? 6 : 'auto',
        left: right ? 'auto' : 6,
        visibility: showOnHover ? 'hidden' : 'visible',
        zIndex: 2,
      }}
    >
      <ButtonGroup
        size="small"
        sx={{
          backgroundColor:
            theme.palette.mode === 'light'
              ? alpha(theme.palette.grey[100], 0.95)
              : alpha(theme.palette.background.paper, 0.95),
          '& .MuiButtonBase-root': {
            // keep buttons compact
            minWidth: 0,
          },
        }}
      >
        {items.map((node, idx) => (
          <Stack key={idx} component="span">
            {node}
          </Stack>
        ))}
      </ButtonGroup>
    </Stack>
  );
}
