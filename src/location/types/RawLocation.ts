export interface RawLocation {
  id: string;
  user_id: string;
  type: 'city' | 'flight' | 'bus' | 'stay' | 'hidden';
  name: string;
  start_date: string;
  end_date: string;
  updated_at: string;
  created_at: string;
}
