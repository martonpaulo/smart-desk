'use client';

import { ReactNode, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/services/firebase';
import { subscribeToBoard } from '@/services/firestore/board';
import { subscribeToLocalEvents } from '@/services/firestore/localEvents';
import { subscribeToIcsCalendars } from '@/services/firestore/icsCalendars';
import { useTodoBoardStore } from '@/store/todoBoardStore';
import { DEFAULT_BOARD } from '@/widgets/TodoList/boardStorage';
import { useEventStore } from '@/store/eventStore';
import { loadLocalEvents } from '@/utils/localEventsStorage';
import type { IcsCalendarConfig } from '@/types/IcsCalendarConfig';
import { getStoredFilters, setStoredFilters } from '@/utils/localStorageUtils';

const ICS_STORAGE_KEY = 'ics-calendars';

interface FirestoreSyncProviderProps {
  children: ReactNode;
}

export function FirestoreSyncProvider({ children }: FirestoreSyncProviderProps) {
  const setBoard = useTodoBoardStore(state => state.setBoard);
  const setLocalEvents = useEventStore(state => state.setLocalEvents);

  useEffect(() => {
    let unsubBoard: (() => void) | undefined;
    let unsubEvents: (() => void) | undefined;
    let unsubCalendars: (() => void) | undefined;

    const stopListening = () => {
      unsubBoard?.();
      unsubEvents?.();
      unsubCalendars?.();
      unsubBoard = undefined;
      unsubEvents = undefined;
      unsubCalendars = undefined;
    };

    return onAuthStateChanged(auth, user => {
      stopListening();
      if (user) {
        unsubBoard = subscribeToBoard(user.uid, board => {
          setBoard(board ?? DEFAULT_BOARD);
        });
        unsubEvents = subscribeToLocalEvents(user.uid, events => {
          setLocalEvents(events);
        });
        unsubCalendars = subscribeToIcsCalendars(user.uid, calendars => {
          setStoredFilters(ICS_STORAGE_KEY, calendars);
        });
      } else {
        // fallback to localStorage when signed out
        setBoard(DEFAULT_BOARD);
        setLocalEvents(loadLocalEvents());
        const stored = getStoredFilters<IcsCalendarConfig[]>(ICS_STORAGE_KEY) ?? [];
        setStoredFilters(ICS_STORAGE_KEY, stored);
      }
    });
  }, [setBoard, setLocalEvents]);

  return <>{children}</>;
}
