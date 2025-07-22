import { create } from 'zustand';

import type { Event } from '@/types/Event';
import { mergeEvents } from '@/utils/eventUtils';
import { loadHiddenEventIds, saveHiddenEventIds } from '@/utils/hiddenEventsStorage';

interface EventState {
  events: Event[];
  remoteEvents: Event[];
  localEvents: Event[];
  trash: Event[];
  hiddenEvents: string[];
  setLocalEvents: (events: Event[]) => void;
  setRemoteEvents: (list: Event[]) => void;
  addLocalEvent: (event: Event) => void;
  updateLocalEvent: (event: Event) => void;
  deleteEvent: (id: string) => void;
  restoreEvent: (id: string) => void;
  setAlertAcknowledged: (id: string) => void;
}

export const useEventStore = create<EventState>((set, get) => ({
  events: [],
  remoteEvents: [],
  localEvents: [],
  trash: [],
  hiddenEvents: [],
  setLocalEvents: events => set({ localEvents: events }),
  setRemoteEvents: list => {
    const mergedEvents = mergeEvents(get().localEvents, list);
    set({ remoteEvents: list, events: mergedEvents });
  },
  addLocalEvent: event => {
    set(state => {
      const newEvents = [...state.localEvents, event];
      const mergedEvents = mergeEvents(newEvents, state.remoteEvents);
      return { localEvents: newEvents, events: mergedEvents };
    });
  },
  updateLocalEvent: event => {
    set(state => {
      const updatedEvents = state.localEvents.map(e => (e.id === event.id ? event : e));
      const mergedEvents = mergeEvents(updatedEvents, state.remoteEvents);
      return { localEvents: updatedEvents, events: mergedEvents };
    });
  },
  deleteEvent: id => {
    set(state => {
      const updatedLocalEvents = state.localEvents.filter(e => e.id !== id);
      const updatedRemoteEvents = state.remoteEvents.filter(e => e.id !== id);
      const mergedEvents = mergeEvents(updatedLocalEvents, updatedRemoteEvents);
      return {
        localEvents: updatedLocalEvents,
        remoteEvents: updatedRemoteEvents,
        events: mergedEvents,
        trash: [...state.trash, ...state.events.filter(e => e.id === id)],
      };
    });
  },
  restoreEvent: id => {
    set(state => {
      const restoredEvent = state.trash.find(e => e.id === id);
      if (!restoredEvent) return state;

      const updatedTrash = state.trash.filter(e => e.id !== id);
      const updatedLocalEvents = [...state.localEvents, restoredEvent];
      const mergedEvents = mergeEvents(updatedLocalEvents, state.remoteEvents);

      return {
        localEvents: updatedLocalEvents,
        events: mergedEvents,
        trash: updatedTrash,
      };
    });
  },
  setAlertAcknowledged: id => {
    set(state => {
      const updatedEvents = state.events.map(e => (e.id === id ? { ...e, acknowledged: true } : e));
      return { events: updatedEvents };
    });
  },
  loadHiddenEvents: () => {
    const hiddenIds = loadHiddenEventIds();
    set({ hiddenEvents: hiddenIds });
  },
  saveHiddenEvents: () => {
    const hiddenIds = get().hiddenEvents;
    saveHiddenEventIds(hiddenIds);
  },
  toggleHiddenEvent: (id: string) => {
    set(state => {
      const hiddenEvents = state.hiddenEvents.includes(id)
        ? state.hiddenEvents.filter(hid => hid !== id)
        : [...state.hiddenEvents, id];
      return { hiddenEvents };
    });
  },
  clearHiddenEvents: () => {
    set({ hiddenEvents: [] });
    saveHiddenEventIds([]);
  },
}));
