import type { Column } from '@/types/column';
import type { Task } from '@/types/task';

export interface BoardState {
  columns: Column[];
  tasks: Task[];
  pendingColumns: Column[];
  pendingTasks: Task[];

  addColumn(data: AddColumnData): Promise<string>;
  addTask(data: AddTaskData): Promise<string>;

  updateColumn(data: UpdateColumnData): Promise<void>;
  updateTask(data: UpdateTaskData): Promise<void>;

  syncPending(): Promise<void>;
  syncFromServer(): Promise<void>;
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
