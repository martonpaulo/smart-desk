import { Box, Typography, useTheme } from '@mui/material';

interface TimeIndicatorProps {
  position: number;
  time: string;
}

export function TimeIndicator({ position, time }: TimeIndicatorProps) {
  const { palette } = useTheme();

  return (
    <Box
      sx={{
        position: 'absolute',
        left: `${position}%`,
        top: 0,
        bottom: 0,
        zIndex: 10,
        width: 1,
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '0.1rem',
          bgcolor: palette.divider,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          top: 0,
          transform: 'translateX(-50%)',
          zIndex: 11,
        }}
      >
        <Typography variant="caption">{time}</Typography>
      </Box>
    </Box>
  );
}
