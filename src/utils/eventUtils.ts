import { DateTime } from 'luxon';

import type { Event } from '@/types/Event';
import { EventStatus } from '@/types/ITimelineEvent';

const FULL_DAY_MS = 24 * 60 * 60 * 1000;

export function computeEventStatus(event: Event, now?: Date): EventStatus {
  if (!now) now = new Date();
  const nowMs = now.getTime();
  const startMs = new Date(event.start).getTime();
  const endMs = new Date(event.end).getTime();

  if (nowMs < startMs) return 'future';
  if (nowMs > endMs) return 'past';
  return 'current';
}

export function filterNonFullDayEvents(events: Event[]): Event[] {
  return events.filter(event => {
    const startMs = new Date(event.start).getTime();
    const endMs = new Date(event.end).getTime();
    return endMs - startMs < FULL_DAY_MS && !event.allDay;
  });
}

export function filterFullDayEventsForTodayInUTC(events: Event[], now?: Date): Event[] {
  if (!now) now = new Date();

  const today = DateTime.fromJSDate(now);
  const todayStart = today.startOf('day').toJSDate().getTime();
  const todayEnd = today.endOf('day').toJSDate().getTime();

  return events.filter(({ start, end }) => {
    // Convert event times to UTC for consistent comparison
    const timezoneOffset = now.getTimezoneOffset() * 60 * 1000; // convert minutes to milliseconds
    const eventStart = new Date(start).getTime() + timezoneOffset;
    const eventEnd = new Date(end).getTime() + timezoneOffset;

    // First check if it's a full-day event
    const isFullDay = eventEnd - eventStart >= FULL_DAY_MS;

    // Then check if it overlaps with today
    return (
      isFullDay &&
      ((eventStart > todayStart && eventStart < todayEnd) ||
        (eventEnd > todayStart && eventEnd < todayEnd) ||
        (eventStart < todayStart && eventEnd > todayEnd))
    );
  });
}

export function filterCurrentOrFutureEvents(events: Event[], now?: Date): Event[] {
  if (!now) now = new Date();
  return events.filter(event => {
    const status = computeEventStatus(event, now);
    return status === 'current' || status === 'future';
  });
}

export function filterTodayEvents(events: Event[], now?: Date): Event[] {
  if (!now) now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  return events.filter(event => {
    const start = new Date(event.start);
    const end = new Date(event.end);

    return (
      (start >= todayStart && start <= todayEnd) ||
      (end >= todayStart && end <= todayEnd) ||
      (start < todayStart && end > todayEnd)
    );
  });
}

export function sortEventsByStart(events: Event[]): Event[] {
  return [...events].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
}

export function calculateMinutesUntilEvent(event: Event, now?: Date): number {
  if (!now) now = new Date();
  const startMs = new Date(event.start).getTime();
  const nowMs = now.getTime();
  const minutesUntilStart = Math.ceil((startMs - nowMs) / (60 * 1000));

  return minutesUntilStart;
}

export function formattedTime(date: Date | string): string {
  const dateObj = new Date(date);
  return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function formatEventTimeRange(event: Event): string {
  const start = new Date(event.start);
  const end = new Date(event.end);

  const startTime = formattedTime(start);
  const endTime = formattedTime(end);

  return `${startTime} - ${endTime}`;
}

export function getUpcomingEventLabel(event: Event, now?: Date): string {
  const eventStatus = computeEventStatus(event, now);
  const minutesUntilEvent = calculateMinutesUntilEvent(event, now);
  if (eventStatus === 'past') return 'past';
  if (eventStatus === 'current') return 'now';
  if (minutesUntilEvent < 1) return 'starting soon';
  return `in ${minutesUntilEvent} min`;
}

export function getAttendeeCountLabel(event: Event): string {
  if (!event.attendeeCount) return '';
  if (event.attendeeCount < 2) return '';
  return `${event.attendeeCount} attendees`;
}

export function isTimeAvailable(events: Event[], time: Date): boolean {
  const timeObj = new Date(time);
  const timeMs = timeObj.getTime();
  return !events.some(event => {
    const startMs = new Date(event.start).getTime();
    const endMs = new Date(event.end).getTime();
    return timeMs >= startMs && timeMs <= endMs;
  });
}

function areEventsEqual(firstEvent: Event, secondEvent: Event): boolean {
  const firstEventStart = new Date(firstEvent.start);
  const firstEventEnd = new Date(firstEvent.end);
  const secondEventStart = new Date(secondEvent.start);
  const secondEventEnd = new Date(secondEvent.end);

  return (
    firstEvent.id === secondEvent.id &&
    firstEvent.title === secondEvent.title &&
    firstEventStart.getTime() === secondEventStart.getTime() &&
    firstEventEnd.getTime() === secondEventEnd.getTime() &&
    firstEvent.attendeeCount === secondEvent.attendeeCount &&
    firstEvent.calendar?.id === secondEvent.calendar?.id
  );
}

export function mergeEvents(prevEvents: Event[], nextEvents: Event[]): Event[] {
  const prevEventsMap = new Map(prevEvents.map(event => [event.id, event]));
  const mergedEvents: Event[] = [];

  for (const event of nextEvents) {
    const oldObj = prevEventsMap.get(event.id);
    mergedEvents.push(oldObj && areEventsEqual(oldObj, event) ? oldObj : event);
  }

  return mergedEvents;
}
