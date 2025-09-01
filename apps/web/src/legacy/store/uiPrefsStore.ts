import { getStoredFilters, setStoredFilters } from 'src/legacy/utils/localStorageUtils';
import { create } from 'zustand';

interface UiPrefsState {
  zoom: number;
  setZoom: (zoom: number) => void;
}

type UiPrefsData = Pick<UiPrefsState, 'zoom'>;

const STORAGE_KEY = 'ui-prefs';

function loadPrefs(): UiPrefsData {
  try {
    return getStoredFilters<UiPrefsData>(STORAGE_KEY) ?? { zoom: 1 };
  } catch {
    return { zoom: 1 };
  }
}

function persistPrefs(state: UiPrefsState) {
  const dataToStore: UiPrefsData = { zoom: state.zoom };
  setStoredFilters(STORAGE_KEY, dataToStore);
}

export const useUiPrefsStore = create<UiPrefsState>(set => ({
  ...loadPrefs(),
  setZoom: zoom =>
    set(state => {
      const next = { ...state, zoom };
      persistPrefs(next);
      return next;
    }),
}));
