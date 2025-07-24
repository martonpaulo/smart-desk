export interface Task {
  id: string;
  title: string;
  notes?: string;
  important: boolean;
  urgent: boolean;
  blocked: boolean;
  plannedDate?: Date;
  estimatedTime?: number; // in minutes
  quantityDone: number;
  quantityTarget: number;
  daily: boolean;
  position: number;
  columnId: string;
  trashed?: boolean;
  updatedAt: Date;
  isSynced?: boolean;
}
