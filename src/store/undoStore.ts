import { create } from 'zustand';

interface UndoAction {
  message: string;
  onUndo: () => void;
}

interface UndoState {
  action: UndoAction | null;
  show: (message: string, onUndo: () => void) => void;
  clear: () => void;
}

export const useUndoStore = create<UndoState>(set => ({
  action: null,
  show: (message, onUndo) => set({ action: { message, onUndo } }),
  clear: () => set({ action: null }),
}));

export function showUndo(message: string, onUndo: () => void) {
  useUndoStore.getState().show(message, onUndo);
}
