import ICAL from 'ical.js';
import { DateTime } from 'luxon';
import { NextRequest, NextResponse } from 'next/server';

import type { ICalendar } from '@/types/ICalendar';
import type { IEvent } from '@/types/IEvent';

function toDateInZone(time: ICAL.Time | Date, zone: string): Date {
  if (time instanceof Date) {
    return DateTime.fromJSDate(time).setZone(zone).toJSDate();
  }
  if (time.isDate && (!time.zone || time.zone.tzid === 'floating')) {
    return DateTime.fromObject({ year: time.year, month: time.month, day: time.day }, { zone })
      .startOf('day')
      .toJSDate();
  }
  return DateTime.fromJSDate(time.toJSDate()).setZone(zone).toJSDate();
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
        let e = toDateInZone(endDate, zone);
        if (startDate.isDate && endDate.isDate) {
          e = new Date(e);
          e.setDate(e.getDate() - 1);
          e.setHours(23, 59, 59, 999);
        }
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
      let e = toDateInZone(ev.endDate, zone);
      if (ev.startDate.isDate && ev.endDate.isDate) {
        e = new Date(e);
        e.setDate(e.getDate() - 1);
        e.setHours(23, 59, 59, 999);
      }
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
  const url = params.get('url');
  const calId = params.get('id');
  const calName = params.get('name');
  const calColorParam = params.get('color') ?? '#0078D4';
  const zone = params.get('timezone') || 'UTC';
  const sIso = params.get('startDate');
  const eIso = params.get('endDate');

  if (!url || !calId || !calName || !sIso || !eIso) {
    return NextResponse.json(
      { error: 'missing url, id, name, startDate or endDate' },
      { status: 400 },
    );
  }

  const start = DateTime.fromISO(sIso, { zone }).toJSDate();
  const end = DateTime.fromISO(eIso, { zone }).toJSDate();
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return NextResponse.json({ error: 'invalid date format' }, { status: 400 });
  }

  let icalText: string;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(res.statusText);
    icalText = await res.text();
  } catch (err) {
    console.error('Failed to fetch ICS', err);
    return NextResponse.json({ error: 'could not load ICS' }, { status: 500 });
  }

  const jcal = ICAL.parse(icalText);
  const root = new ICAL.Component(jcal);

  const calendarColor = calColorParam.startsWith('#') ? calColorParam : `#${calColorParam}`;
  const calendarMeta: ICalendar = {
    id: calId,
    name: calName,
    color: calendarColor,
  };
  const events = extractEvents(root, zone, start, end, calendarMeta);
  return NextResponse.json(events);
}
