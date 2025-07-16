export interface Task {
  id: string;
  title: string;
  notes?: string;
  quantityDone: number;
  quantityTarget: number;
  daily: boolean;
  position: number;
  columnId: string;
  trashed?: boolean;
  updatedAt: Date;
  isSynced?: boolean;
}
