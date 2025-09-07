import { Column } from 'src/legacy/types/column';
import { IcsCalendar } from 'src/legacy/types/icsCalendar';
import { RawColumn } from 'src/legacy/types/rawColumn';
import { RawIcsCalendar } from 'src/legacy/types/rawIcsCalendar';
import { RawTask } from 'src/legacy/types/rawTask';
import { Task } from 'src/legacy/types/task';

export function mapDBToColumn(rawColumn: RawColumn): Column {
  return {
    id: rawColumn.id,
    title: rawColumn.title,
    color: rawColumn.color,
    position: rawColumn.position,
    trashed: rawColumn.trashed,
    updatedAt: new Date(rawColumn.updated_at),
    createdAt: new Date(rawColumn.created_at),
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
    created_at: column.createdAt.toISOString(),
  };
}

export function mapDBToTask(rawTask: RawTask): Task {
  return {
    id: rawTask.id,
    title: rawTask.title,
    notes: rawTask.notes ?? undefined,
    important: rawTask.important,
    urgent: rawTask.urgent,
    blocked: rawTask.blocked ?? false,
    estimatedTime: rawTask.estimated_time ?? undefined,
    plannedDate: rawTask.planned_date ? new Date(rawTask.planned_date) : undefined,
    classifiedDate: rawTask.classified_date ? new Date(rawTask.classified_date) : undefined,
    quantityDone: rawTask.quantity_done,
    quantityTarget: rawTask.quantity_target,
    daily: rawTask.daily,
    position: rawTask.position,
    columnId: rawTask.column_id,
    tagId: rawTask.tag_id ?? undefined,
    eventId: rawTask.event_id ?? undefined,
    trashed: rawTask.trashed,
    updatedAt: new Date(rawTask.updated_at),
    isSynced: true,
    createdAt: new Date(rawTask.created_at),
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
    blocked: task.blocked ?? false,
    estimated_time: task.estimatedTime ?? null,
    planned_date: task.plannedDate ? task.plannedDate.toISOString() : null,
    classified_date: task.classifiedDate ? task.classifiedDate.toISOString() : null,
    quantity_done: task.quantityDone ?? 0,
    quantity_target: task.quantityTarget ?? 0,
    daily: task.daily ?? false,
    position: task.position,
    column_id: task.columnId,
    event_id: task.eventId ?? null,
    tag_id: task.tagId ?? null,
    trashed: task.trashed ?? false,
    updated_at: task.updatedAt.toISOString(),
    created_at: task.createdAt.toISOString(),
  };
}

export function mapDBToIcsCalendar(raw: RawIcsCalendar): IcsCalendar {
  return {
    id: raw.id,
    title: raw.title,
    source: raw.source,
    color: raw.color,
    updatedAt: new Date(raw.updated_at),
    createdAt: new Date(raw.created_at),
    trashed: raw.trashed,
    isSynced: true,
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
    created_at:
      calendar.createdAt instanceof Date
        ? calendar.createdAt.toISOString()
        : new Date().toISOString(),
    trashed: calendar.trashed ?? false,
  };
}
