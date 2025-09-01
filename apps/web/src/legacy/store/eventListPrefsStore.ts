import { getStoredFilters, setStoredFilters } from 'src/legacy/utils/localStorageUtils';
import { create } from 'zustand';

interface EventListPrefsState {
  width: number;
  setWidth: (width: number) => void;
}

type EventListPrefsData = Pick<EventListPrefsState, 'width'>;

const STORAGE_KEY = 'event-list-prefs';

function loadPrefs(): EventListPrefsData {
  try {
    return getStoredFilters<EventListPrefsData>(STORAGE_KEY) ?? { width: 250 };
  } catch {
    return { width: 250 };
  }
}

function persistPrefs(state: EventListPrefsState) {
  const data: EventListPrefsData = { width: state.width };
  setStoredFilters(STORAGE_KEY, data);
}

export const useEventListPrefsStore = create<EventListPrefsState>(set => ({
  ...loadPrefs(),
  setWidth: width =>
    set(state => {
      const next = { ...state, width };
      persistPrefs(next);
      return next;
    }),
}));
