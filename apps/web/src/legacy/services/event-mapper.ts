import type { GoogleCalendar, GoogleCalendarEvent } from '@/legacy/services/api';
import type { Event } from '@/legacy/types/Event';
import type { ICalendar } from '@/legacy/types/ICalendar';

export function mapGoogleEventToEvent(
  event: GoogleCalendarEvent & { calendarId?: string },
  calendars: GoogleCalendar[],
): Event | null {
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

    const isAllDay = Boolean(event.start.date) && Boolean(event.end.date);
    const parseDate = (value: string) =>
      isAllDay ? new Date(`${value}T00:00:00`) : new Date(value);

    const start = parseDate(startTime);
    const end = parseDate(endTime);
    if (isAllDay) {
      end.setDate(end.getDate() - 1);
      end.setHours(23, 59, 59, 999);
    }

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
      allDay: isAllDay,
      description: event.description || '',
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
): Event[] {
  return events
    .map(event => mapGoogleEventToEvent(event, calendars))
    .filter((evt): evt is Event => evt !== null)
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
}
