import { Box, Typography } from '@mui/material';

interface ClockProps {
  currentTime: Date;
}

export function Clock({ currentTime }: ClockProps) {
  const formattedTime = currentTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const formattedDate = currentTime.toLocaleDateString([], {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Box sx={{ textAlign: 'center' }}>
      <Typography variant="h1">{formattedTime}</Typography>
      <Typography variant="subtitle1">{formattedDate}</Typography>
    </Box>
  );
}
