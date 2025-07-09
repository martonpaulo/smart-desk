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
  const { data, error } = await client
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as TodoTask[];
}

export async function createTask(
  client: SupabaseClient,
  payload: NewTask,
): Promise<TodoTask> {
  const { data, error } = await client
    .from('tasks')
    .insert(payload)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as TodoTask;
}

export async function updateTask(
  client: SupabaseClient,
  id: string,
  updates: Partial<NewTask>,
): Promise<TodoTask> {
  const { data, error } = await client
    .from('tasks')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as TodoTask;
}

export async function deleteTask(
  client: SupabaseClient,
  id: string,
): Promise<void> {
  const { error } = await client.from('tasks').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
