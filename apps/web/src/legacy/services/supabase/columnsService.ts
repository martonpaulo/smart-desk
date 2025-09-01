/* eslint-disable @typescript-eslint/no-explicit-any */
import { fetchUserId } from 'src/core/services/supabaseUserService';
import { TypedSupabaseClient } from 'src/legacy/lib/supabaseClient';
import { Column } from 'src/legacy/types/column';
import { mapColumnToDB, mapDBToColumn } from 'src/legacy/utils/databaseUtils';

export async function fetchColumns(client: TypedSupabaseClient): Promise<Column[]> {
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

export async function upsertColumn(client: TypedSupabaseClient, payload: Column): Promise<Column> {
  const userId = await fetchUserId(client);
  if (!userId) {
    throw new Error('User not authenticated');
  }

  const row = mapColumnToDB(payload, userId);

  const { data, error } = await client
    .from('columns')
    .upsert(row as any, { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    console.error('upsertColumn failed', error);
    throw new Error('Could not save column');
  }

  const mappedRow = mapDBToColumn(data);
  return mappedRow;
}
