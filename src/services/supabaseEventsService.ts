/* eslint-disable @typescript-eslint/no-explicit-any */
import type { SupabaseClient } from '@supabase/supabase-js';

import type { IEvent } from '@/types/IEvent';

export interface NewEvent {
  id?: string;
  start: Date;
  end: Date;
  title: string;
  attendeeCount?: number;
  calendar?: string;
  aknowledged?: boolean;
  trashed?: boolean;
}

export async function fetchEvents(
  client: SupabaseClient,
  opts: { includeTrashed?: boolean } = {},
): Promise<IEvent[]> {
  console.debug('Supabase: fetching events');
  const query = client.from('events').select('*').order('start', { ascending: true });
  if (!opts.includeTrashed) {
    query.eq('trashed', false);
  }
  const { data, error } = await query;
  if (error) {
    console.error('Supabase: fetch events failed', error);
    throw new Error(error.message);
  }
  console.debug('Supabase: fetched events', data);
  return (data ?? []).map(ev => ({
    ...(ev as IEvent),
    trashed: (ev as any).trashed ?? false,
    updatedAt: (ev as any).updated_at,
  }));
}

export async function createEvent(client: SupabaseClient, payload: NewEvent): Promise<IEvent> {
  console.debug('Supabase: creating event', payload);
  const {
    data: { user },
    error: userError,
  } = await client.auth.getUser();
  if (userError || !user?.id) {
    console.error('Supabase: unable to determine user', userError);
    throw new Error('User not authenticated');
  }

  const insertPayload = { ...payload, user_id: user.id, trashed: false };

  const { data, error } = await client.from('events').insert(insertPayload).select().single();
  if (error) {
    console.error('Supabase: create event failed', error);
    throw new Error(error.message);
  }
  console.debug('Supabase: created event', data);
  return {
    ...(data as IEvent),
    trashed: (data as any).trashed ?? false,
    updatedAt: (data as any).updated_at,
  };
}

export async function updateEvent(
  client: SupabaseClient,
  id: string,
  updates: Partial<NewEvent>,
): Promise<IEvent> {
  console.debug('Supabase: updating event', id, updates);
  const { data, error } = await client
    .from('events')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) {
    console.error('Supabase: update event failed', error);
    throw new Error(error.message);
  }
  console.debug('Supabase: updated event', data);
  return {
    ...(data as IEvent),
    trashed: (data as any).trashed ?? false,
    updatedAt: (data as any).updated_at,
  };
}

export async function deleteEvent(client: SupabaseClient, id: string): Promise<void> {
  console.debug('Supabase: trashing event', id);
  const { error } = await client.from('events').update({ trashed: true }).eq('id', id);
  if (error) {
    console.error('Supabase: delete event failed', error);
    throw new Error(error.message);
  }
  console.debug('Supabase: deleted event');
}
