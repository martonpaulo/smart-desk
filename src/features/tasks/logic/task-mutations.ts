import { db } from '@/db/powersync';
import { getTodayDateValue } from '@/features/tasks/logic/task-date';
import { serializeTaskTags } from '@/features/tasks/logic/task-tags';

const TASKS_TABLE = 'tasks';

export interface TaskPayload {
  title: string;
  description: string | null;
  tags: string[] | null;
  plannedDate: string;
}

interface TaskWritePayload extends TaskPayload {
  userId: string;
}

interface TaskUpdatePayload extends TaskWritePayload {
  id: string;
}

interface TaskDeletePayload {
  id: string;
  userId: string;
}

function getNowIso(): string {
  return new Date().toISOString();
}

function normalizeDescription(description: string | null): string | null {
  if (!description) {
    return null;
  }

  const trimmedDescription = description.trim();
  return trimmedDescription.length > 0 ? trimmedDescription : null;
}

function resolvePlannedDate(plannedDate: string): string {
  const trimmedPlannedDate = plannedDate.trim();
  return trimmedPlannedDate.length > 0 ? trimmedPlannedDate : getTodayDateValue();
}

export async function createTask(payload: TaskWritePayload): Promise<void> {
  const nowIso = getNowIso();
  await db.execute(
    `
      INSERT INTO ${TASKS_TABLE} (
        id,
        user_id,
        title,
        description,
        tags,
        planned_date,
        updated_at,
        deleted_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, NULL)
    `,
    [
      crypto.randomUUID(),
      payload.userId,
      payload.title,
      normalizeDescription(payload.description),
      serializeTaskTags(payload.tags),
      resolvePlannedDate(payload.plannedDate),
      nowIso,
    ],
  );
}

export async function updateTask(payload: TaskUpdatePayload): Promise<void> {
  const nowIso = getNowIso();
  await db.execute(
    `
      UPDATE ${TASKS_TABLE}
      SET
        title = ?,
        description = ?,
        tags = ?,
        planned_date = ?,
        updated_at = ?,
        deleted_at = NULL
      WHERE id = ? AND user_id = ?
    `,
    [
      payload.title,
      normalizeDescription(payload.description),
      serializeTaskTags(payload.tags),
      resolvePlannedDate(payload.plannedDate),
      nowIso,
      payload.id,
      payload.userId,
    ],
  );
}

export async function deleteTask(payload: TaskDeletePayload): Promise<void> {
  const nowIso = getNowIso();
  await db.execute(
    `
      UPDATE ${TASKS_TABLE}
      SET
        deleted_at = ?,
        updated_at = ?
      WHERE id = ? AND user_id = ?
    `,
    [nowIso, nowIso, payload.id, payload.userId],
  );
}
