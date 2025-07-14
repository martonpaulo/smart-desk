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

type Set = StoreApi<BoardState>['setState'];
type Get = StoreApi<BoardState>['getState'];

// adds a column with dynamic position
export async function addColumnAction(set: Set, get: Get, data: AddColumnData): Promise<string> {
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
    updatedAt: new Date(),
    isSynced: false,
  };

  set(state => ({
    columns: [...state.columns, newCol],
    pendingColumns: [...state.pendingColumns, newCol],
  }));

  void get().syncPending();
  return id;
}

export async function addTaskAction(set: Set, get: Get, data: AddTaskData): Promise<string> {
  let columns = get().columns;

  if (columns.length === 0) {
    const draft: Column = {
      id: crypto.randomUUID(),
      title: 'Draft',
      color: theme.palette.primary.main,
      position: getNewColumnPosition(columns),
      trashed: false,
      updatedAt: new Date(),
      isSynced: false,
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
    position: nextPos,
    columnId: targetId,
    trashed: false,
    updatedAt: new Date(),
    isSynced: false,
  };

  set(state => ({
    tasks: [...state.tasks, newTask],
    pendingTasks: [...state.pendingTasks, newTask],
  }));

  void get().syncPending();
  return newTask.id;
}

export async function syncPendingAction(set: Set, get: Get) {
  const client = getSupabaseClient();
  const { pendingColumns, pendingTasks } = get();

  const stillColumns: Column[] = [];
  for (const col of pendingColumns) {
    try {
      const saved = await upsertColumn(client, col);
      set(state => ({
        columns: state.columns.map(c => (c.id === saved.id ? { ...saved, isSynced: true } : c)),
      }));
    } catch {
      stillColumns.push(col);
    }
  }

  const stillTasks: Task[] = [];
  for (const task of pendingTasks) {
    try {
      const saved = await upsertTask(client, task);
      set(state => ({
        tasks: state.tasks.map(t => (t.id === saved.id ? { ...saved, isSynced: true } : t)),
      }));
    } catch {
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

    const mergedColsBase = mergeById(localCols, remoteCols);
    const mergedTasksBase = mergeById(
      localTasks.map(t => ({ ...t, updatedAt: t.updatedAt })),
      remoteTasks,
    );

    const mergedCols: Column[] = mergedColsBase.map(c => {
      const local = localCols.find(l => l.id === c.id);
      return { ...c, isSynced: !local || c.updatedAt >= local.updatedAt };
    });

    const mergedTasks: Task[] = mergedTasksBase.map(t => {
      const local = localTasks.find(l => l.id === t.id);
      return { ...t, isSynced: !local || t.updatedAt >= local.updatedAt };
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
  if (!get().columns.some(c => c.id === data.id)) {
    console.warn(`updateColumnAction: column ${data.id} not found`);
    return;
  }

  set(state => {
    const now = new Date();
    let updated: Column | undefined;

    const columns = state.columns.map(c => {
      if (c.id !== data.id) return c;
      updated = {
        ...c,
        title: typeof data.title === 'string' ? data.title.trim() : c.title,
        color: data.color ?? c.color,
        position: typeof data.position === 'number' ? data.position : c.position,
        trashed: data.trashed ?? c.trashed,
        updatedAt: now,
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
    const now = new Date();
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
        position: typeof data.position === 'number' ? data.position : t.position,
        columnId: data.columnId ?? t.columnId,
        trashed: data.trashed ?? t.trashed,
        updatedAt: now,
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
