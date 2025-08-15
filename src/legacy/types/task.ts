import { Base } from '@/core/types/Base';

export interface Task extends Base {
  title: string;
  notes?: string;
  important: boolean;
  urgent: boolean;
  blocked: boolean;
  plannedDate?: Date;
  estimatedTime?: number; // in minutes
  quantityDone: number;
  quantityTarget: number;
  daily: boolean;
  position: number;
  classifiedDate?: Date;
  columnId: string;
  eventId?: string;
  tagId?: string;
}
