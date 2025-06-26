import { useEffect, useRef } from 'react';

import { IEvent } from '@/types/IEvent';
import { ISpeechStatus } from '@/types/ISpeechStatus';
import { isTimeAvailable } from '@/utils/eventUtils';

interface UseTimeAnnouncementOptions {
  now: Date;
  events: IEvent[];
  audioEnabled: boolean;
  intervalMinutes: number;
  includeMeetings: boolean;
  startSpeech: () => void;
  speechStatus: ISpeechStatus;
  isInQueue: boolean;
}

export function useTimeAnnouncement({
  now,
  events,
  audioEnabled,
  intervalMinutes,
  includeMeetings,
  startSpeech,
  speechStatus,
  isInQueue,
}: UseTimeAnnouncementOptions) {
  const lastSlotKey = useRef<number | null>(null);

  useEffect(() => {
    if (!audioEnabled) return;

    const minute = now.getMinutes();
    // reset slot if we're off-increment
    if (minute % intervalMinutes !== 0) {
      lastSlotKey.current = null;
      return;
    }

    const slot = now.getHours() * 60 + minute;
    if (slot === lastSlotKey.current) return;

    const free = isTimeAvailable(events, now);
    if (!includeMeetings && !free) return;
    if (speechStatus === 'started' || isInQueue) return;

    startSpeech();
    lastSlotKey.current = slot;
  }, [
    now,
    events,
    audioEnabled,
    intervalMinutes,
    includeMeetings,
    speechStatus,
    isInQueue,
    startSpeech,
  ]);
}
