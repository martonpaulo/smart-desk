import type { StoreApi } from 'zustand';

import { defaultColumns } from '@/features/column/config/defaultColumns';
import { getSupabaseClient } from '@/legacy/lib/supabaseClient';
import { fetchColumns, upsertColumn } from '@/legacy/services/supabase/columnsService';
import { fetchTasks, upsertTask } from '@/legacy/services/supabase/tasksService';
import {
  AddColumnData,
  AddTaskData,
  BoardState,
  UpdateColumnData,
  UpdateTaskData,
} from '@/legacy/store/board/types';
import { Column } from '@/legacy/types/column';
import { Task } from '@/legacy/types/task';
import {
  getLastTaskPositionInColumn,
  getNewColumnPosition,
  mergeById,
} from '@/legacy/utils/boardHelpers';
import { RESET_TIME } from '@/legacy/utils/resetTime';
import { isTaskEmpty } from '@/legacy/utils/taskUtils';
import { theme } from '@/theme';

type Set = StoreApi<BoardState>['setState'];
type Get = StoreApi<BoardState>['getState'];

// adds a column with dynamic position
export async function addColumnAction(set: Set, get: Get, data: AddColumnData): Promise<string> {
  const shouldSyncColumn = !!data.title.trim();

  const columns = get().columns;
  const id = crypto.randomUUID();
  const position =
    typeof data.position === 'number' && data.position > 0
      ? data.position
      : getNewColumnPosition(columns);

  const newCol: Column = {
    id,
    title: data.title.trim(),
    color: data.color,
    position,
    trashed: false,
    updatedAt: data.updatedAt,
    createdAt: data.updatedAt,
    isSynced: shouldSyncColumn ? false : true,
  };

  set(state => ({
    columns: [...state.columns, newCol],
    pendingColumns: shouldSyncColumn ? [...state.pendingColumns, newCol] : state.pendingColumns,
  }));

  void get().syncPending();
  return id;
}

export async function addTaskAction(set: Set, get: Get, data: AddTaskData): Promise<string> {
  const shouldSyncTask = !isTaskEmpty({ ...data } as Task);

  let columnId = data.columnId;
  let columns = get().columns;

  if (columns.length === 0 || !columnId) {
    const existingDraft = columns.find(c => c.title === defaultColumns.draft.title);

    if (existingDraft) {
      if (existingDraft.trashed) {
        existingDraft.trashed = false;
        existingDraft.updatedAt = data.updatedAt;
        existingDraft.isSynced = shouldSyncTask ? false : true;

        set(state => ({
          columns: [...state.columns],
          pendingColumns: [...state.pendingColumns],
        }));
      }

      columnId = existingDraft.id;
    } else {
      const draft: Column = {
        id: crypto.randomUUID(),
        title: defaultColumns.draft.title,
        color: defaultColumns.draft.color,
        position: getNewColumnPosition(columns),
        trashed: false,
        updatedAt: data.updatedAt,
        createdAt: data.updatedAt,
        isSynced: shouldSyncTask ? false : true,
      };

      columnId = draft.id;

      set(state => ({
        columns: [...state.columns, draft],
        pendingColumns: [...state.pendingColumns, draft],
      }));
    }
  }

  columns = get().columns;
  const tasks = get().tasks;
  const nextPos = getLastTaskPositionInColumn(tasks, columnId) + 1;

  const newTask: Task = {
    id: crypto.randomUUID(),
    title: data.title.trim(),
    notes: (data.notes ?? '').trim(),
    important: data.important ?? false,
    urgent: data.urgent ?? false,
    blocked: data.blocked ?? false,
    estimatedTime: data.estimatedTime,
    plannedDate: data.plannedDate,
    classifiedDate: data.classifiedDate,
    quantityDone: 0,
    quantityTarget:
      typeof data.quantityTarget === 'number' && data.quantityTarget > 0 ? data.quantityTarget : 1,
    daily: data.daily ?? false,
    position: nextPos,
    columnId,
    tagId: data.tagId,
    eventId: data.eventId,
    trashed: false,
    updatedAt: data.updatedAt,
    createdAt: data.updatedAt,
    isSynced: shouldSyncTask ? false : true,
  };

  set(state => ({
    tasks: [...state.tasks, newTask],
    pendingTasks: shouldSyncTask ? [...state.pendingTasks, newTask] : state.pendingTasks,
  }));

  void get().syncPending();
  return newTask.id;
}

export async function syncPendingAction(set: Set, get: Get) {
  const client = getSupabaseClient();
  const { pendingColumns, pendingTasks } = get();

  // Run all column upserts concurrently and track failures
  const columnResults = await Promise.allSettled(
    pendingColumns.map(col => upsertColumn(client, col)),
  );

  // Run all task upserts concurrently and track failures
  const taskResults = await Promise.allSettled(pendingTasks.map(task => upsertTask(client, task)));

  set(state => {
    // start from the latest state to avoid dropping updates made during sync
    const updatedColumns = [...state.columns];
    const stillColumns: Column[] = [];

    columnResults.forEach((result, index) => {
      const original = pendingColumns[index];
      if (result.status === 'fulfilled') {
        const saved = result.value;
        const idx = updatedColumns.findIndex(c => c.id === saved.id);
        if (idx !== -1) {
          updatedColumns[idx] = { ...saved, isSynced: true };
        } else {
          updatedColumns.push({ ...saved, isSynced: true });
        }
      } else {
        stillColumns.push(original);
      }
    });

    const updatedTasks = [...state.tasks];
    const stillTasks: Task[] = [];

    taskResults.forEach((result, index) => {
      const original = pendingTasks[index];
      if (result.status === 'fulfilled') {
        const saved = result.value;
        const idx = updatedTasks.findIndex(t => t.id === saved.id);
        if (idx !== -1) {
          updatedTasks[idx] = { ...saved, isSynced: true };
        } else {
          updatedTasks.push({ ...saved, isSynced: true });
        }
      } else {
        stillTasks.push(original);
      }
    });

    // remove synced items from pending lists, keeping any new pending entries untouched
    const remainingPendingColumns = state.pendingColumns.filter(
      c => !pendingColumns.some(p => p.id === c.id),
    );
    const remainingPendingTasks = state.pendingTasks.filter(
      t => !pendingTasks.some(p => p.id === t.id),
    );

    return {
      columns: updatedColumns,
      tasks: updatedTasks,
      pendingColumns: [...remainingPendingColumns, ...stillColumns],
      pendingTasks: [...remainingPendingTasks, ...stillTasks],
    };
  });
}

export async function syncFromServerAction(set: Set, get: Get) {
  const client = getSupabaseClient();
  try {
    const [remoteCols, remoteTasks] = await Promise.all([fetchColumns(client), fetchTasks(client)]);

    const localCols = get().columns;
    const localTasks = get().tasks;
    const now = new Date();

    // merge columns and flag sync state
    const mergedColsBase = mergeById(localCols, remoteCols);
    const mergedCols: Column[] = mergedColsBase.map(c => {
      const local = localCols.find(l => l.id === c.id);
      return { ...c, isSynced: !local || c.updatedAt >= local.updatedAt };
    });

    // merge tasks and flag sync state
    const mergedTasksBase = mergeById(
      localTasks.map(t => ({ ...t, updatedAt: t.updatedAt })),
      remoteTasks,
    );
    const mergedTasks: Task[] = mergedTasksBase.map(t => {
      const local = localTasks.find(l => l.id === t.id);
      return { ...t, isSynced: !local || t.updatedAt >= local.updatedAt };
    });

    // find tasks that need resetting
    const tasksToReset = mergedTasks.filter(
      t => t.daily && !t.blocked && !t.trashed && new Date(t.updatedAt) < RESET_TIME.last,
    );

    const finalCols = mergedCols;
    let finalTasks: Task[];

    if (tasksToReset.length > 0) {
      // ensure Draft exists or restore it
      let draftCol = finalCols.find(c => c.title === 'Draft');
      if (draftCol) {
        if (draftCol.trashed) {
          draftCol.trashed = false;
          draftCol.updatedAt = now;
          draftCol.isSynced = false;
        }
      } else {
        draftCol = {
          id: crypto.randomUUID(),
          title: 'Draft',
          color: theme.palette.primary.main,
          position: getNewColumnPosition(finalCols),
          trashed: false,
          updatedAt: now,
          createdAt: now,
          isSynced: false,
        };
        finalCols.push(draftCol);
      }

      // apply reset to qualifying tasks
      finalTasks = mergedTasks.map(task => {
        if (task.daily && new Date(task.updatedAt) < RESET_TIME.last) {
          return {
            ...task,
            quantityDone: 0,
            blocked: false,
            trashed: false,
            plannedDate: new Date(),
            columnId: draftCol!.id,
            updatedAt: now,
            isSynced: false,
          };
        }
        return task;
      });
    } else {
      // no resets needed
      finalTasks = mergedTasks;
    }

    // commit updated state
    set({
      columns: finalCols,
      tasks: finalTasks,
      pendingColumns: finalCols.filter(c => !c.isSynced),
      pendingTasks: finalTasks.filter(t => !t.isSynced),
    });
  } catch (err) {
    console.error('syncFromServer failed', err);
  }
}

export async function updateColumnAction(set: Set, get: Get, data: UpdateColumnData) {
  if (!get().columns.some(c => c.id === data.id)) {
    console.warn(`updateColumnAction: column ${data.id} not found`);
    return;
  }

  set(state => {
    let updated: Column | undefined;

    const columns = state.columns.map(c => {
      if (c.id !== data.id) return c;
      updated = {
        ...c,
        title: typeof data.title === 'string' ? data.title.trim() : c.title,
        color: data.color ?? c.color,
        position: typeof data.position === 'number' ? data.position : c.position,
        trashed: data.trashed ?? c.trashed,
        updatedAt: data.updatedAt,
        isSynced: false,
      };
      return updated;
    });

    const pendingColumns = updated
      ? [...state.pendingColumns.filter(c => c.id !== data.id), updated]
      : state.pendingColumns;

    return { columns, pendingColumns };
  });

  await get().syncPending();
}

export async function updateTaskAction(set: Set, get: Get, data: UpdateTaskData) {
  if (!get().tasks.some(t => t.id === data.id)) {
    console.warn(`updateTaskAction: task ${data.id} not found`);
    return;
  }

  set(state => {
    let updated: Task | undefined;

    const tasks = state.tasks.map(t => {
      if (t.id !== data.id) return t;
      updated = {
        ...t,
        title: typeof data.title === 'string' ? data.title.trim() : t.title,
        notes: typeof data.notes === 'string' ? data.notes.trim() : t.notes,
        important: data.important ?? t.important,
        urgent: data.urgent ?? t.urgent,
        blocked: data.blocked ?? t.blocked,
        estimatedTime: Object.prototype.hasOwnProperty.call(data, 'estimatedTime')
          ? (data.estimatedTime ?? null)
          : t.estimatedTime,
        plannedDate: Object.prototype.hasOwnProperty.call(data, 'plannedDate')
          ? (data.plannedDate ?? null)
          : t.plannedDate,
        classifiedDate: Object.prototype.hasOwnProperty.call(data, 'classifiedDate')
          ? (data.classifiedDate ?? null)
          : t.classifiedDate,
        quantityDone: data.quantityDone ?? t.quantityDone,
        quantityTarget:
          typeof data.quantityTarget === 'number' ? data.quantityTarget : t.quantityTarget,
        daily: data.daily ?? t.daily,
        position: typeof data.position === 'number' ? data.position : t.position,
        columnId: data.columnId ?? t.columnId,
        tagId: Object.prototype.hasOwnProperty.call(data, 'tagId') ? (data.tagId ?? null) : t.tagId,
        eventId: Object.prototype.hasOwnProperty.call(data, 'eventId')
          ? (data.eventId ?? null)
          : t.eventId,
        trashed: data.trashed ?? t.trashed,
        updatedAt: data.updatedAt,
        isSynced: false,
      };
      return updated;
    });

    const pendingTasks = updated
      ? [...state.pendingTasks.filter(t => t.id !== data.id), updated]
      : state.pendingTasks;

    return { tasks, pendingTasks };
  });

  await get().syncPending();
}
