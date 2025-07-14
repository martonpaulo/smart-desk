export interface Task {
  id: string;
  title: string;
  notes?: string;
  quantityDone: number;
  quantityTarget: number;
  position: number;
  columnId: string;
  trashed?: boolean;
  updatedAt: Date;
}
