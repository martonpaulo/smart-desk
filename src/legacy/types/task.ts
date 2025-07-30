import { BaseType } from '@/core/types/BaseType';

export interface Task extends BaseType {
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
  columnId: string;
  tagId?: string;
}
