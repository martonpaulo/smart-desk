'use client';

import { ReactNode, useEffect } from 'react';

import { onAuthStateChanged } from 'firebase/auth';

import { auth } from '@/services/firebase';
import { subscribeToBoard } from '@/services/firestore/board';
import { subscribeToHiddenEvents } from '@/services/firestore/hiddenEvents';
import { subscribeToIcsCalendars } from '@/services/firestore/icsCalendars';
import { subscribeToLocalEvents } from '@/services/firestore/localEvents';
import { subscribeToRemoteEvents } from '@/services/firestore/remoteEvents';
import { subscribeToTagPresets } from '@/services/firestore/tagPresets';
import { subscribeToTodoPrefs } from '@/services/firestore/todoPrefs';
import { useEventStore } from '@/store/eventStore';
import { useTodoBoardStore } from '@/store/todoBoardStore';
import { useTodoPrefsStore } from '@/store/todoPrefsStore';
import type { IcsCalendarConfig } from '@/types/IcsCalendarConfig';
import { loadHiddenEventIds, saveHiddenEventIds } from '@/utils/hiddenEventsStorage';
import { loadLocalEvents } from '@/utils/localEventsStorage';
import { getStoredFilters, setStoredFilters } from '@/utils/localStorageUtils';
import { saveTagPresets, TAG_PRESETS_KEY } from '@/utils/tagPresetsStorage';
import { DEFAULT_BOARD } from '@/widgets/TodoList/boardStorage';

const ICS_STORAGE_KEY = 'ics-calendars';

interface FirestoreSyncProviderProps {
  children: ReactNode;
}

export function FirestoreSyncProvider({ children }: FirestoreSyncProviderProps) {
  const setBoard = useTodoBoardStore(state => state.setBoard);
  const setLocalEvents = useEventStore(state => state.setLocalEvents);
  const setRemoteEvents = useEventStore(state => state.setRemoteEvents);
  const setHiddenEvents = useEventStore(state => state.setHiddenEvents);
  const setPrefs = useTodoPrefsStore(state => state.setPrefs);

  useEffect(() => {
    let unsubBoard: (() => void) | undefined;
    let unsubEvents: (() => void) | undefined;
    let unsubCalendars: (() => void) | undefined;
    let unsubRemote: (() => void) | undefined;
    let unsubHidden: (() => void) | undefined;
    let unsubPresets: (() => void) | undefined;
    let unsubPrefs: (() => void) | undefined;

    const stopListening = () => {
      unsubBoard?.();
      unsubEvents?.();
      unsubCalendars?.();
      unsubRemote?.();
      unsubHidden?.();
      unsubPresets?.();
      unsubPrefs?.();
      unsubBoard = undefined;
      unsubEvents = undefined;
      unsubCalendars = undefined;
      unsubRemote = undefined;
      unsubHidden = undefined;
      unsubPresets = undefined;
      unsubPrefs = undefined;
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
        unsubRemote = subscribeToRemoteEvents(user.uid, ev => {
          setRemoteEvents(ev);
        });
        unsubHidden = subscribeToHiddenEvents(user.uid, ids => {
          setHiddenEvents(ids);
          saveHiddenEventIds(ids);
        });
        unsubPresets = subscribeToTagPresets(user.uid, presets => {
          saveTagPresets(presets);
        });
        unsubPrefs = subscribeToTodoPrefs(user.uid, prefs => {
          if (prefs) setPrefs(prefs);
        });
      } else {
        // fallback to localStorage when signed out
        setBoard(DEFAULT_BOARD);
        setLocalEvents(loadLocalEvents());
        setRemoteEvents([]);
        setHiddenEvents(loadHiddenEventIds());
        const stored = getStoredFilters<IcsCalendarConfig[]>(ICS_STORAGE_KEY) ?? [];
        setStoredFilters(ICS_STORAGE_KEY, stored);
        saveTagPresets(getStoredFilters(TAG_PRESETS_KEY) ?? []);
      }
    });
  }, [setBoard, setLocalEvents, setRemoteEvents, setHiddenEvents, setPrefs]);

  return <>{children}</>;
}
