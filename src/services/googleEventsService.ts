import type { ApiResponse } from '@/services/api';
import type { IEvent } from '@/types/IEvent';

// fetch events from Google calendar endpoint
export async function fetchGoogleEvents(date?: string): Promise<IEvent[]> {
  const endpoint = new URL('/api/google-calendar', window.location.origin);
  if (date) {
    endpoint.searchParams.set('date', date);
  }

  const response = await fetch(endpoint.toString(), {
    headers: { 'content-type': 'application/json' },
  });

  if (!response.ok) {
    // attempt to read error message from JSON
    const errorJson = (await response.json().catch(() => null)) as ApiResponse<unknown> | null;
    const message = errorJson?.error ?? 'Failed to fetch Google events';
    throw new Error(message);
  }

  const result = (await response.json()) as ApiResponse<IEvent[]>;
  if (!result.success) {
    throw new Error(result.error);
  }

  return result.data ?? [];
}
