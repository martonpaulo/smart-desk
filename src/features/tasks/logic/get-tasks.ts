import { db } from '@/db/powersync';
import type { Task } from '@/features/tasks/types/task';

interface TaskRow {
  id: string;
  title: string;
  completed: number | boolean;
  createdAt: string;
  updatedAt: string;
}

export async function getTasks(): Promise<Task[]> {
  try {
    const rows = await db.getAll<TaskRow>(
      'SELECT id, title, completed, createdAt, updatedAt FROM tasks ORDER BY updatedAt DESC',
    );

    return rows.map(row => ({
      id: row.id,
      title: row.title,
      completed: Boolean(row.completed),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }));
  } catch {
    return [];
  }
}
