import { doc, getDoc, onSnapshot, setDoc, Unsubscribe } from 'firebase/firestore';

import { db } from '@/services/firebase';
import type { IcsCalendarConfig } from '@/types/IcsCalendarConfig';

const docPath = (uid: string) => doc(db, 'users', uid, 'icsCalendars', 'config');

export async function loadIcsCalendarsFromFirestore(uid: string): Promise<IcsCalendarConfig[]> {
  const snap = await getDoc(docPath(uid));
  return snap.exists() ? (snap.data().calendars as IcsCalendarConfig[]) || [] : [];
}

export function subscribeToIcsCalendars(
  uid: string,
  cb: (calendars: IcsCalendarConfig[]) => void,
): Unsubscribe {
  return onSnapshot(docPath(uid), snap => {
    const calendars = snap.exists() ? (snap.data().calendars as IcsCalendarConfig[]) || [] : [];
    cb(calendars);
  });
}

export function saveIcsCalendarsToFirestore(
  uid: string,
  calendars: IcsCalendarConfig[],
): Promise<void> {
  return setDoc(docPath(uid), { calendars });
}
