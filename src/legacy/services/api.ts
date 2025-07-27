export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

export interface GoogleCalendarEvent {
  id: string;
  summary?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  attendees?: Array<{
    email?: string;
    displayName?: string;
    responseStatus?: string;
  }>;
  location?: string;
  description?: string;
}

export interface GoogleCalendar {
  id: string;
  summary: string;
  backgroundColor?: string;
  foregroundColor?: string;
  selected?: boolean;
}

export interface GoogleCalendarListResponse {
  items: GoogleCalendar[];
}

export interface GoogleEventsResponse {
  items: GoogleCalendarEvent[];
}
