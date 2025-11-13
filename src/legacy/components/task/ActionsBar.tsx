'use client';

import { ButtonGroup, Paper, Stack } from '@mui/material';
import Popper from '@mui/material/Popper';
import { alpha, useTheme } from '@mui/material/styles';

type ActionsBarProps = {
  items: React.ReactNode[];
  showOnHover?: boolean;
  asTooltip?: boolean;
  anchorEl?: HTMLElement | null;
  open?: boolean;
};

export function ActionsBar({
  items,
  showOnHover = true,
  asTooltip = false,
  anchorEl,
  open = false,
}: ActionsBarProps) {
  const theme = useTheme();

  if (items.length === 0) return null;

  // Shared button group styles
  const groupSx = {
    backgroundColor:
      theme.palette.mode === 'light'
        ? alpha(theme.palette.grey[100], 0.95)
        : alpha(theme.palette.background.paper, 0.95),
    '& .MuiButtonBase-root': {
      minWidth: 0, // compact buttons
    },
  } as const;

  // Tooltip-style with Popper, rendered in a portal and positioned like a tooltip
  if (asTooltip && anchorEl) {
    return (
      <Popper open={open} anchorEl={anchorEl} placement="bottom-end">
        <Paper elevation={2} sx={{ borderRadius: 1 }}>
          <ButtonGroup size="small" sx={groupSx}>
            {items.map((node, idx) => (
              <Stack key={idx} component="span">
                {node}
              </Stack>
            ))}
          </ButtonGroup>
        </Paper>
      </Popper>
    );
  }

  // Default in-card absolute positioning, unchanged
  return (
    <Stack
      direction="row"
      className={showOnHover ? 'task-actions' : undefined}
      sx={{
        position: 'absolute',
        right: 6,
        left: 'auto',
        visibility: showOnHover ? 'hidden' : 'visible',
        zIndex: 2,
      }}
    >
      <ButtonGroup size="small" sx={groupSx}>
        {items.map((node, idx) => (
          <Stack key={idx} component="span">
            {node}
          </Stack>
        ))}
      </ButtonGroup>
    </Stack>
  );
}
