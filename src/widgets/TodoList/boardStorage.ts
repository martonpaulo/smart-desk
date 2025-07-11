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
export const LAST_SYNC_KEY = 'todo-last-sync';

export const DEFAULT_COLUMNS: Column[] = [
  { id: 'todo', slug: 'todo', title: 'Todo', color: COLUMN_COLORS[0].value, position: 0 },
  { id: 'doing', slug: 'doing', title: 'Doing', color: COLUMN_COLORS[1].value, position: 1 },
  { id: 'done', slug: 'done', title: 'Done', color: COLUMN_COLORS[2].value, position: 2 },
];

export const DEFAULT_BOARD: BoardState = {
  columns: DEFAULT_COLUMNS,
  tasks: [],
  trash: { columns: [], tasks: [] },
};

export function getLastSync(): string {
  return getStoredFilters<string>(LAST_SYNC_KEY) ?? new Date(0).toISOString();
}

function setLastSync(date: string): void {
  setStoredFilters(LAST_SYNC_KEY, date);
}

let isSyncingTasks = false;
let isSyncingColumns = false;

function applyPositions(board: BoardState): BoardState {
  const columns = board.columns.map((c, index) => ({ ...c, position: index }));
  const counter: Record<string, number> = {};
  const tasks = board.tasks.map(t => {
    const idx = counter[t.columnSlug] ?? 0;
    counter[t.columnSlug] = idx + 1;
    return { ...t, position: idx };
  });
  return { ...board, columns, tasks };
}

export function loadBoard(): BoardState {
  try {
    const board = getStoredFilters<BoardState>(STORAGE_KEY);

    // Validate structure
    if (!board || !Array.isArray(board.columns) || !Array.isArray(board.tasks)) {
      return DEFAULT_BOARD;
    }
    if (!board.trash) board.trash = { columns: [], tasks: [] };
    // Migrate column slug property if missing
    board.columns = board.columns.map(c => {
      if (!(c as any).slug) {
        (c as any).slug = c.id;
      }
      return c;
    });
    board.trash.columns = board.trash.columns.map(c => {
      if (!(c as any).slug) {
        (c as any).slug = c.id;
      }
      return c;
    });
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
    return applyPositions(board);
  } catch {
    return DEFAULT_BOARD;
  }
}

export function saveBoard(board: BoardState): void {
  try {
    const withPos = applyPositions(board);
    setStoredFilters(STORAGE_KEY, withPos);
    void (async () => {
      const lastSync = getLastSync();
      const afterColumns = await syncColumnsWithSupabase(withPos, lastSync);
      const finalBoard = await syncTasksWithSupabase(afterColumns, lastSync);
      setStoredFilters(STORAGE_KEY, finalBoard);
      setLastSync(new Date().toISOString());
    })();
  } catch {
    console.error('Could not save todo board');
  }
}

async function syncTasksWithSupabase(board: BoardState, lastSync: string): Promise<BoardState> {
  if (isSyncingTasks) return board;
  isSyncingTasks = true;
  const supabase = getSupabaseClient();
  try {
    const remote = await fetchTasks(supabase, { includeTrashed: true });
    const remoteMap = new Map(remote.map(t => [t.id, t]));

    let updated = false;

    // merge remote tasks into local board first to avoid losing local updates
    for (const rTask of remote) {
      const localIndex = board.tasks.findIndex(t => t.id === rTask.id);
      const remoteIsNewer = new Date(rTask.updatedAt ?? 0) > new Date(lastSync);

      if (rTask.trashed) {
        if (localIndex !== -1) {
          const [removed] = board.tasks.splice(localIndex, 1);
          board.trash.tasks.push({ ...removed, ...rTask });
          updated = true;
        } else if (!board.trash.tasks.some(t => t.id === rTask.id)) {
          board.trash.tasks.push(rTask);
          updated = true;
        }
        continue;
      }

      if (localIndex === -1) {
        if (!board.trash.tasks.some(t => t.id === rTask.id)) {
          board.tasks.push(rTask);
          updated = true;
        }
      } else if (remoteIsNewer && !areTasksEqual(rTask, board.tasks[localIndex])) {
        board.tasks[localIndex] = { ...board.tasks[localIndex], ...rTask };
        updated = true;
      }
    }

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
          position: task.position,
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
          position: task.position,
          quantity: task.quantity,
          quantityTotal: task.quantityTotal,
          trashed: false,
        });
      }
    }

    for (const task of remote) {
      const existsInBoard =
        board.tasks.some(t => t.id === task.id) || board.trash.tasks.some(t => t.id === task.id);
      if (!existsInBoard && !task.trashed) {
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
  return board;
}

function areTasksEqual(a: TodoTask, b: TodoTask): boolean {
  return (
    a.title === b.title &&
    a.description === b.description &&
    a.columnSlug === b.columnSlug &&
    a.position === b.position &&
    JSON.stringify(a.tags) === JSON.stringify(b.tags) &&
    a.quantity === b.quantity &&
    a.quantityTotal === b.quantityTotal
  );
}

async function syncColumnsWithSupabase(board: BoardState, lastSync: string): Promise<BoardState> {
  if (isSyncingColumns) return board;
  isSyncingColumns = true;
  const supabase = getSupabaseClient();
  try {
    const remote = await fetchColumns(supabase, { includeTrashed: true });
    const remoteMap = new Map(remote.map(c => [c.slug ?? c.id, c]));
    const remoteNewer = remote.some(r => new Date(r.updatedAt ?? 0) > new Date(lastSync));

    if (remoteNewer) {
      return {
        ...board,
        columns: remote.filter(c => !c.trashed),
        trash: { ...board.trash, columns: remote.filter(c => c.trashed) },
      };
    }

    for (const [index, column] of board.columns.entries()) {
      const existing = remoteMap.get(column.slug);
      if (!existing) {
        await createColumn(supabase, {
          id: column.id,
          slug: column.slug,
          title: column.title,
          color: column.color,
          position: index,
        });
      } else if (
        existing.title !== column.title ||
        existing.color !== column.color ||
        existing.position !== index
      ) {
        if (existing.id) {
          await updateColumn(supabase, existing.id, {
            title: column.title,
            color: column.color,
            position: index,
            trashed: false,
          });
        }
      }
    }

    for (const col of remote) {
      if (!board.columns.some(c => c.slug === (col.slug ?? col.id)) && !col.trashed) {
        if (col.id) {
          await deleteColumn(supabase, col.id);
        }
      }
    }
  } catch (err) {
    console.error('Failed syncing columns to Supabase', err);
  } finally {
    isSyncingColumns = false;
  }
  return board;
}
