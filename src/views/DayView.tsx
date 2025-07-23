'use client';

import { Box, Paper, Typography, useTheme } from '@mui/material';

import { EventCard } from '@/components/calendar/EventCard';
import { useEventStore } from '@/store/eventStore';

interface DayViewProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onViewChange: (view: 'day' | 'week' | 'month' | 'year' | 'schedule') => void;
  onNavigate: (date: Date, view: 'day' | 'week' | 'month' | 'year' | 'schedule') => void;
}

export function DayView({ currentDate }: DayViewProps) {
  const theme = useTheme();
  const events = useEventStore(state => state.events);

  // Filter events for the current day
  const dayEvents = events.filter(event => {
    const eventDate = new Date(event.start);
    return (
      eventDate.getDate() === currentDate.getDate() &&
      eventDate.getMonth() === currentDate.getMonth() &&
      eventDate.getFullYear() === currentDate.getFullYear()
    );
  });

  // Generate time slots (24 hours)
  const timeSlots = Array.from({ length: 24 }, (_, i) => i);

  const getEventsForHour = (hour: number) => {
    return dayEvents.filter(event => {
      const eventStart = new Date(event.start);
      return eventStart.getHours() === hour && event.allDay !== true;
    });
  };

  const formatTime = (hour: number) => {
    const date = new Date();
    date.setHours(hour, 0, 0, 0);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      hour12: true,
    });
  };

  const isCurrentHour = (hour: number) => {
    const now = new Date();
    return (
      now.getDate() === currentDate.getDate() &&
      now.getMonth() === currentDate.getMonth() &&
      now.getFullYear() === currentDate.getFullYear() &&
      now.getHours() === hour
    );
  };

  return (
    <Box sx={{ height: '100%', overflow: 'auto' }}>
      {/* All-day events */}
      {dayEvents.some(event => event.allDay) && (
        <Paper
          sx={{
            p: 2,
            m: 1,
            backgroundColor: theme.palette.grey[50],
          }}
        >
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            All Day
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {dayEvents
              .filter(event => event.allDay)
              .map(event => (
                <EventCard key={event.id} event={event} compact />
              ))}
          </Box>
        </Paper>
      )}

      {/* Hourly time slots */}
      <Box sx={{ minHeight: '100%' }}>
        {timeSlots.map(hour => {
          const hourEvents = getEventsForHour(hour);

          return (
            <Box
              key={hour}
              sx={{
                display: 'flex',
                minHeight: 60,
                borderBottom: 1,
                borderColor: 'divider',
                backgroundColor: isCurrentHour(hour)
                  ? theme.palette.primary.main + '08'
                  : 'transparent',
              }}
            >
              {/* Time label */}
              <Box
                sx={{
                  width: 80,
                  p: 1,
                  borderRight: 1,
                  borderColor: 'divider',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-end',
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.secondary',
                    fontWeight: isCurrentHour(hour) ? 600 : 400,
                  }}
                >
                  {formatTime(hour)}
                </Typography>
              </Box>

              {/* Events for this hour */}
              <Box sx={{ flex: 1, p: 1 }}>
                {hourEvents.map(event => (
                  <EventCard key={event.id} event={event} compact />
                ))}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
