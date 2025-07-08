import { doc, getDoc, onSnapshot, setDoc, Unsubscribe } from 'firebase/firestore';

import { db } from '@/services/firebase';
import type { TagPreset } from '@/utils/tagPresetsStorage';

const docPath = (uid: string) => doc(db, 'users', uid, 'settings', 'tagPresets');

export async function loadTagPresetsFromFirestore(uid: string): Promise<TagPreset[]> {
  const snap = await getDoc(docPath(uid));
  return snap.exists() ? (snap.data().presets as TagPreset[]) || [] : [];
}

export function subscribeToTagPresets(
  uid: string,
  cb: (presets: TagPreset[]) => void,
): Unsubscribe {
  return onSnapshot(docPath(uid), snap => {
    const presets = snap.exists() ? (snap.data().presets as TagPreset[]) || [] : [];
    cb(presets);
  });
}

export function saveTagPresetsToFirestore(uid: string, presets: TagPreset[]): Promise<void> {
  return setDoc(docPath(uid), { presets });
}
