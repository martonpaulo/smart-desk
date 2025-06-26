import type { IEvent } from '@/types/IEvent';

export type IEventStatus = 'past' | 'current' | 'future';

export interface ITimelineEvent extends IEvent {
  level: number;
  status: IEventStatus;
  startPosition: number;
  width: number;
}
