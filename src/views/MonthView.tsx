'use client';

import { Box, Paper, Typography, useTheme } from '@mui/material';

import { EventCard } from '@/components/calendar/EventCard';
import { useResponsiveness } from '@/hooks/useResponsiveness';
import { useEventStore } from '@/store/eventStore';

interface MonthViewProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onViewChange: (view: 'day' | 'week' | 'month' | 'year' | 'schedule') => void;
  onNavigate: (date: Date, view: 'day' | 'week' | 'month' | 'year' | 'schedule') => void;
}

export function MonthView({ currentDate, onNavigate }: MonthViewProps) {
  const theme = useTheme();
  const { isMobile } = useResponsiveness();
  const events = useEventStore(state => state.events);

  // Get the first day of the month
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

  // Get the first day of the calendar grid (might be from previous month)
  const startDate = new Date(firstDayOfMonth);
  startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay());

  // Generate 42 days (6 weeks) for the calendar grid
  const calendarDays = Array.from({ length: 42 }, (_, i) => {
    const day = new Date(startDate);
    day.setDate(startDate.getDate() + i);
    return day;
  });

  const getEventsForDay = (day: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start);
      return (
        eventDate.getDate() === day.getDate() &&
        eventDate.getMonth() === day.getMonth() &&
        eventDate.getFullYear() === day.getFullYear()
      );
    });
  };

  const isToday = (day: Date) => {
    const today = new Date();
    return (
      day.getDate() === today.getDate() &&
      day.getMonth() === today.getMonth() &&
      day.getFullYear() === today.getFullYear()
    );
  };

  const isCurrentMonth = (day: Date) => {
    return day.getMonth() === currentDate.getMonth();
  };

  const handleDayClick = (day: Date) => {
    onNavigate(day, 'day');
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Week header */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          borderBottom: 1,
          borderColor: 'divider',
          backgroundColor: theme.palette.grey[50],
        }}
      >
        {weekDays.map(day => (
          <Box
            key={day}
            sx={{
              p: 1,
              textAlign: 'center',
              borderRight: 1,
              borderColor: 'divider',
              '&:last-child': {
                borderRight: 0,
              },
            }}
          >
            <Typography variant="subtitle2" color="text.secondary">
              {day}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Calendar grid */}
      <Box
        sx={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gridTemplateRows: 'repeat(6, 1fr)',
        }}
      >
        {calendarDays.map(day => {
          const dayEvents = getEventsForDay(day);
          const maxEventsToShow = isMobile ? 2 : 3;

          return (
            <Paper
              key={day.toISOString()}
              sx={{
                border: 1,
                borderColor: 'divider',
                borderRadius: 0,
                p: 0.5,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                minHeight: isMobile ? 80 : 120,
                backgroundColor: isCurrentMonth(day) ? 'background.paper' : theme.palette.grey[50],
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                },
                ...(isToday(day) && {
                  backgroundColor: theme.palette.primary.main + '08',
                  borderColor: 'primary.main',
                  borderWidth: 2,
                }),
              }}
              onClick={() => handleDayClick(day)}
            >
              {/* Day number */}
              <Typography
                variant={isMobile ? 'caption' : 'body2'}
                sx={{
                  fontWeight: isToday(day) ? 600 : 400,
                  color: isCurrentMonth(day)
                    ? isToday(day)
                      ? 'primary.main'
                      : 'text.primary'
                    : 'text.secondary',
                  mb: 0.5,
                }}
              >
                {day.getDate()}
              </Typography>

              {/* Events */}
              <Box sx={{ flex: 1, overflow: 'hidden' }}>
                {dayEvents.slice(0, maxEventsToShow).map(event => (
                  <EventCard key={event.id} event={event} compact minimal={isMobile} />
                ))}

                {dayEvents.length > maxEventsToShow && (
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      fontSize: isMobile ? '0.6rem' : '0.75rem',
                    }}
                  >
                    +{dayEvents.length - maxEventsToShow} more
                  </Typography>
                )}
              </Box>
            </Paper>
          );
        })}
      </Box>
    </Box>
  );
}
