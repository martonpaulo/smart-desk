import { RawBaseType } from '@/core/types/RawBaseType';

export interface RawTask extends RawBaseType {
  title: string;
  notes: string | null;
  important: boolean;
  urgent: boolean;
  blocked: boolean;
  estimated_time: number | null;
  planned_date: string | null;
  quantity_done: number;
  quantity_target: number;
  daily: boolean;
  position: number;
  column_id: string;
}
