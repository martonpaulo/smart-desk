import { create } from 'zustand';

import { getStoredFilters, setStoredFilters } from '@/utils/localStorageUtils';

interface TodoPrefsState {
  view: 'board' | 'list';
  setView: (view: 'board' | 'list') => void;
  trashOpen: boolean;
  setTrashOpen: (open: boolean) => void;
}

type TodoPrefsData = Pick<TodoPrefsState, 'view' | 'trashOpen'>;

const STORAGE_KEY = 'todo-prefs';

function loadPrefs(): TodoPrefsData {
  try {
    return (
      getStoredFilters<TodoPrefsData>(STORAGE_KEY) ?? {
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
  const dataToStore: TodoPrefsData = {
    view: state.view,
    trashOpen: state.trashOpen,
  };
  setStoredFilters(STORAGE_KEY, dataToStore);
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
