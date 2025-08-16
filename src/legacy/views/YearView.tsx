'use client';

import { Box, Paper, Typography, useTheme } from '@mui/material';

import { CalendarViewProps } from '@/legacy/components/calendar/CalendarViewContainer';
import { daysOfWeek } from '@/legacy/utils/calendarUtils';
import { useResponsiveness } from '@/shared/hooks/useResponsiveness';

export function YearView({ currentDate, onNavigateAction }: CalendarViewProps) {
  const theme = useTheme();
  const isMobile = useResponsiveness();

  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const handleMonthClick = (monthIndex: number) => {
    const newDate = new Date(currentDate.getFullYear(), monthIndex, 1);
    onNavigateAction(newDate, 'month');
  };

  const isCurrentMonth = (monthIndex: number) => {
    const today = new Date();
    return today.getFullYear() === currentDate.getFullYear() && today.getMonth() === monthIndex;
  };

  const generateMiniCalendar = (monthIndex: number) => {
    const firstDay = new Date(currentDate.getFullYear(), monthIndex, 1);
    const lastDay = new Date(currentDate.getFullYear(), monthIndex + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    for (let i = 0; i < 42; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      if (day > lastDay && day.getDate() > 7) break;
      days.push(day);
    }

    return days;
  };

  return (
    <Box sx={{ height: '100%', overflow: 'auto', p: 2 }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
          gap: 2,
          maxWidth: 1200,
          mx: 'auto',
        }}
      >
        {months.map((month, index) => {
          const miniCalendarDays = generateMiniCalendar(index);

          return (
            <Paper
              key={month}
              sx={{
                p: 2,
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: theme.shadows[4],
                },
                border: isCurrentMonth(index) ? 2 : 1,
                borderColor: isCurrentMonth(index) ? 'primary.main' : 'divider',
              }}
              onClick={() => handleMonthClick(index)}
            >
              {/* Month name */}
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  textAlign: 'center',
                  color: isCurrentMonth(index) ? 'primary.main' : 'text.primary',
                  fontWeight: isCurrentMonth(index) ? 600 : 500,
                }}
              >
                {month}
              </Typography>

              {/* Mini calendar */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  gap: 0.5,
                }}
              >
                {/* Week header */}
                {Object.entries(daysOfWeek).map(([key, value]) => (
                  <Typography
                    key={key}
                    variant="caption"
                    sx={{
                      textAlign: 'center',
                      color: 'text.secondary',
                      fontSize: '0.7rem',
                    }}
                  >
                    {value.narrow}
                  </Typography>
                ))}

                {/* Calendar days */}
                {miniCalendarDays.map(day => {
                  const isCurrentMonthDay = day.getMonth() === index;
                  const isToday =
                    day.getDate() === new Date().getDate() &&
                    day.getMonth() === new Date().getMonth() &&
                    day.getFullYear() === new Date().getFullYear();

                  return (
                    <Box
                      key={day.toISOString()}
                      sx={{
                        aspectRatio: '1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '50%',
                        backgroundColor: isToday ? 'primary.main' : 'transparent',
                        color: isToday
                          ? 'primary.contrastText'
                          : isCurrentMonthDay
                            ? 'text.primary'
                            : 'text.disabled',
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: '0.7rem',
                          fontWeight: isToday ? 600 : 400,
                        }}
                      >
                        {day.getDate()}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Paper>
          );
        })}
      </Box>
    </Box>
  );
}
