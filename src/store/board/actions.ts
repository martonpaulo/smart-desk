import type { StoreApi } from 'zustand';

import { getSupabaseClient } from '@/lib/supabaseClient';
import { fetchColumns, upsertColumn } from '@/services/supabaseColumnsService';
import { fetchTasks, upsertTask } from '@/services/supabaseTasksService';
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

export async function addColumnAction(
  set: Set,
  get: Get,
  { title, color, position }: AddColumnData,
): Promise<string> {
  // generate new id up front
  const id = crypto.randomUUID();

  const newCol: SyncColumn = {
    id,
    title: title.trim(),
    color,
    position,
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

export async function addTaskAction(
  set: Set,
  get: Get,
  { title, notes = '', quantityTarget = 1, columnId }: AddTaskData,
): Promise<string> {
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
  const targetId = columnId ?? [...cols].sort((a, b) => a.position - b.position)[0].id;
  const nextPos = getLastTaskPositionInColumn(get().tasks, targetId) + 1;

  const newTask: SyncTask = {
    id: crypto.randomUUID(),
    title: title.trim(),
    notes: notes.trim(),
    quantityDone: 0,
    quantityTarget: quantityTarget > 0 ? quantityTarget : 1,
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

export async function updateColumnAction(
  set: Set,
  get: Get,
  { id, title, color, position, trashed }: UpdateColumnData,
) {
  const exists = get().columns.some(c => c.id === id);
  if (!exists) {
    console.warn(`updateColumnAction: column ${id} not found`);
    return;
  }

  set(state => {
    const now = new Date();
    let updated: SyncColumn | undefined;

    const columns = state.columns.map(c => {
      if (c.id !== id) return c;
      updated = {
        ...c,
        title: title?.trim() ?? c.title,
        color: color ?? c.color,
        position: position ?? c.position,
        trashed: trashed ?? c.trashed,
        updatedAt: now,
        isSynced: false,
      };
      return updated;
    });

    // replace any previous pending for this id
    const pendingColumns = updated
      ? [...state.pendingColumns.filter(c => c.id !== id), updated]
      : state.pendingColumns;

    return { columns, pendingColumns };
  });

  // push change up
  await get().syncPending();
}

export async function updateTaskAction(
  set: Set,
  get: Get,
  { id, title, notes, quantityDone, quantityTarget, position, columnId, trashed }: UpdateTaskData,
) {
  const exists = get().tasks.some(t => t.id === id);
  if (!exists) {
    console.warn(`updateTaskAction: task ${id} not found`);
    return;
  }

  set(state => {
    const now = new Date();
    let updated: SyncTask | undefined;

    const tasks = state.tasks.map(t => {
      if (t.id !== id) return t;
      updated = {
        ...t,
        title: title?.trim() ?? t.title,
        notes: notes?.trim() ?? t.notes,
        quantityDone: quantityDone ?? t.quantityDone,
        quantityTarget: quantityTarget ?? t.quantityTarget,
        position: position ?? t.position,
        columnId: columnId ?? t.columnId,
        trashed: trashed ?? t.trashed,
        updatedAt: now,
        isSynced: false,
      };
      return updated;
    });

    // replace any previous pending for this id
    const pendingTasks = updated
      ? [...state.pendingTasks.filter(t => t.id !== id), updated]
      : state.pendingTasks;

    return { tasks, pendingTasks };
  });

  // push change up
  await get().syncPending();
}
