import { parseStoredTaskTags } from '@/features/tasks/logic/task-tags';
import type { Task } from '@/features/tasks/types/task';

export interface TaskRow {
  id: string;
  title: string;
  description: string | null;
  tags: string | null;
  plannedDate: string;
  updatedAt: string;
}

export function mapTaskRow(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    tags: parseStoredTaskTags(row.tags),
    plannedDate: row.plannedDate,
    updatedAt: row.updatedAt,
  };
}
