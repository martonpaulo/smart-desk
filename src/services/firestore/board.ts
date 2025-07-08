import { doc, getDoc, onSnapshot, setDoc, Unsubscribe } from 'firebase/firestore';

import { db } from '@/services/firebase';
import type { BoardState } from '@/widgets/TodoList/types';

const docPath = (uid: string) => doc(db, 'users', uid, 'board', 'state');

export async function loadBoardFromFirestore(uid: string): Promise<BoardState | null> {
  const snap = await getDoc(docPath(uid));
  return snap.exists() ? (snap.data() as BoardState) : null;
}

export function subscribeToBoard(uid: string, cb: (board: BoardState | null) => void): Unsubscribe {
  return onSnapshot(docPath(uid), snap => {
    cb(snap.exists() ? (snap.data() as BoardState) : null);
  });
}

export function saveBoardToFirestore(uid: string, board: BoardState): Promise<void> {
  return setDoc(docPath(uid), board);
}
