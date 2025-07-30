import { TaskFilters } from '@/features/task/types/TaskFilters';

export const clearedFilters: TaskFilters = {
  title: null,
  important: null,
  urgent: null,
  blocked: null,
  plannedDate: null,
  done: null,
  daily: null,
  trashed: null,
  tagId: undefined,
};
