import { Column } from '@/types/column';
import { IcsCalendar } from '@/types/icsCalendar';
import { RawColumn } from '@/types/rawColumn';
import { RawIcsCalendar } from '@/types/rawIcsCalendar';
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
    isSynced: true,
  };
}

export function mapColumnToDB(column: Column, userId: string): RawColumn {
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
    important: rawTask.important,
    urgent: rawTask.urgent,
    quantityDone: rawTask.quantity_done,
    quantityTarget: rawTask.quantity_target,
    daily: rawTask.daily,
    position: rawTask.position,
    columnId: rawTask.column_id,
    trashed: rawTask.trashed,
    updatedAt: new Date(rawTask.updated_at),
    isSynced: true,
  };
}

export function mapTaskToDB(task: Task, userId: string): RawTask {
  return {
    id: task.id,
    user_id: userId,
    title: task.title,
    notes: task.notes ?? null,
    important: task.important ?? false,
    urgent: task.urgent ?? false,
    quantity_done: task.quantityDone ?? 0,
    quantity_target: task.quantityTarget ?? 0,
    daily: task.daily ?? false,
    position: task.position,
    column_id: task.columnId,
    trashed: task.trashed ?? false,
    updated_at: task.updatedAt.toISOString(),
  };
}

export function mapDBToIcsCalendar(raw: RawIcsCalendar): IcsCalendar {
  return {
    id: raw.id,
    title: raw.title,
    source: raw.source,
    color: raw.color,
    updatedAt: new Date(raw.updated_at),
  };
}

export function mapIcsCalendarToDB(calendar: IcsCalendar, userId: string): RawIcsCalendar {
  return {
    id: calendar.id,
    user_id: userId,
    title: calendar.title,
    source: calendar.source,
    color: calendar.color,
    updated_at: new Date().toISOString(),
  };
}
