import { Base } from 'src/core/types/Base';

export interface Task extends Base {
  title: string;
  notes?: string | null;
  important: boolean;
  urgent: boolean;
  blocked: boolean;
  plannedDate?: Date | null;
  estimatedTime?: number | null; // in minutes
  quantityDone: number;
  quantityTarget: number;
  daily: boolean;
  position: number;
  classifiedDate?: Date | null;
  columnId: string;
  eventId?: string | null;
  tagId?: string | null;
}
