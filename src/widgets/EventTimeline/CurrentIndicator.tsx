import { Box, useTheme } from '@mui/material';

interface CurrentIndicatorProps {
  position: number;
}

export function CurrentIndicator({ position }: CurrentIndicatorProps) {
  const { palette } = useTheme();

  return (
    <Box
      sx={{
        position: 'absolute',
        left: `${position}%`,
        top: 0,
        bottom: 0,
        width: '0.125rem',
        bgcolor: palette.error.main,
        zIndex: 10,
      }}
    />
  );
}
