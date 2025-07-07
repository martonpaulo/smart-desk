import { create } from 'zustand';

import { loadBoard, saveBoard } from '@/widgets/TodoList/boardStorage';
import { BoardState } from '@/widgets/TodoList/types';

export interface TodoBoardState {
  board: BoardState;
  setBoard: (boardOrUpdater: BoardState | ((prev: BoardState) => BoardState)) => void;
}

export const useTodoBoardStore = create<TodoBoardState>(set => ({
  board: loadBoard(),
  setBoard: boardOrUpdater => {
    if (typeof boardOrUpdater === 'function') {
      set(state => {
        const newBoard = boardOrUpdater(state.board);
        saveBoard(newBoard);
        return { board: newBoard };
      });
    } else {
      saveBoard(boardOrUpdater);
      set({ board: boardOrUpdater });
    }
  },
}));
