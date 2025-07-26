'use client';

import { Stack } from '@mui/material';

import { CalendarView } from '@/calendar/types/CalendarView';
import { useEvents } from '@/hooks/useEvents';
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
  useEvents();

  const commonProps = {
    currentDate,
    onDateChange,
    onViewChange,
    onNavigate,
  };

  return (
    <Stack>
      {currentView === 'day' && <DayView {...commonProps} />}
      {currentView === 'week' && <WeekView {...commonProps} />}
      {currentView === 'month' && <MonthView {...commonProps} />}
      {currentView === 'year' && <YearView {...commonProps} />}
      {currentView === 'schedule' && <ScheduleView {...commonProps} />}
    </Stack>
  );
}
