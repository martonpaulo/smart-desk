export interface CalendarEvent {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string;
  allDay: boolean;
  calendarId: string | null;
  calendarColor: string | null;
  source: string | null;
}
