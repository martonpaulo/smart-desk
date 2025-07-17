import type { SupabaseClient } from '@supabase/supabase-js';

import { fetchUserId } from '@/services/supabase/userService';
import { Column } from '@/types/column';
import { mapColumnToDB, mapDBToColumn } from '@/utils/databaseUtils';

export async function fetchColumns(client: SupabaseClient): Promise<Column[]> {
  const query = client.from('columns').select('*').order('position', { ascending: true });

  const { data, error } = await query;
  if (error) {
    console.error('fetchColumns failed', error);
    throw new Error('Could not load columns');
  }

  const rows = data ?? [];
  const mappedRows = rows.map(mapDBToColumn);
  return mappedRows;
}

export async function upsertColumn(client: SupabaseClient, payload: Column): Promise<Column> {
  const userId = await fetchUserId(client);
  if (!userId) {
    throw new Error('User not authenticated');
  }

  const row = mapColumnToDB(payload, userId);

  const { data, error } = await client
    .from('columns')
    .upsert(row, { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    console.error('upsertColumn failed', error);
    throw new Error('Could not save column');
  }

  const mappedRow = mapDBToColumn(data);
  return mappedRow;
}

export async function trashColumn(client: SupabaseClient, id: string): Promise<void> {
  const { error } = await client.from('columns').update({ trashed: true }).eq('id', id);

  if (error) {
    console.error('trashColumn failed', error);
    throw new Error('Could not delete column');
  }
}
