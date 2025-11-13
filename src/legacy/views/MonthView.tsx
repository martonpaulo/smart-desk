'use client';

import { Grid, Typography } from '@mui/material';
import { eachDayOfInterval, endOfWeek, getDaysInMonth, startOfMonth, startOfWeek } from 'date-fns';

import { CalendarViewProps } from 'src/legacy/components/calendar/CalendarViewContainer';
import { MonthDayCard } from 'src/legacy/components/calendar/MonthDayCard';
import { weekDays } from 'src/legacy/utils/timeUtils';

export function MonthView({ currentDate, onNavigateAction }: CalendarViewProps) {
  // Get first day of the calendar grid
  const firstDayOfGrid = startOfWeek(startOfMonth(currentDate));

  // Get last day of the calendar grid
  const lastDayOfGrid = endOfWeek(
    new Date(currentDate.getFullYear(), currentDate.getMonth(), getDaysInMonth(currentDate)),
  );

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
            <MonthDayCard currentDate={day} onNavigateAction={onNavigateAction} />
          </Grid>
        );
      })}
    </Grid>
  );
}
