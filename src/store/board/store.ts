import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import {
  addColumnAction,
  addTaskAction,
  syncFromServerAction,
  syncPendingAction,
  updateColumnAction,
  updateTaskAction,
} from '@/store/board/actions';
import { BoardState } from '@/store/board/types';
import { buildStorageKey } from '@/utils/localStorageUtils';

export const useBoardStore = create<BoardState>()(
  persist(
    (set, get) => ({
      columns: [],
      tasks: [],
      pendingColumns: [],
      pendingTasks: [],

      addColumn: data => addColumnAction(set, get, data),
      addTask: data => addTaskAction(set, get, data),
      updateColumn: data => updateColumnAction(set, get, data),
      updateTask: data => updateTaskAction(set, get, data),

      syncPending: () => syncPendingAction(set, get),
      syncFromServer: () => syncFromServerAction(set, get),
    }),
    {
      name: buildStorageKey('board'),
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
