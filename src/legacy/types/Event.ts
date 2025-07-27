import { ICalendar } from '@/legacy/types/ICalendar';

export interface Event {
  id: string;
  start: Date;
  end: Date;
  title: string;
  allDay?: boolean;
  description?: string;
  attendeeCount?: number;
  calendar?: ICalendar;
  acknowledged?: boolean;
  trashed?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
