import { db } from '@/db/powersync';
import type { Task } from '@/features/tasks/types/task';
import { mapTaskRow, type TaskRow } from '@/features/tasks/types/task-row';

const TASKS_UI_LOG_PREFIX = '[tasks-ui]';
const TASKS_QUERY_TIMEOUT_MS = 5000;
const TASKS_TABLE = 'tasks';

function getTimeoutError(): Error {
  return new Error(`tasks query timeout after ${TASKS_QUERY_TIMEOUT_MS}ms`);
}

function getTasksQuery(): string {
  return `
    SELECT
      id,
      title,
      description,
      tags,
      planned_date AS "plannedDate",
      updated_at AS "updatedAt"
    FROM ${TASKS_TABLE}
    WHERE deleted_at IS NULL
    ORDER BY planned_date ASC, updated_at DESC
  `;
}

async function getTaskRows(): Promise<TaskRow[]> {
  const query = db.getAll<TaskRow>(getTasksQuery());

  let timeoutId: number | null = null;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = window.setTimeout(() => reject(getTimeoutError()), TASKS_QUERY_TIMEOUT_MS);
  });

  try {
    const rows = await Promise.race([query, timeout]);
    return rows;
  } finally {
    if (timeoutId !== null) {
      window.clearTimeout(timeoutId);
    }
  }
}

export async function getTasks(): Promise<Task[]> {
  try {
    const rows = await getTaskRows();
    return rows.map(mapTaskRow);
  } catch (error) {
    console.error(`${TASKS_UI_LOG_PREFIX} failed to request tasks`, error);
    return [];
  }
}
