'use client';

import { Stack } from '@mui/material';

import { CalendarView } from '@/features/calendar/types/CalendarView';
import { useEvents } from '@/legacy/hooks/useEvents';
import { DayView } from '@/legacy/views/DayView';
import { MonthView } from '@/legacy/views/MonthView';
import { ScheduleView } from '@/legacy/views/ScheduleView';
import { WeekView } from '@/legacy/views/WeekView';
import { YearView } from '@/legacy/views/YearView';

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
