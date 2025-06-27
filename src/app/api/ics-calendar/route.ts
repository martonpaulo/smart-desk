import ICAL from 'ical.js';
import { DateTime } from 'luxon';
import { NextRequest, NextResponse } from 'next/server';

import type { ICalendar } from '@/types/ICalendar';
import type { IEvent } from '@/types/IEvent';

const ICS_URL = process.env.ICS_CALENDAR_URL!;
const CAL_ID = process.env.ICS_CALENDAR_ID!;
const CAL_NAME = process.env.ICS_CALENDAR_NAME!;
const CAL_COLOR = process.env.ICS_CALENDAR_COLOR!;

// simple in-memory cache
let cachedEtag: string | null = null;
let cachedLastModified: string | null = null;
let cachedIcalComponent: ICAL.Component | null = null;

// fetch with conditional headers
async function loadCalendar(): Promise<ICAL.Component> {
  if (!ICS_URL) throw new Error('ICS_CALENDAR_URL is missing');

  const headers: Record<string, string> = {};
  if (cachedEtag) headers['If-None-Match'] = cachedEtag;
  if (cachedLastModified) headers['If-Modified-Since'] = cachedLastModified;

  const res = await fetch(ICS_URL, { headers });
  if (res.status === 304) {
    if (!cachedIcalComponent) {
      throw new Error('Got 304 Not Modified but no cache available');
    }
    return cachedIcalComponent;
  }
  if (!res.ok) {
    throw new Error(`fetch ICS failed: ${res.statusText}`);
  }

  const text = await res.text();
  // update cache
  cachedEtag = res.headers.get('etag');
  cachedLastModified = res.headers.get('last-modified');
  const jcal = ICAL.parse(text);
  cachedIcalComponent = new ICAL.Component(jcal);
  return cachedIcalComponent;
}

function getCalendarColor(): string {
  if (!CAL_COLOR) {
    console.warn('ICS_CALENDAR_COLOR is not set, using default color');
    return '#0078D4';
  }
  return CAL_COLOR.startsWith('#') ? CAL_COLOR : `#${CAL_COLOR}`;
}

function toDateInZone(time: ICAL.Time | Date, zone: string): Date {
  const d = time instanceof Date ? time : time.toJSDate();
  return DateTime.fromJSDate(d).setZone(zone).toJSDate();
}

function extractEvents(
  root: ICAL.Component,
  zone: string,
  start: Date,
  end: Date,
  calendarMeta: ICalendar,
): IEvent[] {
  const events: IEvent[] = [];
  const comps = root.getAllSubcomponents('vevent');

  for (const comp of comps) {
    const ev = new ICAL.Event(comp);
    const uid = ev.uid;
    const baseTitle = ev.summary || '';
    const baseCount = comp.getAllProperties('attendee').length;

    if (ev.isRecurring()) {
      const iter = ev.iterator();
      let nextTime;
      while ((nextTime = iter.next())) {
        const { startDate, endDate, item } = ev.getOccurrenceDetails(nextTime);
        const s = toDateInZone(startDate, zone);
        const e = toDateInZone(endDate, zone);
        if (e < start) continue;
        if (s > end) break;
        events.push({
          id: uid,
          start: s,
          end: e,
          title: item.summary || baseTitle,
          attendeeCount: item.component.getAllProperties('attendee').length,
          calendar: calendarMeta,
        });
      }
    } else {
      const s = toDateInZone(ev.startDate, zone);
      const e = toDateInZone(ev.endDate, zone);
      if (e < start || s > end) continue;
      events.push({
        id: uid,
        start: s,
        end: e,
        title: baseTitle,
        attendeeCount: baseCount,
        calendar: calendarMeta,
      });
    }
  }

  return events.sort((a, b) => a.start.getTime() - b.start.getTime());
}

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const zone = params.get('timezone') || 'UTC';
  const sIso = params.get('startDate');
  const eIso = params.get('endDate');
  if (!sIso || !eIso) {
    return NextResponse.json({ error: 'missing startDate or endDate' }, { status: 400 });
  }

  const start = DateTime.fromISO(sIso, { zone }).toJSDate();
  const end = DateTime.fromISO(eIso, { zone }).toJSDate();
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return NextResponse.json({ error: 'invalid date format' }, { status: 400 });
  }

  let root: ICAL.Component;
  try {
    root = await loadCalendar();
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'could not load ICS' }, { status: 500 });
  }

  const calendarColor = getCalendarColor();
  const calendarMeta: ICalendar = { id: CAL_ID, name: CAL_NAME, color: calendarColor };
  const events = extractEvents(root, zone, start, end, calendarMeta);
  return NextResponse.json(events);
}
