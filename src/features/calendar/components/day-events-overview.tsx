'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDayEvents } from '@/features/calendar/hooks/use-day-events';

const DEFAULT_FORMAT_LOCALE = 'en-US';

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
  const { data: events = [] } = useDayEvents();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Today Calendar</CardTitle>
        <p className="text-sm text-muted-foreground">{todayLabel}</p>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <p className="text-muted-foreground">
            No events for today yet. Connect Google Calendar and sync events to see them here.
          </p>
        ) : (
          <ul className="space-y-2">
            {events.map(event => (
              <li key={event.id} className="rounded-md border p-3">
                <p className="font-medium">{event.title}</p>
                {event.allDay ? (
                  <p className="text-sm text-muted-foreground">All day</p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {formatTimeLabel(event.startsAt)} - {formatTimeLabel(event.endsAt)}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
