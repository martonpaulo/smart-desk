import { auth } from '@/services/firebase';
import { saveHiddenEventsToFirestore } from '@/services/firestore/hiddenEvents';
import { getStoredFilters, setStoredFilters } from '@/utils/localStorageUtils';

export const HIDDEN_EVENTS_KEY = 'hidden-events';

export function loadHiddenEventIds(): string[] {
  try {
    return getStoredFilters<string[]>(HIDDEN_EVENTS_KEY) ?? [];
  } catch {
    return [];
  }
}

export function saveHiddenEventIds(ids: string[]): void {
  const uid = auth.currentUser?.uid;
  if (uid) {
    saveHiddenEventsToFirestore(uid, ids).catch(err =>
      console.error('Failed to save hidden events to Firestore', err),
    );
  }

  setStoredFilters(HIDDEN_EVENTS_KEY, ids);
}
