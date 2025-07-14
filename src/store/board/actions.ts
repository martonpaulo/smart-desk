import type { StoreApi } from 'zustand';

import { getSupabaseClient } from '@/lib/supabaseClient';
import { fetchColumns, upsertColumn } from '@/services/supabase/columnsService';
import { fetchTasks, upsertTask } from '@/services/supabase/tasksService';
import {
  AddColumnData,
  AddTaskData,
  BoardState,
  SyncColumn,
  SyncTask,
  UpdateColumnData,
  UpdateTaskData,
} from '@/store/board/types';
import { theme } from '@/styles/theme';
import { getLastTaskPositionInColumn, mergeById } from '@/utils/boardHelpers';

type Set = StoreApi<BoardState>['setState'];
type Get = StoreApi<BoardState>['getState'];

export async function addColumnAction(set: Set, get: Get, data: AddColumnData): Promise<string> {
  // generate new id up front
  const id = crypto.randomUUID();

  const newCol: SyncColumn = {
    id,
    title: data.title.trim(),
    color: data.color,
    position: data.position,
    trashed: false,
    updatedAt: new Date(),
    isSynced: false,
  };

  // add column locally
  set(state => ({
    columns: [...state.columns, newCol],
    pendingColumns: [...state.pendingColumns, newCol],
  }));

  // fire-and-forget sync
  void get().syncPending();

  // return the new id
  return id;
}

export async function addTaskAction(set: Set, get: Get, data: AddTaskData): Promise<string> {
  // ensure at least one column exists
  if (get().columns.length === 0) {
    const draft: SyncColumn = {
      id: crypto.randomUUID(),
      title: 'Draft',
      color: theme.palette.primary.main,
      position: 1,
      trashed: false,
      updatedAt: new Date(),
      isSynced: false,
    };
    set(state => ({
      columns: [draft],
      pendingColumns: [...state.pendingColumns, draft],
    }));
  }

  const cols = get().columns;
  const targetId = data.columnId ?? [...cols].sort((a, b) => a.position - b.position)[0].id;
  const nextPos = getLastTaskPositionInColumn(get().tasks, targetId) + 1;

  const newTask: SyncTask = {
    id: crypto.randomUUID(),
    title: data.title.trim(),
    notes: data.notes?.trim() ?? '',
    quantityDone: 0,
    quantityTarget: data.quantityTarget && data.quantityTarget > 0 ? data.quantityTarget : 1,
    position: nextPos,
    columnId: targetId,
    trashed: false,
    updatedAt: new Date(),
    isSynced: false,
  };

  // add task locally
  set(state => ({
    tasks: [...state.tasks, newTask],
    pendingTasks: [...state.pendingTasks, newTask],
  }));

  // sync in background
  void get().syncPending();

  // return the new id
  return newTask.id;
}

export async function syncPendingAction(set: Set, get: Get) {
  const client = getSupabaseClient();
  const { pendingColumns, pendingTasks } = get();

  const stillColumns: SyncColumn[] = [];
  for (const col of pendingColumns) {
    try {
      const saved = await upsertColumn(client, col);
      // mark column as synced
      set(state => ({
        columns: state.columns.map(c => (c.id === saved.id ? { ...saved, isSynced: true } : c)),
      }));
    } catch (err) {
      console.error('Column sync failed', col.id, err);
      stillColumns.push(col);
    }
  }

  const stillTasks: SyncTask[] = [];
  for (const task of pendingTasks) {
    try {
      const saved = await upsertTask(client, task);
      set(state => ({
        tasks: state.tasks.map(t => (t.id === saved.id ? { ...saved, isSynced: true } : t)),
      }));
    } catch (err) {
      console.error('Task sync failed', task.id, err);
      stillTasks.push(task);
    }
  }

  set({
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

    // merge by updatedAt
    const mergedColsBase = mergeById(localCols, remoteCols);
    const mergedTasksBase = mergeById(
      localTasks.map(t => ({ ...t, updatedAt: t.updatedAt })),
      remoteTasks,
    );

    // rebuild with sync flags
    const mergedCols: SyncColumn[] = mergedColsBase.map(c => {
      const local = localCols.find(l => l.id === c.id);
      const isSynced = !local || c.updatedAt >= local.updatedAt;
      return { ...c, isSynced };
    });

    const mergedTasks: SyncTask[] = mergedTasksBase.map(t => {
      const local = localTasks.find(l => l.id === t.id);
      const isSynced = !local || t.updatedAt >= local.updatedAt;
      return { ...t, isSynced };
    });

    set({
      columns: mergedCols,
      tasks: mergedTasks,
      pendingColumns: mergedCols.filter(c => !c.isSynced),
      pendingTasks: mergedTasks.filter(t => !t.isSynced),
    });
  } catch (err) {
    console.error('syncFromServer failed', err);
  }
}

export async function updateColumnAction(set: Set, get: Get, data: UpdateColumnData) {
  const exists = get().columns.some(c => c.id === data.id);
  if (!exists) {
    console.warn(`updateColumnAction: column ${data.id} not found`);
    return;
  }

  set(state => {
    const now = new Date();
    let updated: SyncColumn | undefined;

    const columns = state.columns.map(c => {
      if (c.id !== data.id) return c;
      updated = {
        ...c,
        title: data.title?.trim() ?? c.title,
        color: data.color ?? c.color,
        position: data.position ?? c.position,
        trashed: data.trashed ?? c.trashed,
        updatedAt: now,
        isSynced: false,
      };
      return updated;
    });

    // replace any previous pending for this id
    const pendingColumns = updated
      ? [...state.pendingColumns.filter(c => c.id !== data.id), updated]
      : state.pendingColumns;

    return { columns, pendingColumns };
  });

  // push change up
  await get().syncPending();
}

export async function updateTaskAction(set: Set, get: Get, data: UpdateTaskData) {
  const exists = get().tasks.some(t => t.id === data.id);
  if (!exists) {
    console.warn(`updateTaskAction: task ${data.id} not found`);
    return;
  }

  set(state => {
    const now = new Date();
    let updated: SyncTask | undefined;

    const tasks = state.tasks.map(t => {
      if (t.id !== data.id) return t;
      updated = {
        ...t,
        title: data.title?.trim() ?? t.title,
        notes: data.notes?.trim() ?? t.notes,
        quantityDone: data.quantityDone ?? t.quantityDone,
        quantityTarget: data.quantityTarget ?? t.quantityTarget,
        position: data.position ?? t.position,
        columnId: data.columnId ?? t.columnId,
        trashed: data.trashed ?? t.trashed,
        updatedAt: now,
        isSynced: false,
      };
      return updated;
    });

    // replace any previous pending for this id
    const pendingTasks = updated
      ? [...state.pendingTasks.filter(t => t.id !== data.id), updated]
      : state.pendingTasks;

    return { tasks, pendingTasks };
  });

  // push change up
  await get().syncPending();
}
