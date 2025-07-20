import { ICalendar } from '@/types/ICalendar';

export interface IEvent {
  id: string;
  start: Date;
  end: Date;
  title: string;
  attendeeCount?: number;
  calendar?: ICalendar;
  acknowledged?: boolean;
  trashed?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
