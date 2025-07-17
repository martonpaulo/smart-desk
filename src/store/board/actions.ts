import type { StoreApi } from 'zustand';

import { getSupabaseClient } from '@/lib/supabaseClient';
import { fetchColumns, upsertColumn } from '@/services/supabase/columnsService';
import { fetchTasks, upsertTask } from '@/services/supabase/tasksService';
import {
  AddColumnData,
  AddTaskData,
  BoardState,
  UpdateColumnData,
  UpdateTaskData,
} from '@/store/board/types';
import { theme } from '@/styles/theme';
import { Column } from '@/types/column';
import { Task } from '@/types/task';
import { getLastTaskPositionInColumn, getNewColumnPosition, mergeById } from '@/utils/boardHelpers';
import { RESET_TIME } from '@/utils/resetTime';

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
  const shouldSyncTask = !!(data.title.trim() || (data.notes && data.notes.trim()));

  let columns = get().columns;

  if (columns.length === 0) {
    const draft: Column = {
      id: crypto.randomUUID(),
      title: 'Draft',
      color: theme.palette.primary.main,
      position: getNewColumnPosition(columns),
      trashed: false,
      updatedAt: data.updatedAt,
      isSynced: shouldSyncTask ? false : true,
    };
    set(state => ({
      columns: [...state.columns, draft],
      pendingColumns: [...state.pendingColumns, draft],
    }));
    columns = get().columns;
  }

  const tasks = get().tasks;
  const sorted = [...columns].sort((a, b) => a.position - b.position);
  const targetId = data.columnId ?? sorted[0].id;
  const nextPos = getLastTaskPositionInColumn(tasks, targetId) + 1;

  const newTask: Task = {
    id: crypto.randomUUID(),
    title: data.title.trim(),
    notes: (data.notes ?? '').trim(),
    quantityDone: 0,
    quantityTarget:
      typeof data.quantityTarget === 'number' && data.quantityTarget > 0 ? data.quantityTarget : 1,
    daily: data.daily ?? false,
    position: nextPos,
    columnId: targetId,
    trashed: false,
    updatedAt: data.updatedAt,
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

  const currentColumns = get().columns;
  const updatedColumns = [...currentColumns];
  const stillColumns: Column[] = [];

  columnResults.forEach((result, index) => {
    const original = pendingColumns[index];
    if (result.status === 'fulfilled') {
      const saved = result.value;
      const idx = updatedColumns.findIndex(c => c.id === saved.id);
      if (idx !== -1) {
        updatedColumns[idx] = { ...saved, isSynced: true };
      }
    } else {
      stillColumns.push(original);
    }
  });

  // Run all task upserts concurrently and track failures
  const taskResults = await Promise.allSettled(pendingTasks.map(task => upsertTask(client, task)));

  const currentTasks = get().tasks;
  const updatedTasks = [...currentTasks];
  const stillTasks: Task[] = [];

  taskResults.forEach((result, index) => {
    const original = pendingTasks[index];
    if (result.status === 'fulfilled') {
      const saved = result.value;
      const idx = updatedTasks.findIndex(t => t.id === saved.id);
      if (idx !== -1) {
        updatedTasks[idx] = { ...saved, isSynced: true };
      }
    } else {
      stillTasks.push(original);
    }
  });

  // Persist all updates in a single state change
  set({
    columns: updatedColumns,
    tasks: updatedTasks,
    pendingColumns: stillColumns,
    pendingTasks: stillTasks,
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

    // compute last reset threshold
    const [H, M] = RESET_TIME.split(':').map(Number);
    const todayReset = new Date(now.getFullYear(), now.getMonth(), now.getDate(), H, M, 0);
    const lastReset =
      now < todayReset
        ? new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, H, M, 0)
        : todayReset;

    // find tasks that need resetting
    const tasksToReset = mergedTasks.filter(t => t.daily && new Date(t.updatedAt) < lastReset);

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
          isSynced: false,
        };
        finalCols.push(draftCol);
      }

      // apply reset to qualifying tasks
      finalTasks = mergedTasks.map(task => {
        if (task.daily && new Date(task.updatedAt) < lastReset) {
          return {
            ...task,
            quantityDone: 0,
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
        quantityDone: data.quantityDone ?? t.quantityDone,
        quantityTarget:
          typeof data.quantityTarget === 'number' ? data.quantityTarget : t.quantityTarget,
        daily: data.daily ?? t.daily,
        position: typeof data.position === 'number' ? data.position : t.position,
        columnId: data.columnId ?? t.columnId,
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
