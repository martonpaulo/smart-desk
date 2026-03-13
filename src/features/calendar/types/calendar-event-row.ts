import type { CalendarEvent } from '@/features/calendar/types/calendar-event';

export interface CalendarEventRow {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string;
  allDay: number | boolean;
  calendarId: string | null;
  calendarColor: string | null;
  source: string | null;
}

export function mapCalendarEventRow(row: CalendarEventRow): CalendarEvent {
  return {
    id: row.id,
    title: row.title,
    startsAt: row.startsAt,
    endsAt: row.endsAt,
    allDay: Boolean(row.allDay),
    calendarId: row.calendarId,
    calendarColor: row.calendarColor,
    source: row.source,
  };
}
