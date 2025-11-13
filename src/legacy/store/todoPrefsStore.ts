import { create } from 'zustand';

import { getStoredFilters, setStoredFilters } from 'src/legacy/utils/localStorageUtils';

interface TodoPrefsState {
  view: 'board' | 'list';
  setView: (view: 'board' | 'list') => void;
  trashOpen: boolean;
  setTrashOpen: (open: boolean) => void;
  hiddenColumnIds: string[];
  toggleHiddenColumn: (id: string) => void;
}

type TodoPrefsData = Pick<TodoPrefsState, 'view' | 'trashOpen' | 'hiddenColumnIds'>;

const STORAGE_KEY = 'todo-prefs';

function loadPrefs(): TodoPrefsData {
  try {
    const prefs = getStoredFilters<TodoPrefsData>(STORAGE_KEY) ?? {
      view: 'board',
      trashOpen: false,
      hiddenColumnIds: [],
    };
    // Ensure hiddenColumnIds is always an array
    prefs.hiddenColumnIds = prefs.hiddenColumnIds || [];
    return prefs;
  } catch {
    return {
      view: 'board',
      setView: () => {},
      trashOpen: false,
      setTrashOpen: () => {},
      hiddenColumnIds: [],
      toggleHiddenColumn: () => {},
    } as TodoPrefsState;
  }
}

function persistPrefs(state: TodoPrefsState) {
  const dataToStore: TodoPrefsData = {
    view: state.view,
    trashOpen: state.trashOpen,
    hiddenColumnIds: state.hiddenColumnIds,
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
  toggleHiddenColumn: id =>
    set(state => {
      // Ensure hiddenColumnIds exists before accessing it
      const hiddenColumnIds = state.hiddenColumnIds || [];
      const exists = hiddenColumnIds.includes(id);
      const nextIds = exists ? hiddenColumnIds.filter(cid => cid !== id) : [...hiddenColumnIds, id];
      const next = { ...state, hiddenColumnIds: nextIds };
      persistPrefs(next);
      return next;
    }),
}));
