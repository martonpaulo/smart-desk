import type { SupabaseClient } from '@supabase/supabase-js';

import type { TodoTask } from '@/widgets/TodoList/types';

export interface NewTask {
  id?: string;
  title: string;
  description?: string;
  tags: string[];
  columnSlug: string;
  position?: number;
  quantity?: number;
  quantityTotal?: number;
  trashed?: boolean;
}

export async function fetchTasks(
  client: SupabaseClient,
  opts: { includeTrashed?: boolean } = {},
): Promise<TodoTask[]> {
  console.debug('Supabase: fetching tasks');
  const query = client
    .from('tasks')
    .select('*')
    .order('position', { ascending: true });
  if (!opts.includeTrashed) {
    query.eq('trashed', false);
  }
  const { data, error } = await query;
  if (error) {
    console.error('Supabase: fetch tasks failed', error);
    throw new Error(error.message);
  }
  console.debug('Supabase: fetched tasks', data);
  return (data ?? []).map(t => ({
    id: t.id,
    title: t.title,
    description: t.description ?? undefined,
    tags: t.tags ?? [],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    columnSlug: (t as any).column_id,
    position: t.position ?? undefined,
    quantity: t.quantity ?? undefined,
    quantityTotal: t.quantityTotal ?? undefined,
    trashed: (t as any).trashed ?? false,
    updatedAt: (t as any).updated_at,
  }));
}

export async function createTask(client: SupabaseClient, payload: NewTask): Promise<TodoTask> {
  console.debug('Supabase: creating task', payload);
  const {
    data: { user },
    error: userError,
  } = await client.auth.getUser();
  if (userError || !user?.id) {
    console.error('Supabase: unable to determine user', userError);
    throw new Error('User not authenticated');
  }

  console.log('payload', payload);

  const insertPayload = {
    ...payload,
    column_id: payload.columnSlug,
    user_id: user.id,
    trashed: false,
  };

  const { data, error } = await client
    .from('tasks')
    .upsert(insertPayload, { onConflict: 'id' })
    .select()
    .single();
  if (error) {
    console.error('Supabase: create task failed', error);
    throw new Error(error.message);
  }
  console.debug('Supabase: created task', data);
  return {
    id: data.id,
    title: data.title,
    description: data.description ?? undefined,
    tags: data.tags ?? [],
    columnSlug: data.column_id,
    position: data.position ?? undefined,
    quantity: data.quantity ?? undefined,
    quantityTotal: data.quantityTotal ?? undefined,
    trashed: data.trashed ?? false,
    updatedAt: data.updated_at,
  } as TodoTask;
}

export async function updateTask(
  client: SupabaseClient,
  id: string,
  updates: Partial<NewTask>,
): Promise<TodoTask> {
  console.debug('Supabase: updating task', id, updates);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dbUpdates = { ...updates } as any;
  if (updates.columnSlug) {
    dbUpdates.column_id = updates.columnSlug;
    delete dbUpdates.columnSlug;
  }
  const { data, error } = await client
    .from('tasks')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single();
  if (error) {
    console.error('Supabase: update task failed', error);
    throw new Error(error.message);
  }
  console.debug('Supabase: updated task', data);
  return {
    id: data.id,
    title: data.title,
    description: data.description ?? undefined,
    tags: data.tags ?? [],
    columnSlug: data.column_id,
    position: data.position ?? undefined,
    quantity: data.quantity ?? undefined,
    quantityTotal: data.quantityTotal ?? undefined,
    trashed: data.trashed ?? false,
    updatedAt: data.updated_at,
  } as TodoTask;
}

export async function deleteTask(client: SupabaseClient, id: string): Promise<void> {
  console.debug('Supabase: trashing task', id);
  const { error } = await client
    .from('tasks')
    .update({ trashed: true })
    .eq('id', id);
  if (error) {
    console.error('Supabase: delete task failed', error);
    throw new Error(error.message);
  }
  console.debug('Supabase: deleted task');
}
