// Shared helpers for canonical event caching and range filtering

import { addDays } from 'date-fns';
import type { Event } from 'src/legacy/types/Event';

export const EVENT_CACHE_KEYS = {
  google: {
    fetch: 'google-events:fetch',
    cache: 'google-events:cache',
    range: 'google-events:range',
  },
  ics: {
    fetch: 'ics-events:fetch',
    cache: 'ics-events:cache',
    range: 'ics-events:range',
  },
} as const;

export type EventSource = 'google' | 'ics';

// Convert Date-like to epoch ms, NaN for invalid
export function toTime(value: Date | string | number): number {
  const t = new Date(value).getTime();
  return Number.isNaN(t) ? NaN : t;
}

// Compose a source-aware identity to avoid cross-provider id collisions
export function cacheIdentity(ev: Event, source: EventSource): string {
  return `${source}:${ev.id}`;
}

// Choose the newest by updatedAt, fallback to existing
export function pickNewest(existing: Event | undefined, incoming: Event): Event {
  if (!existing) return incoming;
  const a = existing.updatedAt ? toTime(existing.updatedAt) : -1;
  const b = incoming.updatedAt ? toTime(incoming.updatedAt) : -1;
  return b > a ? incoming : existing;
}

// Merge incoming events into previous, de-duped by source-aware identity
export function mergeEventsById(
  previous: Event[] | undefined,
  incoming: Event[],
  source: EventSource,
): Event[] {
  const map = new Map<string, Event>();
  for (const ev of previous ?? []) map.set(cacheIdentity(ev, source), ev);
  for (const ev of incoming) {
    const key = cacheIdentity(ev, source);
    map.set(key, pickNewest(map.get(key), ev));
  }
  return Array.from(map.values());
}

// Overlap test with open interval defaults and guards
export function isEventOverlappingRange(ev: Event, range: { start?: Date; end?: Date }): boolean {
  const startMs = range.start ? toTime(range.start) : Number.NEGATIVE_INFINITY;
  const endMs = range.end ? toTime(range.end) : Number.POSITIVE_INFINITY;
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) return true;
  const evStart = toTime(ev.start);
  const evEnd = toTime(ev.end);
  if (Number.isNaN(evStart) || Number.isNaN(evEnd)) return false;
  return evStart < endMs && evEnd > startMs;
}

// Filter events by overlap with range
export function filterEventsByRange(
  events: Event[] | undefined,
  range: { start?: Date; end?: Date },
): Event[] {
  if (!events || events.length === 0) return [];
  return events.filter(ev => isEventOverlappingRange(ev, range));
}

// Expands the interval with buffer for pruning
export function expandRangeWithBuffer(
  range: { start?: Date; end?: Date },
  beforeDays = 60,
  afterDays = 60,
): { start?: Date; end?: Date } {
  const now = new Date();
  const baseStart = range.start ?? now;
  const baseEnd = range.end ?? now;
  return {
    start: addDays(baseStart, -beforeDays),
    end: addDays(baseEnd, afterDays),
  };
}

// Keeps only events inside expanded range
export function pruneByRangeWithBuffer(
  events: Event[],
  range: { start?: Date; end?: Date },
  beforeDays = 60,
  afterDays = 60,
): Event[] {
  const expanded = expandRangeWithBuffer(range, beforeDays, afterDays);
  return filterEventsByRange(events, expanded);
}
