'use client';

import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDayEvents } from '@/features/calendar/hooks/use-day-events';
import type { CalendarEvent } from '@/features/calendar/types/calendar-event';

const DEFAULT_FORMAT_LOCALE = 'en-US';
const DEFAULT_CALENDAR_COLOR = '#9aa0a6';
const EVENT_LABEL_FALLBACK = 'Untitled event';
const TOAST_EVENT_ADDED_PREFIX = 'Added:';
const TOAST_EVENT_UPDATED_PREFIX = 'Updated:';
const TOAST_EVENT_REMOVED_PREFIX = 'Removed:';
const SKELETON_ROWS_COUNT = 3;

function getEventSignature(event: CalendarEvent): string {
  return JSON.stringify({
    title: event.title,
    startsAt: event.startsAt,
    endsAt: event.endsAt,
    allDay: event.allDay,
    calendarColor: event.calendarColor,
  });
}

function getEventLabel(event: CalendarEvent): string {
  return event.title.trim() || EVENT_LABEL_FALLBACK;
}

function formatTimeLabel(isoDate: string): string {
  return new Date(isoDate).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatTodayLabel(date: Date): string {
  return new Intl.DateTimeFormat(DEFAULT_FORMAT_LOCALE, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function DayEventsOverview() {
  const todayLabel = formatTodayLabel(new Date());
  const { data: events = [], isLoading, isFetched } = useDayEvents();
  const previousEventsRef = useRef<Map<string, { signature: string; label: string }> | null>(null);

  useEffect(() => {
    if (!isFetched) {
      return;
    }

    const currentEvents = new Map(
      events.map(event => [event.id, { signature: getEventSignature(event), label: getEventLabel(event) }]),
    );

    const previousEvents = previousEventsRef.current;
    if (!previousEvents) {
      previousEventsRef.current = currentEvents;
      return;
    }

    for (const [eventId, currentEvent] of currentEvents) {
      const previousEvent = previousEvents.get(eventId);
      if (!previousEvent) {
        toast.info(`${TOAST_EVENT_ADDED_PREFIX} ${currentEvent.label}`);
        continue;
      }

      if (previousEvent.signature !== currentEvent.signature) {
        toast.info(`${TOAST_EVENT_UPDATED_PREFIX} ${currentEvent.label}`);
      }
    }

    for (const [eventId, previousEvent] of previousEvents) {
      if (!currentEvents.has(eventId)) {
        toast.info(`${TOAST_EVENT_REMOVED_PREFIX} ${previousEvent.label}`);
      }
    }

    previousEventsRef.current = currentEvents;
  }, [events, isFetched]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Today Calendar</CardTitle>
        <p className="text-sm text-muted-foreground">{todayLabel}</p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <ul className="space-y-2">
            {Array.from({ length: SKELETON_ROWS_COUNT }, (_, index) => (
              <li
                key={`event-skeleton-${index}`}
                aria-hidden
                className="rounded-md border p-3 animate-pulse"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-1 inline-block h-2.5 w-2.5 rounded-full bg-muted" />
                  <div className="w-full space-y-2">
                    <div className="h-4 w-2/3 rounded bg-muted" />
                    <div className="h-3 w-1/3 rounded bg-muted" />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
        {!isLoading && events.length === 0 ? (
          <p className="text-muted-foreground">
            No events for today yet. Connect Google Calendar and sync events to see them here.
          </p>
        ) : null}
        {!isLoading && events.length > 0 ? (
          <ul className="space-y-2">
            {events.map(event => (
              <li key={event.id} className="rounded-md border p-3">
                <div className="flex items-start gap-3">
                  <span
                    aria-hidden
                    className="mt-1 inline-block h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: event.calendarColor ?? DEFAULT_CALENDAR_COLOR }}
                  />
                  <div>
                    <p className="font-medium">{event.title}</p>
                    {event.allDay ? (
                      <p className="text-sm text-muted-foreground">All day</p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {formatTimeLabel(event.startsAt)} - {formatTimeLabel(event.endsAt)}
                      </p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </CardContent>
    </Card>
  );
}
