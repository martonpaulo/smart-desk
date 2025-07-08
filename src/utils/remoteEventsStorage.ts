import { auth } from '@/services/firebase';
import { saveRemoteEventsToFirestore } from '@/services/firestore/remoteEvents';
import type { IEvent } from '@/types/IEvent';

export function saveRemoteEvents(events: IEvent[]): void {
  const uid = auth.currentUser?.uid;
  if (uid) {
    saveRemoteEventsToFirestore(uid, events).catch(err =>
      console.error('Failed to save remote events to Firestore', err),
    );
  }
}
