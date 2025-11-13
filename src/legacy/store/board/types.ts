import type { Column } from 'src/legacy/types/column';
import type { Task } from 'src/legacy/types/task';

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
  notes?: string | null;
  important?: boolean;
  blocked?: boolean;
  plannedDate?: Date | null;
  estimatedTime?: number | null;
  quantityDone?: number;
  urgent?: boolean;
  quantityTarget?: number;
  daily?: boolean;
  classifiedDate?: Date | null;
  columnId?: string;
  tagId?: string | null;
  eventId?: string | null;
  updatedAt: Date;
}

export interface UpdateTaskData {
  id: string;
  title?: string;
  notes?: string | null;
  important?: boolean;
  urgent?: boolean;
  blocked?: boolean;
  plannedDate?: Date | null;
  quantityDone?: number;
  quantityTarget?: number;
  estimatedTime?: number | null;
  daily?: boolean;
  position?: number;
  classifiedDate?: Date | null;
  columnId?: string;
  tagId?: string | null;
  eventId?: string | null;
  trashed?: boolean;
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
