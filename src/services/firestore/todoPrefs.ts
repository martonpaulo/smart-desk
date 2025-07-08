import { doc, getDoc, onSnapshot, setDoc, Unsubscribe } from 'firebase/firestore';

import { db } from '@/services/firebase';
import type { TodoPrefsData } from '@/store/todoPrefsStore';

const docPath = (uid: string) => doc(db, 'users', uid, 'settings', 'todoPrefs');

export async function loadTodoPrefsFromFirestore(uid: string): Promise<TodoPrefsData | null> {
  const snap = await getDoc(docPath(uid));
  return snap.exists() ? (snap.data() as TodoPrefsData) || null : null;
}

export function subscribeToTodoPrefs(
  uid: string,
  cb: (prefs: TodoPrefsData | null) => void,
): Unsubscribe {
  return onSnapshot(docPath(uid), snap => {
    const prefs = snap.exists() ? (snap.data() as TodoPrefsData) || null : null;
    cb(prefs);
  });
}

export function saveTodoPrefsToFirestore(uid: string, prefs: TodoPrefsData): Promise<void> {
  return setDoc(docPath(uid), prefs);
}
