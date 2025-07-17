export interface RawTask {
  id: string;
  user_id: string;
  title: string;
  notes: string | null;
  important: boolean;
  urgent: boolean;
  quantity_done: number;
  quantity_target: number;
  daily: boolean;
  position: number;
  column_id: string;
  trashed: boolean;
  updated_at: string;
}
