'use client';

import { Stack } from '@mui/material';
import { CalendarView } from 'src/features/calendar/types/CalendarView';
import { DayView } from 'src/legacy/views/DayView';
import { MonthView } from 'src/legacy/views/MonthView';
import { ScheduleView } from 'src/legacy/views/ScheduleView';
import { WeekView } from 'src/legacy/views/WeekView';
import { YearView } from 'src/legacy/views/YearView';

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
