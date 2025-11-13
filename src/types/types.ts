// Base entity interface that all entities extend
export interface Base {
  id: string;
  trashed: boolean;
  updatedAt: Date;
  isSynced: boolean;
}

// Task entity interface
export interface Task extends Base {
  title: string;
  notes?: string | null;
  important: boolean;
  urgent: boolean;
  blocked: boolean;
  plannedDate?: Date | null;
  estimatedTime?: number | null; // in minutes
  quantityDone: number;
  quantityTarget: number;
  daily: boolean;
  position: number;
  classifiedDate?: Date | null;
  columnId: string;
  eventId?: string | null;
  tagId?: string | null;
}

// User interface for authentication
export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

// Authentication state interface
export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Task filters interface
export interface TaskFilters {
  status?: 'all' | 'active' | 'completed' | 'trashed';
  important?: boolean;
  urgent?: boolean;
  blocked?: boolean;
  daily?: boolean;
  tagId?: string | null;
}

// Task creation/update interfaces
export interface CreateTaskData {
  title: string;
  notes?: string | null;
  important?: boolean;
  urgent?: boolean;
  blocked?: boolean;
  plannedDate?: Date | null;
  estimatedTime?: number | null;
  quantityTarget?: number;
  daily?: boolean;
  columnId: string;
  eventId?: string | null;
  tagId?: string | null;
}

export interface UpdateTaskData extends Partial<CreateTaskData> {
  id: string;
}

// API response interfaces
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

// Navigation types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type MainTabParamList = {
  Tasks: undefined;
  Profile: undefined;
};
