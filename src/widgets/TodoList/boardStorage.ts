import { getStoredFilters, setStoredFilters } from '@/utils/localStorageUtils';
import { BoardState, Column } from '@/widgets/TodoList/types';

export const STORAGE_KEY = 'todo-board';
export const LAST_POPULATE_KEY = 'todo-last-populate';

export const DEFAULT_COLUMNS: Column[] = [
  { id: 'todo', title: 'Todo', color: '#1976d2' },
  { id: 'doing', title: 'Doing', color: '#f57c00' },
  { id: 'done', title: 'Done', color: '#2e7d32' },
];

export const DEFAULT_BOARD: BoardState = {
  columns: DEFAULT_COLUMNS,
  tasks: [],
};

export function loadBoard(): BoardState {
  try {
    const board = getStoredFilters<BoardState>(STORAGE_KEY);

    // Validate structure
    if (!board || !Array.isArray(board.columns) || !Array.isArray(board.tasks)) {
      return DEFAULT_BOARD;
    }

    return board;
  } catch {
    return DEFAULT_BOARD;
  }
}

export function saveBoard(board: BoardState): void {
  try {
    setStoredFilters(STORAGE_KEY, board);
  } catch {
    console.error('Could not save todo board');
  }
}
