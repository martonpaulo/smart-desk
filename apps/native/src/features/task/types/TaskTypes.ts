import {
  Task,
  CreateTaskData,
  UpdateTaskData,
  TaskFilters,
} from '@smart-desk/types';

export interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  filters: TaskFilters;
}

export interface TaskStore extends TaskState {
  // CRUD operations
  addTask: (taskData: CreateTaskData) => Promise<void>;
  updateTask: (taskData: UpdateTaskData) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  toggleTaskComplete: (taskId: string) => Promise<void>;

  // Data fetching
  fetchTasks: () => Promise<void>;
  refreshTasks: () => Promise<void>;

  // Filtering
  setFilters: (filters: Partial<TaskFilters>) => void;
  clearFilters: () => void;

  // State management
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export interface TaskFormData {
  title: string;
  notes?: string;
  important: boolean;
  urgent: boolean;
  blocked: boolean;
  estimatedTime?: number;
  quantityTarget: number;
  daily: boolean;
}

export interface TaskModalProps {
  visible: boolean;
  onClose: () => void;
  task?: Task | null;
  onSave: (taskData: TaskFormData) => void;
}
