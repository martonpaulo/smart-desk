import { Box, Divider, Typography, useTheme } from '@mui/material';

import { EventCard } from '@/components/calendar/EventCard';
import { Event } from '@/types/Event';

interface ScheduleDayProps {
  date: Date;
  events: Event[];
  onSelect: (event: Event) => void;
}

export function ScheduleDay({ date, events, onSelect }: ScheduleDayProps) {
  const theme = useTheme();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayOnly = new Date(date);
  dayOnly.setHours(0, 0, 0, 0);

  const heading = dayOnly.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: today.getFullYear() === dayOnly.getFullYear() ? undefined : 'numeric',
  });

  const relative = (() => {
    const diff = (dayOnly.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    if (diff === -1) return 'Yesterday';
    if (diff > 1 && diff < 7) return `In ${diff} days`;
    if (diff < -1 && diff > -7) return `${Math.abs(diff)} days ago`;
    return '';
  })();

  return (
    <Box>
      <Box
        sx={{
          p: 2,
          backgroundColor: theme.palette.grey[50],
          borderBottom: 1,
          borderColor: 'divider',
          position: 'sticky',
          top: 0,
          zIndex: 1,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {heading}
        </Typography>
        {relative && (
          <Typography variant="caption" color="text.secondary">
            {relative}
          </Typography>
        )}
      </Box>

      {events.map(event => (
        <EventCard key={event.id} event={event} compact onClick={() => onSelect(event)} />
      ))}

      {events.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
          No events
        </Typography>
      )}

      <Divider sx={{ my: 1 }} />
    </Box>
  );
}
