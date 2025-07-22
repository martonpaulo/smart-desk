'use client';

import { Box } from '@mui/material';

import type { CalendarView } from '@/app/calendar/[[...date]]/page';
import { DayView } from '@/components/calendar/views/DayView';
import { MonthView } from '@/components/calendar/views/MonthView';
import { ScheduleView } from '@/components/calendar/views/ScheduleView';
import { WeekView } from '@/components/calendar/views/WeekView';
import { YearView } from '@/components/calendar/views/YearView';

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
  const commonProps = {
    currentDate,
    onDateChange,
    onViewChange,
    onNavigate,
  };

  return (
    <Box sx={{ height: '100%', overflow: 'auto' }}>
      {currentView === 'day' && <DayView {...commonProps} />}
      {currentView === 'week' && <WeekView {...commonProps} />}
      {currentView === 'month' && <MonthView {...commonProps} />}
      {currentView === 'year' && <YearView {...commonProps} />}
      {currentView === 'schedule' && <ScheduleView {...commonProps} />}
    </Box>
  );
}
