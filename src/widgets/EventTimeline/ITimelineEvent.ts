import type { Event } from '@/types/Event';

export type EventStatus = 'past' | 'current' | 'future';

export interface ITimelineEvent extends Event {
  level: number;
  status: EventStatus;
  startPosition: number;
  width: number;
}
