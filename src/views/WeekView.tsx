'use client';

import { Box, Paper, Typography } from '@mui/material';

import { CalendarView } from '@/calendar/types/CalendarView';
import { EventCard } from '@/components/calendar/EventCard';
import { useResponsiveness } from '@/hooks/useResponsiveness';
import { useEventStore } from '@/store/eventStore';
import { theme } from '@/styles/theme';

interface WeekViewProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onViewChange: (view: CalendarView) => void;
  onNavigate: (date: Date, view: CalendarView) => void;
}

export function WeekView({ currentDate, onNavigate }: WeekViewProps) {
  const { isMobile } = useResponsiveness();
  const events = useEventStore(state => state.events);

  // Get the start of the week (Sunday)
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  // Generate the 7 days of the week
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    return day;
  });

  // Generate time slots (24 hours)
  const timeSlots = Array.from({ length: 24 }, (_, i) => i);

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

  const getEventsForDayAndHour = (day: Date, hour: number) => {
    const dayEvents = getEventsForDay(day);
    return dayEvents.filter(event => {
      if (event.allDay) return false;
      const eventStart = new Date(event.start);
      return eventStart.getHours() === hour;
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

  const isToday = (day: Date) => {
    const today = new Date();
    return (
      day.getDate() === today.getDate() &&
      day.getMonth() === today.getMonth() &&
      day.getFullYear() === today.getFullYear()
    );
  };

  const isCurrentHour = (hour: number) => {
    const now = new Date();
    return now.getHours() === hour;
  };

  const handleDayClick = (day: Date) => {
    onNavigate(day, 'day');
  };

  if (isMobile) {
    // Mobile: Show days vertically
    return (
      <Box sx={{ height: '100%', overflow: 'auto' }}>
        {weekDays.map(day => {
          const dayEvents = getEventsForDay(day);

          return (
            <Paper
              key={day.toISOString()}
              sx={{
                m: 1,
                p: 2,
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                },
                border: isToday(day) ? 2 : 1,
                borderColor: isToday(day) ? 'primary.main' : 'divider',
              }}
              onClick={() => handleDayClick(day)}
            >
              <Typography
                variant="h6"
                sx={{
                  mb: 1,
                  color: isToday(day) ? 'primary.main' : 'text.primary',
                  fontWeight: isToday(day) ? 600 : 500,
                }}
              >
                {day.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                })}
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {dayEvents.length > 0 ? (
                  dayEvents
                    .slice(0, 3)
                    .map(event => <EventCard key={event.id} event={event} compact />)
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No events
                  </Typography>
                )}
                {dayEvents.length > 3 && (
                  <Typography variant="caption" color="text.secondary">
                    +{dayEvents.length - 3} more events
                  </Typography>
                )}
              </Box>
            </Paper>
          );
        })}
      </Box>
    );
  }

  // Desktop: Show traditional week grid
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Week header */}
      <Box
        sx={{
          display: 'flex',
          borderBottom: 1,
          borderColor: 'divider',
          backgroundColor: theme.palette.grey[50],
        }}
      >
        <Box sx={{ width: 80, borderRight: 1, borderColor: 'divider' }} />
        {weekDays.map(day => (
          <Box
            key={day.toISOString()}
            sx={{
              flex: 1,
              p: 1,
              borderRight: 1,
              borderColor: 'divider',
              textAlign: 'center',
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
              },
              backgroundColor: isToday(day) ? theme.palette.primary.main + '08' : 'transparent',
            }}
            onClick={() => handleDayClick(day)}
          >
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                color: isToday(day) ? 'primary.main' : 'text.secondary',
                fontWeight: 500,
              }}
            >
              {day.toLocaleDateString('en-US', { weekday: 'short' })}
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: isToday(day) ? 'primary.main' : 'text.primary',
                fontWeight: isToday(day) ? 600 : 400,
              }}
            >
              {day.getDate()}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* All-day events row */}
      <Box
        sx={{
          display: 'flex',
          minHeight: 60,
          borderBottom: 1,
          borderColor: 'divider',
          backgroundColor: theme.palette.grey[50],
        }}
      >
        <Box
          sx={{
            width: 80,
            p: 1,
            borderRight: 1,
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
          }}
        >
          <Typography variant="caption" color="text.secondary">
            All day
          </Typography>
        </Box>
        {weekDays.map(day => {
          const allDayEvents = getEventsForDay(day).filter(event => event.allDay);

          return (
            <Box
              key={day.toISOString()}
              sx={{
                flex: 1,
                p: 0.5,
                borderRight: 1,
                borderColor: 'divider',
                display: 'flex',
                flexDirection: 'column',
                gap: 0.5,
              }}
            >
              {allDayEvents.map(event => (
                <EventCard key={event.id} event={event} compact />
              ))}
            </Box>
          );
        })}
      </Box>

      {/* Time grid */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {timeSlots.map(hour => (
          <Box
            key={hour}
            sx={{
              display: 'flex',
              minHeight: 60,
              borderBottom: 1,
              borderColor: 'divider',
              backgroundColor: isCurrentHour(hour)
                ? theme.palette.primary.main + '04'
                : 'transparent',
            }}
          >
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

            {weekDays.map(day => {
              const hourEvents = getEventsForDayAndHour(day, hour);

              return (
                <Box
                  key={day.toISOString()}
                  sx={{
                    flex: 1,
                    p: 0.5,
                    borderRight: 1,
                    borderColor: 'divider',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.5,
                  }}
                >
                  {hourEvents.map(event => (
                    <EventCard key={event.id} event={event} compact />
                  ))}
                </Box>
              );
            })}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
