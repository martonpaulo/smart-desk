/* eslint-disable @typescript-eslint/no-explicit-any */
import { getSupabaseClient } from '@/lib/supabaseClient';
import {
  createColumn,
  deleteColumn,
  fetchColumns,
  updateColumn,
} from '@/services/supabaseColumnsService';
import { createTask, deleteTask, fetchTasks, updateTask } from '@/services/supabaseTasksService';
import { getStoredFilters, setStoredFilters } from '@/utils/localStorageUtils';
import { COLUMN_COLORS } from '@/widgets/TodoList/ColumnModal';
import { BoardState, Column, TodoTask } from '@/widgets/TodoList/types';

export const STORAGE_KEY = 'todo-board';
export const LAST_POPULATE_KEY = 'todo-last-populate';

export const DEFAULT_COLUMNS: Column[] = [
  { id: 'todo', title: 'Todo', color: COLUMN_COLORS[0].value },
  { id: 'doing', title: 'Doing', color: COLUMN_COLORS[1].value },
  { id: 'done', title: 'Done', color: COLUMN_COLORS[2].value },
];

export const DEFAULT_BOARD: BoardState = {
  columns: DEFAULT_COLUMNS,
  tasks: [],
  trash: { columns: [], tasks: [] },
};

let isSyncingTasks = false;
let isSyncingColumns = false;

export function loadBoard(): BoardState {
  try {
    const board = getStoredFilters<BoardState>(STORAGE_KEY);

    // Validate structure
    if (!board || !Array.isArray(board.columns) || !Array.isArray(board.tasks)) {
      return DEFAULT_BOARD;
    }
    if (!board.trash) board.trash = { columns: [], tasks: [] };
    // Migrate old columnId property if present
    board.tasks = board.tasks.map(t => {
      if ((t as any).columnId && !(t as any).columnSlug) {
        (t as any).columnSlug = (t as any).columnId;
        delete (t as any).columnId;
      }
      if ((t as any).prevColumnId && !(t as any).prevColumnSlug) {
        (t as any).prevColumnSlug = (t as any).prevColumnId;
        delete (t as any).prevColumnId;
      }
      return t;
    });
    return board;
  } catch {
    return DEFAULT_BOARD;
  }
}

export function saveBoard(board: BoardState): void {
  try {
    setStoredFilters(STORAGE_KEY, board);
    void syncTasksWithSupabase(board);
    void syncColumnsWithSupabase(board);
  } catch {
    console.error('Could not save todo board');
  }
}

async function syncTasksWithSupabase(board: BoardState): Promise<void> {
  if (isSyncingTasks) return;
  isSyncingTasks = true;
  const supabase = getSupabaseClient();
  try {
    const remote = await fetchTasks(supabase);
    const remoteMap = new Map(remote.map(t => [t.id, t]));
    let updated = false;

    for (const task of board.tasks) {
      const existing = remoteMap.get(task.id);
      if (!existing) {
        console.debug('Sync local task to Supabase', task);
        const created = await createTask(supabase, {
          id: task.id,
          title: task.title,
          description: task.description,
          tags: task.tags,
          columnSlug: task.columnSlug,
          quantity: task.quantity,
          quantityTotal: task.quantityTotal,
        });
        if (created.id !== task.id) {
          task.id = created.id;
          updated = true;
        }
        remoteMap.set(task.id, created);
      } else if (!areTasksEqual(existing, task)) {
        await updateTask(supabase, task.id, {
          title: task.title,
          description: task.description,
          tags: task.tags,
          columnSlug: task.columnSlug,
          quantity: task.quantity,
          quantityTotal: task.quantityTotal,
        });
      }
    }

    for (const task of remote) {
      if (!board.tasks.some(t => t.id === task.id)) {
        await deleteTask(supabase, task.id);
      }
    }
    if (updated) {
      setStoredFilters(STORAGE_KEY, board);
    }
  } catch (err) {
    console.error('Failed syncing tasks to Supabase', err);
  } finally {
    isSyncingTasks = false;
  }
}

function areTasksEqual(a: TodoTask, b: TodoTask): boolean {
  return (
    a.title === b.title &&
    a.description === b.description &&
    a.columnSlug === b.columnSlug &&
    JSON.stringify(a.tags) === JSON.stringify(b.tags) &&
    a.quantity === b.quantity &&
    a.quantityTotal === b.quantityTotal
  );
}

async function syncColumnsWithSupabase(board: BoardState): Promise<void> {
  if (isSyncingColumns) return;
  isSyncingColumns = true;
  const supabase = getSupabaseClient();
  try {
    const remote = await fetchColumns(supabase);
    const remoteMap = new Map(remote.map(c => [c.id, c]));

    for (const column of board.columns) {
      const existing = remoteMap.get(column.id);
      if (!existing) {
        await createColumn(supabase, {
          id: column.id,
          title: column.title,
          color: column.color,
        });
      } else if (existing.title !== column.title || existing.color !== column.color) {
        await updateColumn(supabase, column.id, {
          title: column.title,
          color: column.color,
        });
      }
    }

    for (const col of remote) {
      if (!board.columns.some(c => c.id === col.id)) {
        await deleteColumn(supabase, col.id);
      }
    }
  } catch (err) {
    console.error('Failed syncing columns to Supabase', err);
  } finally {
    isSyncingColumns = false;
  }
}
