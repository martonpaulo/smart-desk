import type { Event } from 'src/legacy/types/Event';
import { ITimelineEvent } from 'src/legacy/types/ITimelineEvent';
import { computeEventStatus } from 'src/legacy/utils/eventUtils';
interface Bounds {
  startPercent: number;
  widthPercent: number;
}

interface HourIndicator {
  hourOfDay: number;
  relativePosition: number;
}

function calculateEventBounds(
  event: Event,
  referenceTime: Date,
  pastHours: number,
  futureHours: number,
): Bounds {
  const startRatio = calculateRelativePosition(
    new Date(event.start),
    referenceTime,
    pastHours,
    futureHours,
  );
  const endRatio = calculateRelativePosition(
    new Date(event.end),
    referenceTime,
    pastHours,
    futureHours,
  );

  const startPercent = Math.max(0, startRatio * 100);
  const endPercent = Math.min(100, endRatio * 100);
  return { startPercent, widthPercent: endPercent - startPercent };
}

function calculateRelativePosition(
  target: Date,
  reference: Date,
  pastHours: number,
  futureHours: number,
): number {
  const rangeStart = new Date(reference);
  rangeStart.setHours(reference.getHours() - pastHours);

  const rangeEnd = new Date(reference);
  rangeEnd.setHours(reference.getHours() + futureHours);

  const totalMs = rangeEnd.getTime() - rangeStart.getTime();
  const elapsedMs = target.getTime() - rangeStart.getTime();
  return elapsedMs / totalMs;
}

function isHourBoundary(date: Date): boolean {
  return date.getMinutes() === 0 && date.getSeconds() === 0 && date.getMilliseconds() === 0;
}

function getNextHourBoundary(date: Date): Date {
  const next = new Date(date);
  if (isHourBoundary(next)) return next;

  next.setMinutes(0, 0, 0);
  next.setHours(next.getHours() + 1);
  return next;
}

export function layoutTimelineEvents(
  events: Event[],
  referenceTime: Date,
  pastHours: number,
  futureHours: number,
): ITimelineEvent[] {
  const endTimesByLevel: number[] = [];
  const result: ITimelineEvent[] = [];

  for (const event of events) {
    const startMs = new Date(event.start).getTime();
    let level = 0;

    while (level < endTimesByLevel.length && endTimesByLevel[level] > startMs) {
      level++;
    }

    const endMs = new Date(event.end).getTime();
    if (level >= endTimesByLevel.length) {
      endTimesByLevel.push(endMs);
    } else {
      endTimesByLevel[level] = endMs;
    }

    const { startPercent, widthPercent } = calculateEventBounds(
      event,
      referenceTime,
      pastHours,
      futureHours,
    );

    if (widthPercent > 0) {
      result.push({
        ...event,
        level,
        status: computeEventStatus(event, referenceTime),
        startPosition: startPercent,
        width: widthPercent,
      });
    }
  }

  return result;
}

export function generateHourlyIndicators(
  referenceTime: Date,
  pastHours: number,
  futureHours: number,
): HourIndicator[] {
  const totalHours = pastHours + futureHours;
  const rangeStart = new Date(referenceTime);
  rangeStart.setHours(referenceTime.getHours() - pastHours);

  const firstFullHour = getNextHourBoundary(rangeStart);
  const indicators: HourIndicator[] = [];

  for (let i = 0; i < totalHours; i++) {
    const hourDate = new Date(firstFullHour);
    hourDate.setHours(firstFullHour.getHours() + i);
    indicators.push({
      hourOfDay: hourDate.getHours(),
      relativePosition:
        calculateRelativePosition(hourDate, referenceTime, pastHours, futureHours) * 100,
    });
  }

  return indicators;
}

export function formatHourLabel(hour: number): string {
  if (hour === 0) return '12 AM';
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return '12 PM';
  return `${hour - 12} PM`;
}

export function calculateCurrentTimePercentage(pastHours: number, futureHours: number): number {
  return (pastHours / (pastHours + futureHours)) * 100;
}
