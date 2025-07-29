import { BaseType } from '@/core/types/BaseType';

export interface Event extends BaseType {
  startTime: Date;
  endTime: Date;
  summary: string;
  description: string;
  allDay: boolean;
  calendarId: string;
  acknowledged: boolean;
  recurrence: string[];
}
