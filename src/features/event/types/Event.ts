import { Base } from 'src/core/types/Base';

export interface Event extends Base {
  startTime: Date;
  endTime: Date;
  summary: string;
  description?: string;
  allDay: boolean;
  // calendarId?: string;
  acknowledged: boolean;
  // recurrence?: string[];
}
