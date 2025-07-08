import { doc, getDoc, onSnapshot, setDoc, Unsubscribe } from 'firebase/firestore';
import { db } from '../firebase';
import type { IEvent } from '@/types/IEvent';

const docPath = (uid: string) => doc(db, 'users', uid, 'localEvents', 'list');

export async function loadLocalEventsFromFirestore(uid: string): Promise<IEvent[]> {
  const snap = await getDoc(docPath(uid));
  return snap.exists() ? ((snap.data().events as IEvent[]) || []) : [];
}

export function subscribeToLocalEvents(
  uid: string,
  cb: (events: IEvent[]) => void,
): Unsubscribe {
  return onSnapshot(docPath(uid), snap => {
    const events = snap.exists() ? ((snap.data().events as IEvent[]) || []) : [];
    cb(events);
  });
}

export function saveLocalEventsToFirestore(uid: string, events: IEvent[]): Promise<void> {
  return setDoc(docPath(uid), { events });
}
