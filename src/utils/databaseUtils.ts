import { Column } from '@/types/column';
import { RawColumn } from '@/types/rawColumn';
import { RawTask } from '@/types/rawTask';
import { Task } from '@/types/task';

export function mapDBToColumn(rawColumn: RawColumn): Column {
  return {
    id: rawColumn.id,
    title: rawColumn.title,
    color: rawColumn.color,
    position: rawColumn.position,
    trashed: rawColumn.trashed,
    updatedAt: new Date(rawColumn.updated_at),
  };
}

interface MapColumnToDBParams {
  column: Column;
  userId: string;
}

export function mapColumnToDB({ column, userId }: MapColumnToDBParams): RawColumn {
  return {
    id: column.id,
    user_id: userId,
    title: column.title,
    color: column.color,
    position: column.position,
    trashed: column.trashed ?? false,
    updated_at: column.updatedAt.toISOString(),
  };
}

export function mapDBToTask(rawTask: RawTask): Task {
  return {
    id: rawTask.id,
    title: rawTask.title,
    notes: rawTask.notes ?? undefined,
    quantityDone: rawTask.quantity_done,
    quantityTarget: rawTask.quantity_target,
    position: rawTask.position,
    columnId: rawTask.column_id,
    trashed: rawTask.trashed,
    updatedAt: new Date(rawTask.updated_at),
  };
}

interface MapTaskToDBParams {
  task: Task;
  userId: string;
}

export function mapTaskToDB({ task, userId }: MapTaskToDBParams): RawTask {
  return {
    id: task.id,
    user_id: userId,
    title: task.title,
    notes: task.notes ?? null,
    quantity_done: task.quantityDone ?? 0,
    quantity_target: task.quantityTarget ?? 0,
    position: task.position,
    column_id: task.columnId,
    trashed: task.trashed ?? false,
    updated_at: task.updatedAt.toISOString(),
  };
}
