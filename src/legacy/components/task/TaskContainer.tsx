'use client';

import { Stack, StackProps, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';

type TaskContainerProps = StackProps & {
  color: string;
  selected?: boolean;
  isDragging?: boolean;
  dense?: boolean;
  hasDefaultWidth?: boolean;
};

export function TaskContainer({
  color,
  selected,
  isDragging,
  dense = false,
  hasDefaultWidth = true,
  children,
  sx,
  ...rest
}: TaskContainerProps) {
  const theme = useTheme();
  const surface = alpha(color, selected ? 0.25 : 0.15);
  const hoverSurface = alpha(color, selected ? 0.3 : 0.2);
  const shadow = `0 1px 3px ${alpha(color, 0.1)}`;
  const width = dense ? '100%' : '250px';

  return (
    <Stack
      direction="row"
      alignItems="center"
      gap={dense ? 0.75 : 0.5}
      sx={{
        borderRadius: theme.shape.borderRadiusSmall,
        position: 'relative',
        backgroundColor: surface,
        border: selected ? `2px solid ${theme.palette.primary.main}` : 'none',
        touchAction: 'none',
        cursor: isDragging ? 'grabbing' : 'grab',
        boxShadow: shadow,
        transition: theme.transitions.create(['background-color']),
        px: dense ? 2 : 1.5,
        py: 1.5,
        '&:hover': { backgroundColor: hoverSurface },
        '&:active': { cursor: 'grabbing' },
        // reveal action bar on hover for pointer users
        '&:hover .task-actions': { visibility: 'visible' },
        minHeight: dense ? '3.5rem' : 'auto',
        width: hasDefaultWidth ? width : undefined,
        ...sx,
      }}
      {...rest}
    >
      {children}
    </Stack>
  );
}
