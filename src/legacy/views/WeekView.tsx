'use client';

import { useEffect, useRef, useState } from 'react';

import { Paper, Stack, Typography, useTheme } from '@mui/material';
import {
  addWeeks,
  eachDayOfInterval,
  endOfWeek,
  format,
  getHours,
  isSameDay,
  isSameHour,
  isToday,
  startOfDay,
  startOfHour,
  startOfWeek,
} from 'date-fns';

import type { CalendarViewProps } from '@/legacy/components/calendar/CalendarViewContainer';
import { EventCard } from '@/legacy/components/calendar/EventCard';
import { useCombinedEvents } from '@/legacy/hooks/useCombinedEvents';
import { useResponsiveness } from '@/shared/hooks/useResponsiveness';

const HOURS_IN_DAY = 24;
const WEEKS_PER_PAGE = 2; // number of extra weeks to fetch per "page" when scrolling
const GUTTER_WIDTH = 80; // left hour gutter width in px

export function WeekView({ currentDate, onNavigateAction }: CalendarViewProps) {
  const theme = useTheme();
  const isMobile = useResponsiveness();

  // Base week window derived from currentDate
  const rangeStart = startOfDay(startOfWeek(currentDate, { weekStartsOn: 0 }));
  const [rangeEnd, setRangeEnd] = useState<Date>(endOfWeek(currentDate, { weekStartsOn: 0 }));

  // Fetch events in window
  const { data: events = [], isLoading } = useCombinedEvents(rangeStart, rangeEnd);

  // Precompute current visible week days
  const weekDays = eachDayOfInterval({
    start: startOfWeek(currentDate, { weekStartsOn: 0 }),
    end: endOfWeek(currentDate, { weekStartsOn: 0 }),
  });

  // Helpers
  const getEventsForDay = (day: Date) => events.filter(ev => isSameDay(new Date(ev.start), day));

  const getEventsForDayAndHour = (day: Date, hour: number) => {
    const hourStart = startOfHour(new Date(day));
    hourStart.setHours(hour, 0, 0, 0);
    const dayEvents = getEventsForDay(day).filter(e => !e.allDay);
    return dayEvents.filter(e => isSameHour(new Date(e.start), hourStart));
  };

  const handleDayClick = (day: Date) => onNavigateAction(day, 'day');

  // Infinite scroll sentinel to extend rangeEnd by extra weeks
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting && !isLoadingMore) {
          setIsLoadingMore(true);
          setRangeEnd(prev => endOfWeek(addWeeks(prev, WEEKS_PER_PAGE), { weekStartsOn: 0 }));
        }
      },
      { root: null, rootMargin: '200px', threshold: 0 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [isLoadingMore]);

  useEffect(() => {
    if (!isLoading) setIsLoadingMore(false);
  }, [isLoading]);

  // --------- Mobile layout: days stacked vertically ---------
  if (isMobile) {
    return (
      <Stack sx={{ height: '100%', overflow: 'auto', width: '100%', maxWidth: '100%' }}>
        {weekDays.map(day => {
          const dayEvents = getEventsForDay(day);
          return (
            <Paper
              key={day.toISOString()}
              sx={{
                m: 1,
                p: 2,
                cursor: 'pointer',
                '&:hover': { backgroundColor: theme.palette.action.hover },
                border: isToday(day) ? 2 : 1,
                borderColor: isToday(day) ? 'primary.main' : 'divider',
                boxSizing: 'border-box',
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
                {format(day, 'EEEE, MMM d')}
              </Typography>

              <Stack spacing={1}>
                {dayEvents.length > 0 ? (
                  dayEvents.slice(0, 3).map(ev => <EventCard key={ev.id} event={ev} compact />)
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
              </Stack>
            </Paper>
          );
        })}

        {/* Infinite scroll sentinel */}
        <div ref={sentinelRef} />
        {(isLoading || isLoadingMore) && (
          <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
            Loading more…
          </Typography>
        )}
      </Stack>
    );
  }

  // --------- Desktop layout: CSS Grid to guarantee equal-width day columns ---------
  const nowHour = getHours(new Date());

  return (
    <Stack sx={{ height: '100%', width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
      {/* Week header as a single 8-column grid to prevent rounding drift */}
      <Stack
        sx={{
          display: 'grid',
          gridTemplateColumns: `${GUTTER_WIDTH}px repeat(7, 1fr)`,
          width: '100%',
          maxWidth: '100%',
          borderBottom: 1,
          borderColor: 'divider',
          backgroundColor: theme.palette.grey[50],
          boxSizing: 'border-box',
        }}
      >
        {/* Left gutter placeholder */}
        <Stack sx={{ minWidth: 0, borderRight: 1, borderColor: 'divider' }} />

        {/* Day headers */}
        {weekDays.map(day => (
          <Stack
            key={day.toISOString()}
            sx={{
              minWidth: 0,
              p: 1,
              textAlign: 'center',
              cursor: 'pointer',
              '&:hover': { backgroundColor: theme.palette.action.hover },
              backgroundColor: isToday(day) ? `${theme.palette.primary.main}14` : 'transparent',
              borderLeft: 1,
              borderColor: 'divider',
              boxSizing: 'border-box',
            }}
            onClick={() => handleDayClick(day)}
          >
            <Typography
              variant="caption"
              sx={{
                color: isToday(day) ? 'primary.main' : 'text.secondary',
                fontWeight: 500,
                lineHeight: 1.2,
              }}
            >
              {format(day, 'EEE')}
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: isToday(day) ? 'primary.main' : 'text.primary',
                fontWeight: isToday(day) ? 600 : 400,
                lineHeight: 1.2,
              }}
            >
              {format(day, 'd')}
            </Typography>
          </Stack>
        ))}
      </Stack>

      {/* All-day events row in the same 8-column grid */}
      <Stack
        sx={{
          display: 'grid',
          gridTemplateColumns: `${GUTTER_WIDTH}px repeat(7, 1fr)`,
          width: '100%',
          maxWidth: '100%',
          minHeight: 60,
          borderBottom: 1,
          borderColor: 'divider',
          backgroundColor: theme.palette.grey[50],
          boxSizing: 'border-box',
        }}
      >
        {/* All-day label cell */}
        <Stack
          sx={{
            p: 1,
            alignItems: 'center',
            justifyContent: 'flex-end',
            borderRight: 1,
            borderColor: 'divider',
            minWidth: 0,
            boxSizing: 'border-box',
          }}
        >
          <Typography variant="caption" color="text.secondary">
            All day
          </Typography>
        </Stack>

        {/* All-day columns */}
        {weekDays.map(day => {
          const allDayEvents = getEventsForDay(day).filter(ev => ev.allDay);
          return (
            <Stack
              key={day.toISOString()}
              sx={{
                p: 0.5,
                gap: 0.5,
                minWidth: 0,
                borderLeft: 1,
                borderColor: 'divider',
                boxSizing: 'border-box',
              }}
            >
              {allDayEvents.map(ev => (
                <EventCard key={ev.id} event={ev} compact />
              ))}
            </Stack>
          );
        })}
      </Stack>

      {/* Time grid: virtual vertical scroll, fixed 8-column grid per hour row */}
      <Stack sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', width: '100%' }}>
        {Array.from({ length: HOURS_IN_DAY }, (_, hour) => (
          <Stack
            key={hour}
            sx={{
              display: 'grid',
              gridTemplateColumns: `${GUTTER_WIDTH}px repeat(7, 1fr)`,
              width: '100%',
              maxWidth: '100%',
              minHeight: 60,
              borderBottom: 1,
              borderColor: 'divider',
              backgroundColor: nowHour === hour ? `${theme.palette.primary.main}0A` : 'transparent',
              boxSizing: 'border-box',
            }}
          >
            {/* Hour gutter */}
            <Stack
              sx={{
                p: 1,
                alignItems: 'flex-start',
                justifyContent: 'flex-end',
                borderRight: 1,
                borderColor: 'divider',
                minWidth: 0,
                boxSizing: 'border-box',
              }}
            >
              <Typography
                variant="caption"
                sx={{ color: 'text.secondary', fontWeight: nowHour === hour ? 600 : 400 }}
              >
                {format(startOfHour(new Date(2000, 0, 1, hour)), 'p')}
              </Typography>
            </Stack>

            {/* 7 equal day columns, guaranteed by grid */}
            {weekDays.map(day => {
              const hourEvents = getEventsForDayAndHour(day, hour);
              return (
                <Stack
                  key={day.toISOString()}
                  sx={{
                    p: 0.5,
                    gap: 0.5,
                    minWidth: 0,
                    borderLeft: 1,
                    borderColor: 'divider',
                    boxSizing: 'border-box',
                  }}
                >
                  {hourEvents.map(ev => (
                    <EventCard key={ev.id} event={ev} compact />
                  ))}
                </Stack>
              );
            })}
          </Stack>
        ))}

        {/* Infinite scroll sentinel */}
        <div ref={sentinelRef} />
        {(isLoading || isLoadingMore) && (
          <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
            Loading more…
          </Typography>
        )}
      </Stack>
    </Stack>
  );
}
