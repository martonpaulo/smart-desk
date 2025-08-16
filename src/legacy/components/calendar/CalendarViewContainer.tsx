'use client';

import { Stack } from '@mui/material';

import { CalendarView } from '@/features/calendar/types/CalendarView';
import { DayView } from '@/legacy/views/DayView';
import { MonthView } from '@/legacy/views/MonthView';
import { ScheduleView } from '@/legacy/views/ScheduleView';
import { WeekView } from '@/legacy/views/WeekView';
import { YearView } from '@/legacy/views/YearView';

export interface CalendarViewProps {
  currentDate: Date;
  currentView: CalendarView;
  onDateChangeAction: (date: Date) => void;
  onViewChangeAction: (view: CalendarView) => void;
  onNavigateAction: (date: Date, view: CalendarView) => void;
}

export function CalendarViewContainer(props: CalendarViewProps) {
  return (
    <Stack>
      {props.currentView === 'day' && <DayView {...props} />}
      {props.currentView === 'week' && <WeekView {...props} />}
      {props.currentView === 'month' && <MonthView {...props} />}
      {props.currentView === 'year' && <YearView {...props} />}
      {props.currentView === 'schedule' && <ScheduleView {...props} />}
    </Stack>
  );
}
