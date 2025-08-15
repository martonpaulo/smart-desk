import { RawBase } from '@/core/types/Base';

export interface RawTask extends RawBase {
  title: string;
  notes: string | null;
  important: boolean;
  urgent: boolean;
  blocked: boolean;
  estimated_time: number | null;
  planned_date: string | null;
  classified_date: string | null;
  quantity_done: number;
  quantity_target: number;
  daily: boolean;
  position: number;
  column_id: string;
  tag_id: string | null;
}
