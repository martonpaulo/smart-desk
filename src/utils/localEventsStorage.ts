import { IEvent } from '@/types/IEvent';
import { getStoredFilters, setStoredFilters } from '@/utils/localStorageUtils';
import { auth } from '@/services/firebase';
import {
  saveLocalEventsToFirestore,
} from '@/services/firestore/localEvents';

const STORAGE_KEY = 'local-events';

export function loadLocalEvents(): IEvent[] {
  try {
    return getStoredFilters<IEvent[]>(STORAGE_KEY) ?? [];
  } catch {
    return [];
  }
}

export function saveLocalEvents(events: IEvent[]): void {
  const uid = auth.currentUser?.uid;
  if (uid) {
    saveLocalEventsToFirestore(uid, events).catch(err =>
      console.error('Failed to save events to Firestore', err),
    );
  }

  try {
    setStoredFilters(STORAGE_KEY, events);
  } catch {
    console.error('Could not save local events');
  }
}
