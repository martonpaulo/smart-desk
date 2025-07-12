export type TaskContext = 'online' | 'out' | 'AFK' | 'talk';

export interface Task {
  name: string; // Required
  quantityDone?: number; // Default: 0
  quantityTarget?: number; // Default: 1
  category?: string; // Select field (optional)
  notes?: string; // Optional text
  important: boolean; // Required
  urgent: boolean; // Required
  duration: number; // Required (in minutes)
  blocked?: boolean; // Default: false
  eod: boolean; // Required (true = must complete by end of day)
  context: TaskContext; // Required (execution context)
  zoneId: string; // Auto-calculated field (based on logic)
}
