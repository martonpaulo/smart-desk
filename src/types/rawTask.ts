export interface RawTask {
  id: string;
  user_id: string;
  title: string;
  notes: string | null;
  quantity_done: number;
  quantity_target: number;
  position: number;
  column_id: string;
  trashed: boolean;
  updated_at: string;
}
