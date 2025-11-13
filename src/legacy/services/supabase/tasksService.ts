/* eslint-disable @typescript-eslint/no-explicit-any */
import { fetchUserId } from 'src/core/services/supabaseUserService';
import { TypedSupabaseClient } from 'src/legacy/lib/supabaseClient';
import { Task } from 'src/legacy/types/task';
import { mapDBToTask, mapTaskToDB } from 'src/legacy/utils/databaseUtils';

export async function fetchTasks(client: TypedSupabaseClient): Promise<Task[]> {
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

export async function upsertTask(client: TypedSupabaseClient, payload: Task): Promise<Task> {
  const userId = await fetchUserId(client as unknown as TypedSupabaseClient);
  if (!userId) {
    throw new Error('User not authenticated');
  }

  const row = mapTaskToDB(payload, userId);
  const rowClean = Object.fromEntries(
    Object.entries(row).filter(([, v]) => v !== undefined),
  ) as typeof row;

  const { data, error } = await client
    .from('tasks')
    .upsert(rowClean as any, { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    console.error('upsertTask failed', error);
    throw new Error('Could not save task');
  }

  const mappedRow = mapDBToTask(data);
  return mappedRow;
}
