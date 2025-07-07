import { getStoredFilters, setStoredFilters } from './localStorageUtils';
import type { IEvent } from '../types/IEvent';

const STORAGE_KEY = 'local-events';

export function loadLocalEvents(): IEvent[] {
  try {
    return getStoredFilters<IEvent[]>(STORAGE_KEY) ?? [];
  } catch {
    return [];
  }
}

export function saveLocalEvents(events: IEvent[]): void {
  try {
    setStoredFilters(STORAGE_KEY, events);
  } catch {
    console.error('Could not save local events');
  }
}
