import { auth } from '@/services/firebase';
import { saveBoardToFirestore } from '@/services/firestore/board';
import { getStoredFilters, setStoredFilters } from '@/utils/localStorageUtils';
import { COLUMN_COLORS } from '@/widgets/TodoList/ColumnModal';
import { BoardState, Column } from '@/widgets/TodoList/types';

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
  const uid = auth.currentUser?.uid;
  if (uid) {
    saveBoardToFirestore(uid, board).catch(err =>
      console.error('Failed to save board to Firestore', err),
    );
  }

  try {
    setStoredFilters(STORAGE_KEY, board);
  } catch {
    console.error('Could not save todo board');
  }
}
