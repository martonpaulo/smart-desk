'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import {
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import {
  addDays,
  compareAsc,
  format,
  isAfter,
  isSameDay,
  isToday,
  isTomorrow,
  startOfDay,
} from 'date-fns';

import type { CalendarViewProps } from '@/legacy/components/calendar/CalendarViewContainer';
import { useCombinedEvents } from '@/legacy/hooks/useCombinedEvents';
import type { Event } from '@/legacy/types/Event';

export function ScheduleView({ onNavigateAction }: CalendarViewProps) {
  const theme = useTheme();

  // Time range window grows as user scrolls. Start = now, End increases by PAGE_DAYS each load.
  const PAGE_DAYS = 14;
  const now = useMemo(() => new Date(), []);
  const [rangeStart] = useState<Date>(now);
  const [rangeEnd, setRangeEnd] = useState<Date>(addDays(now, PAGE_DAYS));
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Fetch events within the current time window
  const { data: rawEvents = [], isLoading } = useCombinedEvents(rangeStart, rangeEnd);

  // Keep only upcoming events, sort by start time
  const events: Event[] = useMemo(() => {
    const upcoming = rawEvents.filter(
      ev => isAfter(new Date(ev.start), now) || isSameDay(new Date(ev.start), now),
    );
    return upcoming.sort((a, b) => compareAsc(new Date(a.start), new Date(b.start)));
  }, [rawEvents, now]);

  // Group events by day key
  type DayKey = string; // ISO date for startOfDay
  const grouped: Record<DayKey, Event[]> = useMemo(() => {
    const map: Record<DayKey, Event[]> = {};
    for (const ev of events) {
      const d = startOfDay(new Date(ev.start));
      const key = d.toISOString();
      if (!map[key]) map[key] = [];
      map[key].push(ev);
    }
    return map;
  }, [events]);

  const dayEntries = useMemo(() => {
    // Keep chronological order of day groups
    return Object.entries(grouped).sort(([a], [b]) => compareAsc(new Date(a), new Date(b)));
  }, [grouped]);

  // Relative label using date-fns
  const relativeLabel = (date: Date): string => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    // Fallback to weekday + month + day. Year only if different from current.
    const sameYear = date.getFullYear() === now.getFullYear();
    return format(date, sameYear ? 'EEEE, MMMM d' : 'EEEE, MMMM d, yyyy');
  };

  // Navigate to day view on item click
  const handleEventClick = (ev: Event) => {
    onNavigateAction(new Date(ev.start), 'day');
  };

  // IntersectionObserver to extend the time window for infinite scroll
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      entries => {
        const first = entries[0];
        if (first?.isIntersecting && !isLoadingMore) {
          setIsLoadingMore(true);
          // Extend window by PAGE_DAYS
          setRangeEnd(prev => addDays(prev, PAGE_DAYS));
        }
      },
      { root: null, rootMargin: '200px', threshold: 0 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [isLoadingMore]);

  // Release "loading more" flag once new data arrives
  useEffect(() => {
    if (isLoading) return;
    setIsLoadingMore(false);
  }, [isLoading]);

  // Empty state
  const isEmpty = !isLoading && dayEntries.length === 0;

  return (
    <Stack sx={{ height: '100%', display: 'flex' }}>
      <Stack sx={{ flex: 1, overflow: 'auto' }}>
        {isEmpty ? (
          <Stack alignItems="center" justifyContent="center" sx={{ height: '100%', p: 4 }}>
            <Typography variant="h3" color="text.secondary" gutterBottom>
              No events found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              No upcoming events
            </Typography>
          </Stack>
        ) : (
          <List sx={{ p: 0 }}>
            {dayEntries.map(([dayKey, dayEvents], index) => {
              const date = new Date(dayKey);
              return (
                <Stack key={dayKey} component="section">
                  {/* Sticky date header */}
                  <Stack
                    sx={{
                      p: 2,
                      backgroundColor: theme.palette.background.paper,
                      borderBottom: 1,
                      borderColor: 'divider',
                      position: 'sticky',
                      top: 0,
                      zIndex: 1,
                    }}
                  >
                    <Typography variant="h3" sx={{ fontWeight: 600 }}>
                      {relativeLabel(date)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {format(date, 'PPP')}
                    </Typography>
                  </Stack>

                  {/* Events for this day */}
                  {dayEvents.map(ev => {
                    const start = new Date(ev.start);
                    const end = ev.end ? new Date(ev.end) : undefined;

                    return (
                      <ListItem
                        key={ev.id}
                        onClick={() => handleEventClick(ev)}
                        sx={{
                          py: 1,
                          px: 2,
                          cursor: 'pointer',
                          '&:hover': { backgroundColor: theme.palette.action.hover },
                        }}
                      >
                        <ListItemText
                          disableTypography
                          primary={
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                                {ev.title || 'Untitled Event'}
                              </Typography>
                              {ev.allDay && (
                                <Chip
                                  label="All day"
                                  size="small"
                                  variant="outlined"
                                  sx={{ height: 20 }}
                                />
                              )}
                            </Stack>
                          }
                          secondary={
                            <Stack spacing={0.5}>
                              {!ev.allDay && (
                                <Typography variant="body2" color="text.secondary">
                                  {format(start, 'p')}
                                  {end ? ` - ${format(end, 'p')}` : ''}
                                </Typography>
                              )}

                              {ev.description && (
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                  }}
                                >
                                  {ev.description}
                                </Typography>
                              )}
                            </Stack>
                          }
                        />
                      </ListItem>
                    );
                  })}

                  {index < dayEntries.length - 1 && <Divider sx={{ my: 1 }} />}
                </Stack>
              );
            })}

            {/* Infinite scroll sentinel */}
            <div ref={sentinelRef} />

            {/* Optional subtle loading row when extending window */}
            {(isLoading || isLoadingMore) && (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
                Loading more…
              </Typography>
            )}
          </List>
        )}
      </Stack>
    </Stack>
  );
}
