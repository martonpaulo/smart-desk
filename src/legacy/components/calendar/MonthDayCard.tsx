import PlaceIcon from '@mui/icons-material/Place';
import { Paper, Stack, Typography, useTheme } from '@mui/material';

import { CalendarView } from '@/features/calendar/types/CalendarView';
import { MonthEventCard } from '@/legacy/components/calendar/MonthEventCard';
import { useEventStore } from '@/legacy/store/eventStore';
import { filterTodayEvents } from '@/legacy/utils/eventUtils';
import { isWeekday } from '@/legacy/utils/timeUtils';
import { useResponsiveness } from '@/shared/hooks/useResponsiveness';

interface MonthDayCardProps {
  day: Date;
  onNavigate: (date: Date, view: CalendarView) => void;
}

export function MonthDayCard({ day, onNavigate }: MonthDayCardProps) {
  const theme = useTheme();
  const { isMobile } = useResponsiveness();
  const events = useEventStore(state => state.events);
  const currentDate = new Date();

  const getEventsForDay = (day: Date) => filterTodayEvents(events, day);

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

  const getBackgroundColor = (day: Date) => {
    if (!isWeekday(day)) return theme.palette.grey[100];
    return 'background.paper';
  };

  const maxEventsToShow = isMobile ? 2 : 4;

  const dayEvents = getEventsForDay(day);

  const displayShowMore = (day: Date) => {
    const numEvents = getEventsForDay(day).length;
    if (numEvents === 0) return false;
    if (numEvents <= maxEventsToShow) return false;
    return true;
  };

  // find event with calendar name "Place" and return its title
  const placeEvent = dayEvents.find(event => event.calendar?.name === 'Place');
  const placeTitle = placeEvent ? placeEvent.title : '';

  return (
    <Paper
      sx={{
        padding: 0.5,
        gap: 0.25,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        height: 130,
        backgroundColor: getBackgroundColor(day),
        '&:hover': {
          backgroundColor: theme.palette.action.hover,
        },
        ...(isToday(day) && {
          borderColor: 'primary.main',
          borderWidth: 2,
        }),
      }}
      onClick={() => handleDayClick(day)}
    >
      {/* Day number */}
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography
          variant="caption"
          lineHeight={1}
          fontWeight={isToday(day) ? 'bold' : 'normal'}
          sx={{
            color: isCurrentMonth(day)
              ? isToday(day)
                ? 'primary.main'
                : 'text.primary'
              : 'text.secondary',
          }}
        >
          {day.getDate().toString().padStart(2, '0')}
        </Typography>

        <Stack direction="row" alignItems="center">
          <PlaceIcon
            color="primary"
            sx={{ fontSize: '0.75rem', marginLeft: 0.5, verticalAlign: 'middle' }}
          />
          <Typography variant="caption" color="primary">
            {placeTitle}
          </Typography>
        </Stack>
      </Stack>

      <Stack>
        {dayEvents.slice(0, maxEventsToShow).map(event => (
          <MonthEventCard key={event.id} event={event} />
        ))}
      </Stack>

      {displayShowMore(day) && (
        <Typography variant="caption" color="text.secondary" textAlign="end">
          +{dayEvents.length - maxEventsToShow} more
        </Typography>
      )}
    </Paper>
  );
}
