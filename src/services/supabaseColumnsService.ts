import type { SupabaseClient } from '@supabase/supabase-js';

import type { Column } from '@/widgets/TodoList/types';

export interface NewColumn {
  id?: string;
  slug?: string;
  title: string;
  color: string;
  position?: number;
  trashed?: boolean;
}

export async function fetchColumns(
  client: SupabaseClient,
  opts: { includeTrashed?: boolean } = {},
): Promise<Column[]> {
  console.debug('Supabase: fetching columns');
  const query = client
    .from('columns')
    .select('*')
    .order('position', { ascending: true });
  if (!opts.includeTrashed) {
    query.eq('trashed', false);
  }
  const { data, error } = await query;
  if (error) {
    console.error('Supabase: fetch columns failed', error);
    throw new Error(error.message);
  }
  console.debug('Supabase: fetched columns', data);
  return (data ?? []).map(c => ({
    id: c.id,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    slug: (c as any).slug ?? c.id,
    title: c.title,
    color: c.color,
    position: c.position,
    trashed: (c as any).trashed ?? false,
    updatedAt: (c as any).updated_at,
  })) as Column[];
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

  const insertPayload = {
    ...payload,
    slug: payload.slug ?? payload.id,
    user_id: user.id,
    trashed: false,
  };

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
  return {
    ...(data as Column),
    trashed: (data as any).trashed ?? false,
    updatedAt: (data as any).updated_at,
  };
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
  return {
    ...(data as Column),
    trashed: (data as any).trashed ?? false,
    updatedAt: (data as any).updated_at,
  };
}

export async function deleteColumn(client: SupabaseClient, id: string): Promise<void> {
  console.debug('Supabase: trashing column', id);
  const { error } = await client
    .from('columns')
    .update({ trashed: true })
    .eq('id', id);
  if (error) {
    console.error('Supabase: delete column failed', error);
    throw new Error(error.message);
  }
  console.debug('Supabase: deleted column');
}
