export interface RawTask {
  id: string;
  user_id: string;
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
  trashed: boolean;
  updated_at: string;
}
