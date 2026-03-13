export type DayItemSource = 'google' | 'task';

export interface DayItem {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string;
  allDay: boolean;
  calendarId: string | null;
  calendarColor: string | null;
  source: DayItemSource | null;
  description: string | null;
  tags: string[] | null;
  plannedDate: string | null;
}
