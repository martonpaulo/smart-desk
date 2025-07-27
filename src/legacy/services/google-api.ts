import axios, { type AxiosError } from 'axios';

import type {
  GoogleCalendar,
  GoogleCalendarEvent,
  GoogleCalendarListResponse,
  GoogleEventsResponse,
} from '@/legacy/services/api';

export class GoogleCalendarError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: unknown,
  ) {
    super(message);
    this.name = 'GoogleCalendarError';
  }
}

export class GoogleCalendarAPI {
  private baseURL = 'https://www.googleapis.com/calendar/v3';

  constructor(private accessToken: string) {
    if (!accessToken) {
      throw new GoogleCalendarError('Access token is required');
    }
  }

  private get headers() {
    return {
      Authorization: `Bearer ${this.accessToken.replace('Bearer ', '')}`,
      'Content-Type': 'application/json',
    };
  }

  private handleError(error: unknown, context: string): never {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      const status = axiosError.response?.status;
      const message = (axiosError.response?.data as string) || axiosError.message;

      switch (status) {
        case 401:
          throw new GoogleCalendarError('Authentication failed. Please sign in again.', 401, error);
        case 403:
          throw new GoogleCalendarError(
            'Access denied. Please check calendar permissions.',
            403,
            error,
          );
        case 404:
          throw new GoogleCalendarError('Calendar not found.', 404, error);
        case 429:
          throw new GoogleCalendarError('Rate limit exceeded. Please try again later.', 429, error);
        default:
          throw new GoogleCalendarError(`Failed to ${context}: ${message}`, status, error);
      }
    }

    throw new GoogleCalendarError(`Unexpected error while ${context}`, undefined, error);
  }

  async getCalendarList(): Promise<GoogleCalendar[]> {
    try {
      const response = await axios.get<GoogleCalendarListResponse>(
        `${this.baseURL}/users/me/calendarList`,
        {
          headers: this.headers,
        },
      );

      return response.data.items || [];
    } catch (error) {
      this.handleError(error, 'fetching calendar list');
    }
  }

  async getCalendarEvents(
    calendarId: string,
    timeMin: string,
    timeMax: string,
  ): Promise<GoogleCalendarEvent[]> {
    try {
      const params = {
        timeMin,
        timeMax,
        singleEvents: 'true',
        orderBy: 'startTime',
        maxResults: '250', // Reasonable limit
      };

      const response = await axios.get<GoogleEventsResponse>(
        `${this.baseURL}/calendars/${encodeURIComponent(calendarId)}/events`,
        {
          headers: this.headers,
          params,
          timeout: 10000, // 10 second timeout
        },
      );

      return response.data.items || [];
    } catch (error) {
      // Don't throw for individual calendar failures, just return empty array
      console.warn(`Failed to fetch events for calendar ${calendarId}:`, error);
      return [];
    }
  }

  async getEventsInRange(
    start: Date,
    end: Date,
  ): Promise<{ events: GoogleCalendarEvent[]; calendars: GoogleCalendar[] }> {
    try {
      const calendars = await this.getCalendarList();

      const timeMin = start.toISOString();
      const timeMax = end.toISOString();

      const eventPromises = calendars.map(calendar =>
        this.getCalendarEvents(calendar.id, timeMin, timeMax).then(events =>
          events.map(event => ({ ...event, calendarId: calendar.id })),
        ),
      );

      const eventArrays = await Promise.all(eventPromises);
      const allEvents = eventArrays.flat();

      return { events: allEvents, calendars };
    } catch (error) {
      this.handleError(error, 'fetching events');
    }
  }

  async getAllTodaysEvents(): Promise<{
    events: GoogleCalendarEvent[];
    calendars: GoogleCalendar[];
  }> {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const yesterday = new Date(start);
    yesterday.setDate(start.getDate() - 1);

    const tomorrow = new Date(end);
    tomorrow.setDate(end.getDate() + 1);

    return this.getEventsInRange(yesterday, tomorrow);
  }
}
