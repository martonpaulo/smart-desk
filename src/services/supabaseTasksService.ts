import type { SupabaseClient } from '@supabase/supabase-js';

import { Task } from '@/types/task';
import { mapDBToTask, mapTaskToDB } from '@/utils/databaseUtils';

export async function fetchTasks(client: SupabaseClient): Promise<Task[]> {
  const query = client.from('tasks').select('*').order('position', { ascending: true });

  const { data, error } = await query;
  if (error) {
    console.error('fetchTasks failed', error);
    throw new Error('Could not load tasks');
  }

  const tasks = data ?? [];
  const mappedTasks = tasks.map(mapDBToTask);
  return mappedTasks;
}

export async function upsertTask(client: SupabaseClient, payload: Task): Promise<Task> {
  const {
    data: { user },
    error: authError,
  } = await client.auth.getUser();

  if (authError || !user?.id) {
    console.error('upsertTask auth failed', authError);
    throw new Error('User not authenticated');
  }

  const row = mapTaskToDB({
    task: payload,
    userId: user.id,
  });

  const { data, error } = await client
    .from('tasks')
    .upsert(row, { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    console.error('upsertTask failed', error);
    throw new Error('Could not save task');
  }

  const mappedRow = mapDBToTask(data);
  return mappedRow;
}

export async function trashTask(client: SupabaseClient, id: string): Promise<void> {
  const { error } = await client.from('tasks').update({ trashed: true }).eq('id', id);

  if (error) {
    console.error('trashTask failed', error);
    throw new Error('Could not delete task');
  }
}
