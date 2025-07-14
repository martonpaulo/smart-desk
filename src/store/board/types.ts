import type { Column as BaseColumn } from '@/types/column';
import type { Task as BaseTask } from '@/types/task';

export interface BoardState {
  columns: SyncColumn[];
  tasks: SyncTask[];
  pendingColumns: SyncColumn[];
  pendingTasks: SyncTask[];

  addColumn(data: AddColumnData): Promise<string>;
  addTask(data: AddTaskData): Promise<string>;

  updateColumn(data: UpdateColumnData): Promise<void>;
  updateTask(data: UpdateTaskData): Promise<void>;

  syncPending(): Promise<void>;
  syncFromServer(): Promise<void>;
}

// Extend base types with a sync flag
export interface SyncColumn extends BaseColumn {
  isSynced: boolean;
}

export interface SyncTask extends BaseTask {
  isSynced: boolean;
}

export interface AddColumnData {
  title: string;
  color: string;
  position: number;
}

export interface AddTaskData {
  title: string;
  notes?: string;
  quantityTarget?: number;
  columnId?: string;
}

export interface UpdateColumnData {
  id: string;
  title?: string;
  color?: string;
  position?: number;
  trashed?: boolean;
}

export interface UpdateTaskData {
  id: string;
  title?: string;
  notes?: string;
  quantityDone?: number;
  quantityTarget?: number;
  position?: number;
  columnId?: string;
  trashed?: boolean;
}
