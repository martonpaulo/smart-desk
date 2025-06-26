import { DateTime } from 'luxon';

import type { ICalendar } from '@/types/ICalendar';
import type { IEvent } from '@/types/IEvent';

// fetch ICS/Outlook events for yesterday, today, and tomorrow
export async function fetchOutlookEvents(): Promise<IEvent[]> {
  // determine client timezone, default to UTC
  const clientZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  const now = DateTime.now().setZone(clientZone);

  // compute window: yesterday 00:00 to tomorrow 23:59
  const startIso = now.minus({ days: 1 }).startOf('day').toISO()!;
  const endIso = now.plus({ days: 1 }).endOf('day').toISO()!;

  const endpoint = new URL('/api/outlook-calendar', window.location.origin);
  endpoint.searchParams.set('timezone', clientZone);
  endpoint.searchParams.set('startDate', startIso);
  endpoint.searchParams.set('endDate', endIso);

  const response = await fetch(endpoint.toString());

  if (!response.ok) {
    // attempt to read error message from JSON
    const errorJson = (await response.json().catch(() => null)) as { error?: string } | null;
    const message = errorJson?.error ?? 'Failed to fetch Outlook events';
    throw new Error(message);
  }

  // API returns plain array of IEvent
  const events = (await response.json()) as IEvent[];

  // convert ISO strings to Date objects
  return events.map(event => ({
    id: event.id,
    start: new Date(event.start),
    end: new Date(event.end),
    title: event.title,
    attendeeCount: event.attendeeCount,
    calendar: event.calendar as ICalendar,
  }));
}
