import type { GoogleCalendar, GoogleCalendarEvent } from '@/services/api';
import type { ICalendar } from '@/types/ICalendar';
import type { IEvent } from '@/types/IEvent';

export function mapGoogleEventToEvent(
  event: GoogleCalendarEvent & { calendarId?: string },
  calendars: GoogleCalendar[],
): IEvent | null {
  try {
    // Find the calendar for this event
    const calendar = calendars.find(cal => cal.id === event.calendarId);

    // Parse start and end times
    const startTime = event.start.dateTime || event.start.date;
    const endTime = event.end.dateTime || event.end.date;

    if (!startTime || !endTime) {
      console.warn('Event missing start or end time:', event.id);
      return null;
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    // Validate dates
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      console.warn('Invalid date in event:', event.id);
      return null;
    }

    // Skip all-day events that span multiple days or have invalid duration
    if (end <= start) {
      console.warn('Event has invalid duration:', event.id);
      return null;
    }

    const mappedCalendar: ICalendar | undefined = calendar
      ? {
          id: calendar.id,
          name: calendar.summary,
          color: calendar.backgroundColor,
        }
      : undefined;

    return {
      id: event.id,
      start,
      end,
      title: event.summary || 'Untitled Event',
      attendeeCount: event.attendees?.length || 0,
      calendar: mappedCalendar,
    };
  } catch (error) {
    console.error('Error mapping event:', event.id, error);
    return null;
  }
}

export function mapGoogleEventsToEvents(
  events: (GoogleCalendarEvent & { calendarId?: string })[],
  calendars: GoogleCalendar[],
): IEvent[] {
  return events
    .map(event => mapGoogleEventToEvent(event, calendars))
    .filter((evt): evt is IEvent => evt !== null)
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
}
