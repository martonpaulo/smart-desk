import type { SupabaseClient } from '@supabase/supabase-js';

import type { Column } from '@/widgets/TodoList/types';

export interface NewColumn {
  id?: string;
  title: string;
  color: string;
  position?: number;
}

export async function fetchColumns(client: SupabaseClient): Promise<Column[]> {
  console.debug('Supabase: fetching columns');
  const { data, error } = await client
    .from('columns')
    .select('*')
    .order('position', { ascending: true });
  if (error) {
    console.error('Supabase: fetch columns failed', error);
    throw new Error(error.message);
  }
  console.debug('Supabase: fetched columns', data);
  return (data ?? []) as Column[];
}

export async function createColumn(client: SupabaseClient, payload: NewColumn): Promise<Column> {
  console.debug('Supabase: creating column', payload);
  const {
    data: { user },
    error: userError,
  } = await client.auth.getUser();
  if (userError || !user?.id) {
    console.error('Supabase: unable to determine user', userError);
    throw new Error('User not authenticated');
  }

  const insertPayload = { ...payload, user_id: user.id };

  const { data, error } = await client
    .from('columns')
    .upsert(insertPayload, { onConflict: 'id' })
    .select()
    .single();
  if (error) {
    console.error('Supabase: create column failed', error);
    throw new Error(error.message);
  }
  console.debug('Supabase: created column', data);
  return data as Column;
}

export async function updateColumn(
  client: SupabaseClient,
  id: string,
  updates: Partial<NewColumn>,
): Promise<Column> {
  console.debug('Supabase: updating column', id, updates);
  const { data, error } = await client
    .from('columns')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) {
    console.error('Supabase: update column failed', error);
    throw new Error(error.message);
  }
  console.debug('Supabase: updated column', data);
  return data as Column;
}

export async function deleteColumn(client: SupabaseClient, id: string): Promise<void> {
  console.debug('Supabase: deleting column', id);
  const { error } = await client.from('columns').delete().eq('id', id);
  if (error) {
    console.error('Supabase: delete column failed', error);
    throw new Error(error.message);
  }
  console.debug('Supabase: deleted column');
}
