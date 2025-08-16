import { Paper, Stack, Typography, useTheme } from '@mui/material';
import { endOfDay, isSameMonth, isToday, startOfDay } from 'date-fns';

import { CalendarView } from '@/features/calendar/types/CalendarView';
import { LocationDayLabel } from '@/features/location/components/LocationDayLabel';
import { useLocationsByDate } from '@/features/location/hooks/useLocationsByDate';
import { MonthEventCard } from '@/legacy/components/calendar/MonthEventCard';
import { useCombinedEvents } from '@/legacy/hooks/useCombinedEvents';
import { isWeekday } from '@/legacy/utils/timeUtils';
import { useResponsiveness } from '@/shared/hooks/useResponsiveness';

interface MonthDayCardProps {
  currentDate: Date;
  onNavigateAction: (date: Date, view: CalendarView) => void;
}

export function MonthDayCard({ currentDate, onNavigateAction }: MonthDayCardProps) {
  const theme = useTheme();
  const isMobile = useResponsiveness();
  const { data: events } = useCombinedEvents(startOfDay(currentDate), endOfDay(currentDate));

  const { locations: dayLocations } = useLocationsByDate(currentDate);

  const handleDayClick = (day: Date) => {
    onNavigateAction(day, 'day');
  };

  const getBackgroundColor = (day: Date) => {
    if (!isWeekday(day)) return theme.palette.grey[100];
    return 'background.paper';
  };

  const maxEventsToShow = isMobile ? 2 : 4;

  const currentDateIsToday = isToday(currentDate);
  const displayShowMore = events.length > maxEventsToShow;

  return (
    <Paper
      sx={{
        padding: 0.5,
        gap: 0.25,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        height: 130,
        backgroundColor: getBackgroundColor(currentDate),
        '&:hover': {
          backgroundColor: theme.palette.action.hover,
        },
        ...(currentDateIsToday && {
          borderColor: 'primary.main',
          borderWidth: 2,
        }),
      }}
      onClick={() => handleDayClick(currentDate)}
    >
      {/* Day number */}
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography
          variant="caption"
          lineHeight={1}
          fontWeight={currentDateIsToday ? 'bold' : 'normal'}
          sx={{
            color: isSameMonth(currentDate, new Date())
              ? currentDateIsToday
                ? 'primary.main'
                : 'text.primary'
              : 'text.secondary',
          }}
        >
          {currentDate.getDate().toString().padStart(2, '0')}
        </Typography>

        <LocationDayLabel locations={dayLocations} />
      </Stack>

      <Stack>
        {events.slice(0, maxEventsToShow).map(event => (
          <MonthEventCard key={event.id} event={event} />
        ))}
      </Stack>

      {displayShowMore && (
        <Typography variant="caption" color="text.secondary" textAlign="end">
          +{events.length - maxEventsToShow} more
        </Typography>
      )}
    </Paper>
  );
}
