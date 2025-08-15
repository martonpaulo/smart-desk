import type { Column } from '@/legacy/types/column';
import type { Task } from '@/legacy/types/task';

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
  position?: number;
  updatedAt: Date;
}

export interface AddTaskData {
  title: string;
  notes?: string;
  important?: boolean;
  blocked?: boolean;
  plannedDate?: Date;
  estimatedTime?: number;
  quantityDone?: number;
  urgent?: boolean;
  quantityTarget?: number;
  daily?: boolean;
  classifiedDate?: Date;
  columnId?: string;
  tagId?: string;
  updatedAt: Date;
}

export interface UpdateColumnData {
  id: string;
  title?: string;
  color?: string;
  position?: number;
  trashed?: boolean;
  updatedAt: Date;
}

export interface UpdateTaskData {
  id: string;
  title?: string;
  notes?: string;
  important?: boolean;
  urgent?: boolean;
  blocked?: boolean;
  plannedDate?: Date;
  quantityDone?: number;
  quantityTarget?: number;
  estimatedTime?: number;
  daily?: boolean;
  position?: number;
  classifiedDate?: Date;
  columnId?: string;
  tagId?: string;
  trashed?: boolean;
  updatedAt: Date;
}
