import { DateTime } from 'luxon';

import type { ICalendar } from '@/types/ICalendar';
import { IcsCalendar } from '@/types/icsCalendar';
import type { IEvent } from '@/types/IEvent';

// Fetch events from all configured ICS calendars
export async function fetchIcsEvents(
  calendars: IcsCalendar[],
  start?: Date,
  end?: Date,
): Promise<IEvent[]> {
  if (calendars.length === 0) return [];

  const clientZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

  const now = DateTime.now().setZone(clientZone);
  const startIso = (start ? DateTime.fromJSDate(start) : now.minus({ days: 1 }).startOf('day')).toISO()!;
  const endIso = (end ? DateTime.fromJSDate(end) : now.plus({ days: 1 }).endOf('day')).toISO()!;

  const base = new URL('/api/ics-calendar', window.location.origin);
  base.searchParams.set('timezone', clientZone);
  base.searchParams.set('startDate', startIso);
  base.searchParams.set('endDate', endIso);

  const fetches = calendars.map(cal => {
    const url = new URL(base);
    url.searchParams.set('url', cal.source);
    url.searchParams.set('id', cal.id);
    url.searchParams.set('name', cal.title);
    url.searchParams.set('color', cal.color);
    return fetch(url.toString())
      .then(async res => {
        if (!res.ok) {
          const errorJson = (await res.json().catch(() => null)) as {
            error?: string;
          } | null;
          throw new Error(errorJson?.error ?? 'Failed to fetch ICS events');
        }
        const events = (await res.json()) as IEvent[];
        return events.map(ev => ({
          id: ev.id,
          start: new Date(ev.start),
          end: new Date(ev.end),
          title: ev.title,
          attendeeCount: ev.attendeeCount,
          calendar: ev.calendar as ICalendar,
        }));
      })
      .catch(err => {
        console.error('ICS fetch failed', err);
        return [] as IEvent[];
      });
  });

  const results = await Promise.all(fetches);
  return results.flat();
}
