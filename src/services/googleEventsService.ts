import type { ApiResponse } from '@/services/api';
import type { Event } from '@/types/Event';

// fetch events from Google calendar endpoint
export async function fetchGoogleEvents(start?: Date, end?: Date): Promise<Event[]> {
  const endpoint = new URL('/api/google-calendar', window.location.origin);
  if (start && end) {
    endpoint.searchParams.set('start', start.toISOString());
    endpoint.searchParams.set('end', end.toISOString());
  }

  const response = await fetch(endpoint.toString(), {
    headers: { 'content-type': 'application/json' },
  });

  if (!response.ok) {
    // return empty list for unauthenticated users
    if (response.status === 401) {
      return [];
    }

    const errorJson = (await response.json().catch(() => null)) as ApiResponse<unknown> | null;
    const message = errorJson?.error ?? 'Failed to fetch Google events';
    throw new Error(message);
  }

  const result = (await response.json()) as ApiResponse<Event[]>;
  if (!result.success) {
    throw new Error(result.error);
  }

  return result.data ?? [];
}
