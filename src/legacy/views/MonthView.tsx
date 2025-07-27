'use client';

import { Grid, Typography } from '@mui/material';
import { eachDayOfInterval, endOfWeek, getDaysInMonth, startOfMonth, startOfWeek } from 'date-fns';

import { CalendarView } from '@/features/calendar/types/CalendarView';
import { MonthDayCard } from '@/legacy/components/calendar/MonthDayCard';
import { useEvents } from '@/legacy/hooks/useEvents';
import { weekDays } from '@/legacy/utils/timeUtils';

interface MonthViewProps {
  currentDate: Date;
  onNavigate: (date: Date, view: CalendarView) => void;
}

export function MonthView({ currentDate, onNavigate }: MonthViewProps) {
  // Get first day of the calendar grid
  const firstDayOfGrid = startOfWeek(startOfMonth(currentDate));

  // Get last day of the calendar grid
  const lastDayOfGrid = endOfWeek(
    new Date(currentDate.getFullYear(), currentDate.getMonth(), getDaysInMonth(currentDate)),
  );

  useEvents(firstDayOfGrid, lastDayOfGrid);

  // Generate all days in the calendar grid
  const calendarDays = eachDayOfInterval({
    start: firstDayOfGrid,
    end: lastDayOfGrid,
  });

  return (
    <Grid
      container
      columns={7}
      sx={{
        '--Grid-borderWidth': '1px',
        borderLeft: 'var(--Grid-borderWidth) solid',
        borderColor: 'divider',
        '& > div': {
          borderRight: 'var(--Grid-borderWidth) solid',
          borderBottom: 'var(--Grid-borderWidth) solid',
          borderColor: 'divider',
        },
      }}
    >
      {/* Week header */}
      {weekDays.map(day => (
        <Grid
          size={1}
          key={day}
          textAlign="center"
          padding={0.125}
          lineHeight={0}
          sx={{ backgroundColor: 'primary.main' }}
        >
          <Typography variant="caption" fontWeight="bold" color="primary.contrastText">
            {day}
          </Typography>
        </Grid>
      ))}

      {calendarDays.map(day => {
        return (
          <Grid size={1} key={day.toISOString()}>
            <MonthDayCard day={day} onNavigate={onNavigate} />
          </Grid>
        );
      })}
    </Grid>
  );
}
