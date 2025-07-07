import { create } from 'zustand';
import { mergeEvents } from '@/utils/eventUtils';
import type { IEvent } from '@/types/IEvent';
import { loadLocalEvents, saveLocalEvents } from '@/utils/localEventsStorage';

interface EventState {
  events: IEvent[];
  remoteEvents: IEvent[];
  localEvents: IEvent[];
  trash: IEvent[];
  setRemoteEvents: (list: IEvent[]) => void;
  addLocalEvent: (event: IEvent) => void;
  updateLocalEvent: (event: IEvent) => void;
  deleteEvent: (id: string) => void;
  restoreEvent: (id: string) => void;
  setAlertAcknowledged: (id: string) => void;
}

export const useEventStore = create<EventState>((set, get) => ({
  events: [],
  remoteEvents: [],
  localEvents: loadLocalEvents(),
  trash: [],
  setRemoteEvents: list => {
    const prev = get().remoteEvents;
    const merged = mergeEvents(prev, list);
    const localEvents = get().localEvents;
    set({ remoteEvents: merged, events: [...merged, ...localEvents] });
  },
  addLocalEvent: event =>
    set(state => {
      const localEvents = [...state.localEvents, event];
      saveLocalEvents(localEvents);
      return {
        localEvents,
        events: [...state.remoteEvents, ...localEvents],
      };
    }),
  updateLocalEvent: event =>
    set(state => {
      const localEvents = state.localEvents.map(e => (e.id === event.id ? event : e));
      saveLocalEvents(localEvents);
      return {
        localEvents,
        events: [...state.remoteEvents, ...localEvents],
      };
    }),
  deleteEvent: id =>
    set(state => {
      const event =
        state.localEvents.find(e => e.id === id) || state.remoteEvents.find(e => e.id === id);
      if (!event) return state;
      const localEvents = state.localEvents.filter(e => e.id !== id);
      const remoteEvents = state.remoteEvents.filter(e => e.id !== id);
      saveLocalEvents(localEvents);
      return {
        localEvents,
        remoteEvents,
        events: [...remoteEvents, ...localEvents],
        trash: [event, ...state.trash],
      };
    }),
  restoreEvent: id =>
    set(state => {
      const event = state.trash.find(e => e.id === id);
      if (!event) return state;
      const trash = state.trash.filter(e => e.id !== id);
      const localEvents = [...state.localEvents, event];
      saveLocalEvents(localEvents);
      return {
        trash,
        localEvents,
        events: [...state.remoteEvents, ...localEvents],
      };
    }),
  setAlertAcknowledged: id =>
    set(state => ({
      remoteEvents: state.remoteEvents.map(event =>
        event.id === id ? { ...event, aknowledged: true } : event,
      ),
      localEvents: state.localEvents.map(event =>
        event.id === id ? { ...event, aknowledged: true } : event,
      ),
      events: state.events.map(event => (event.id === id ? { ...event, aknowledged: true } : event)),
    })),
}));
