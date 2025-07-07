import { getStoredFilters, setStoredFilters } from '@/utils/localStorageUtils';

const STORAGE_KEY = 'hidden-events';

export function loadHiddenEventIds(): string[] {
  try {
    return getStoredFilters<string[]>(STORAGE_KEY) ?? [];
  } catch {
    return [];
  }
}

export function saveHiddenEventIds(ids: string[]): void {
  setStoredFilters(STORAGE_KEY, ids);
}
