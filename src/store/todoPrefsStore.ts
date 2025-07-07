import { create } from 'zustand';
import { getStoredFilters, setStoredFilters } from '@/utils/localStorageUtils';

interface TodoPrefsState {
  view: 'board' | 'list';
  setView: (view: 'board' | 'list') => void;
  trashOpen: boolean;
  setTrashOpen: (open: boolean) => void;
}

const STORAGE_KEY = 'todo-prefs';

function loadPrefs(): TodoPrefsState {
  try {
    return (
      getStoredFilters<TodoPrefsState>(STORAGE_KEY) ?? {
        view: 'board',
        trashOpen: false,
      }
    );
  } catch {
    return {
      view: 'board',
      setView: () => {},
      trashOpen: false,
      setTrashOpen: () => {},
    } as TodoPrefsState;
  }
}

function persistPrefs(state: TodoPrefsState) {
  setStoredFilters(STORAGE_KEY, { view: state.view });
}

export const useTodoPrefsStore = create<TodoPrefsState>(set => ({
  ...loadPrefs(),
  setView: view =>
    set(state => {
      const next = { ...state, view };
      persistPrefs(next);
      return next;
    }),
  setTrashOpen: open =>
    set(state => {
      const next = { ...state, trashOpen: open };
      return next;
    }),
}));
