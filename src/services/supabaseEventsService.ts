import type { SupabaseClient } from '@supabase/supabase-js';
import type { IEvent } from '@/types/IEvent';

export interface NewEvent {
  start: Date;
  end: Date;
  title: string;
  attendeeCount?: number;
  calendar?: string;
  aknowledged?: boolean;
}

export async function fetchEvents(client: SupabaseClient): Promise<IEvent[]> {
  const { data, error } = await client
    .from('events')
    .select('*')
    .order('start', { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as IEvent[];
}

export async function createEvent(
  client: SupabaseClient,
  payload: NewEvent,
): Promise<IEvent> {
  const { data, error } = await client
    .from('events')
    .insert(payload)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as IEvent;
}

export async function updateEvent(
  client: SupabaseClient,
  id: string,
  updates: Partial<NewEvent>,
): Promise<IEvent> {
  const { data, error } = await client
    .from('events')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as IEvent;
}

export async function deleteEvent(
  client: SupabaseClient,
  id: string,
): Promise<void> {
  const { error } = await client.from('events').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
