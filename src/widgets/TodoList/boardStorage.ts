import { getStoredFilters, setStoredFilters } from '@/utils/localStorageUtils';
import { BoardState, Column } from '@/widgets/TodoList/types';

export const STORAGE_KEY = 'todo-board';
export const LAST_POPULATE_KEY = 'todo-last-populate';

export const DEFAULT_COLUMNS: Column[] = [
  { id: 'todo', title: 'Todo', color: '#1976d2' },
  { id: 'completed', title: 'Completed', color: '#2e7d32' },
];

export function loadBoard(): BoardState {
  try {
    return (
      getStoredFilters<BoardState>(STORAGE_KEY) || {
        columns: DEFAULT_COLUMNS,
        items: [],
      }
    );
  } catch {
    return { columns: DEFAULT_COLUMNS, items: [] };
  }
}

export function saveBoard(board: BoardState): void {
  try {
    setStoredFilters(STORAGE_KEY, board);
  } catch {
    // Failing to persist should not break UI but we log for debugging
    console.error('Could not save todo board');
  }
}
