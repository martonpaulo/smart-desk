import type { SupabaseClient } from '@supabase/supabase-js';

import type { TodoTask } from '@/widgets/TodoList/types';

export interface NewTask {
  title: string;
  description?: string;
  tags: string[];
  columnId: string;
  quantity?: number;
  quantityTotal?: number;
}

export async function fetchTasks(client: SupabaseClient): Promise<TodoTask[]> {
  console.debug('Supabase: fetching tasks');
  const { data, error } = await client
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) {
    console.error('Supabase: fetch tasks failed', error);
    throw new Error(error.message);
  }
  console.debug('Supabase: fetched tasks', data);
  return (data ?? []) as TodoTask[];
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

  const insertPayload = { ...payload, user_id: user.id };

  const { data, error } = await client.from('tasks').insert(insertPayload).select().single();
  if (error) {
    console.error('Supabase: create task failed', error);
    throw new Error(error.message);
  }
  console.debug('Supabase: created task', data);
  return data as TodoTask;
}

export async function updateTask(
  client: SupabaseClient,
  id: string,
  updates: Partial<NewTask>,
): Promise<TodoTask> {
  console.debug('Supabase: updating task', id, updates);
  const { data, error } = await client.from('tasks').update(updates).eq('id', id).select().single();
  if (error) {
    console.error('Supabase: update task failed', error);
    throw new Error(error.message);
  }
  console.debug('Supabase: updated task', data);
  return data as TodoTask;
}

export async function deleteTask(client: SupabaseClient, id: string): Promise<void> {
  console.debug('Supabase: deleting task', id);
  const { error } = await client.from('tasks').delete().eq('id', id);
  if (error) {
    console.error('Supabase: delete task failed', error);
    throw new Error(error.message);
  }
  console.debug('Supabase: deleted task');
}
