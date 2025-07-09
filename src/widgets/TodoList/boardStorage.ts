import { getSupabaseClient } from '@/lib/supabaseClient';
import { createTask, fetchTasks, updateTask } from '@/services/supabaseTasksService';
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

let isSyncing = false;

export function loadBoard(): BoardState {
  try {
    const board = getStoredFilters<BoardState>(STORAGE_KEY);

    // Validate structure
    if (!board || !Array.isArray(board.columns) || !Array.isArray(board.tasks)) {
      return DEFAULT_BOARD;
    }
    if (!board.trash) board.trash = { columns: [], tasks: [] };
    return board;
  } catch {
    return DEFAULT_BOARD;
  }
}

export function saveBoard(board: BoardState): void {
  try {
    setStoredFilters(STORAGE_KEY, board);
    void syncTasksWithSupabase(board);
  } catch {
    console.error('Could not save todo board');
  }
}

async function syncTasksWithSupabase(board: BoardState): Promise<void> {
  if (isSyncing) return;
  isSyncing = true;
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
          columnId: task.columnId,
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
          columnId: task.columnId,
          quantity: task.quantity,
          quantityTotal: task.quantityTotal,
        });
      }
    }
    if (updated) {
      setStoredFilters(STORAGE_KEY, board);
    }
  } catch (err) {
    console.error('Failed syncing tasks to Supabase', err);
  } finally {
    isSyncing = false;
  }
}

function areTasksEqual(a: TodoTask, b: TodoTask): boolean {
  return (
    a.title === b.title &&
    a.description === b.description &&
    a.columnId === b.columnId &&
    JSON.stringify(a.tags) === JSON.stringify(b.tags) &&
    a.quantity === b.quantity &&
    a.quantityTotal === b.quantityTotal
  );
}
