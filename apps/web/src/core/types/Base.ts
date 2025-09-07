export interface Base {
  id: string;
  trashed: boolean;
  updatedAt: Date;
  createdAt: Date;
  isSynced: boolean;
}

export interface RawBase {
  id: string;
  user_id: string;
  trashed: boolean;
  created_at: string;
  updated_at: string;
}
