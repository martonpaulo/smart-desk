'use client';

import { Box } from '@mui/material';

import type { CalendarView } from '@/app/calendar/[[...date]]/page';
import { useEvents } from '@/hooks/useEvents';
import { endOfDay, monthRange, startOfDay, weekRange } from '@/utils/dateRange';
import { DayView } from '@/views/DayView';
import { MonthView } from '@/views/MonthView';
import { ScheduleView } from '@/views/ScheduleView';
import { WeekView } from '@/views/WeekView';
import { YearView } from '@/views/YearView';

interface CalendarViewContainerProps {
  currentDate: Date;
  currentView: CalendarView;
  onDateChange: (date: Date) => void;
  onViewChange: (view: CalendarView) => void;
  onNavigate: (date: Date, view: CalendarView) => void;
}

export function CalendarViewContainer({
  currentDate,
  currentView,
  onDateChange,
  onViewChange,
  onNavigate,
}: CalendarViewContainerProps) {
  let rangeStart: Date | undefined;
  let rangeEnd: Date | undefined;

  switch (currentView) {
    case 'day':
      rangeStart = startOfDay(currentDate);
      rangeEnd = endOfDay(currentDate);
      break;
    case 'week': {
      const range = weekRange(currentDate);
      rangeStart = range.start;
      rangeEnd = range.end;
      break;
    }
    case 'month': {
      const range = monthRange(currentDate);
      rangeStart = range.start;
      rangeEnd = range.end;
      break;
    }
    default:
      break;
  }

  const { isLoading } = useEvents(rangeStart, rangeEnd);

  const commonProps = {
    currentDate,
    onDateChange,
    onViewChange,
    onNavigate,
  };

  return (
    <Box sx={{ height: '100%', overflow: 'auto', position: 'relative' }}>
      {isLoading && (
        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
          <Box sx={{ height: 2, bgcolor: 'primary.main', opacity: 0.3 }} />
        </Box>
      )}
      {currentView === 'day' && <DayView {...commonProps} />}
      {currentView === 'week' && <WeekView {...commonProps} />}
      {currentView === 'month' && <MonthView {...commonProps} />}
      {currentView === 'year' && <YearView {...commonProps} />}
      {currentView === 'schedule' && <ScheduleView {...commonProps} />}
    </Box>
  );
}
