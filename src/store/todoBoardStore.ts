import { create } from 'zustand';

import { loadBoard, saveBoard } from '@/widgets/TodoList/boardStorage';
import { BoardState } from '@/widgets/TodoList/types';

interface TodoBoardState {
  board: BoardState;
  setBoard: (board: BoardState) => void;
}

export const useTodoBoardStore = create<TodoBoardState>(set => ({
  board: loadBoard(),
  setBoard: board => {
    saveBoard(board);
    set({ board });
  },
}));
