'use client';

import { Calendar } from 'react-big-calendar';
import { dateFnsLocalizer } from 'react-big-calendar';

import { format, getDay, parse, startOfWeek } from 'date-fns';
import { enUS } from 'date-fns/locale';

import { IEvent } from '@/types/IEvent';

import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: enUS }),
  getDay,
  locales: { 'en-US': enUS },
});

export type CalendarViewType = 'day' | 'week' | 'month';

interface BigCalendarProps {
  events: IEvent[];
  date: Date;
  view: CalendarViewType;
  onNavigate: (date: Date) => void;
  onViewChange: (view: CalendarViewType) => void;
}

export function BigCalendar({ events, date, view, onNavigate, onViewChange }: BigCalendarProps) {
  const mapped = events.map(ev => ({
    ...ev,
    start: new Date(ev.start),
    end: new Date(ev.end),
    title: ev.title,
  }));

  return (
    <Calendar
      localizer={localizer}
      events={mapped}
      startAccessor="start"
      endAccessor="end"
      date={date}
      view={view}
      onNavigate={onNavigate}
      onView={v => onViewChange(v as CalendarViewType)}
      style={{ height: '70vh' }}
    />
  );
}
