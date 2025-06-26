import { create } from 'zustand';

import type { IEvent } from '@/types/IEvent';

interface EventState {
  events: IEvent[];
  setEvents: (list: IEvent[]) => void;
  setAlertAcknowledged: (id: string) => void;
}

export const useEventStore = create<EventState>(set => ({
  events: [],
  setEvents: list => set({ events: list }),
  setAlertAcknowledged: id =>
    set(state => ({
      events: state.events.map(event =>
        event.id === id ? { ...event, aknowledged: true } : event,
      ),
    })),
}));
