import { doc, getDoc, onSnapshot, setDoc, Unsubscribe } from 'firebase/firestore';

import { db } from '@/services/firebase';

const docPath = (uid: string) => doc(db, 'users', uid, 'settings', 'hiddenEvents');

export async function loadHiddenEventsFromFirestore(uid: string): Promise<string[]> {
  const snap = await getDoc(docPath(uid));
  return snap.exists() ? (snap.data().ids as string[]) || [] : [];
}

export function subscribeToHiddenEvents(uid: string, cb: (ids: string[]) => void): Unsubscribe {
  return onSnapshot(docPath(uid), snap => {
    const ids = snap.exists() ? (snap.data().ids as string[]) || [] : [];
    cb(ids);
  });
}

export function saveHiddenEventsToFirestore(uid: string, ids: string[]): Promise<void> {
  return setDoc(docPath(uid), { ids });
}
