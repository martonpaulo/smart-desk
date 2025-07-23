'use client';

import {
  Box,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
  useTheme,
} from '@mui/material';

import { useEventStore } from '@/store/eventStore';
import { Event } from '@/types/Event';

interface ScheduleViewProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onViewChange: (view: 'day' | 'week' | 'month' | 'year' | 'schedule') => void;
  onNavigate: (date: Date, view: 'day' | 'week' | 'month' | 'year' | 'schedule') => void;
}

export function ScheduleView({ onNavigate }: ScheduleViewProps) {
  const theme = useTheme();
  const events = useEventStore(state => state.events);

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  const nextMonth = new Date(today);
  nextMonth.setMonth(today.getMonth() + 1);

  const getFilteredEvents = () => {
    const sortedEvents = [...events].sort(
      (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
    );

    return sortedEvents.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate >= now;
    });
  };

  const filteredEvents = getFilteredEvents();

  const groupEventsByDate = (events: typeof filteredEvents) => {
    const groups: { [key: string]: typeof events } = {};

    events.forEach(event => {
      const eventDate = new Date(event.start);
      const dateKey = eventDate.toDateString();

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(event);
    });

    return groups;
  };

  const eventGroups = groupEventsByDate(filteredEvents);

  const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString);
    const isToday = date.toDateString() === today.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();

    if (isToday) return 'Today';
    if (isTomorrow) return 'Tomorrow';

    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  const getRelativeTime = (date: Date) => {
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `In ${diffDays} days`;
    if (diffDays < 30) return `In ${Math.ceil(diffDays / 7)} weeks`;
    return `In ${Math.ceil(diffDays / 30)} months`;
  };

  const handleEventClick = (event: Event) => {
    const eventDate = new Date(event.start);
    onNavigate(eventDate, 'day');
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Events list */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {Object.keys(eventGroups).length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              p: 4,
            }}
          >
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No events found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              No upcoming events
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {Object.entries(eventGroups).map(([dateString, dayEvents], index) => (
              <Box key={dateString}>
                {/* Date header */}
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
                    {formatDateHeader(dateString)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {getRelativeTime(new Date(dateString))}
                  </Typography>
                </Box>

                {/* Events for this date */}
                {dayEvents.map(event => (
                  <ListItem
                    key={event.id}
                    sx={{
                      py: 1,
                      px: 2,
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: theme.palette.action.hover,
                      },
                    }}
                    onClick={() => handleEventClick(event)}
                  >
                    <ListItemText
                      primary={
                        <>
                          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                            {event.title}
                          </Typography>
                          {event.allDay && (
                            <Chip
                              label="All day"
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: '0.7rem', height: 20 }}
                            />
                          )}
                        </>
                      }
                      secondary={
                        <>
                          {!event.allDay && (
                            <Typography variant="body2" color="text.secondary">
                              {new Date(event.start).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true,
                              })}
                              {event.end && (
                                <>
                                  {' - '}
                                  {new Date(event.end).toLocaleTimeString('en-US', {
                                    hour: 'numeric',
                                    minute: '2-digit',
                                    hour12: true,
                                  })}
                                </>
                              )}
                            </Typography>
                          )}
                          {event.description && (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                mt: 0.5,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                              }}
                            >
                              {event.description}
                            </Typography>
                          )}
                        </>
                      }
                    />
                  </ListItem>
                ))}

                {index < Object.keys(eventGroups).length - 1 && <Divider sx={{ my: 1 }} />}
              </Box>
            ))}
          </List>
        )}
      </Box>
    </Box>
  );
}
