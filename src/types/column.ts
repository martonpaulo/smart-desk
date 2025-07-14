export interface Column {
  id: string;
  title: string;
  color: string;
  position: number;
  trashed?: boolean;
  updatedAt: Date;
  isSynced?: boolean;
}
