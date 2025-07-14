import type { SupabaseClient } from '@supabase/supabase-js';

import { IcsCalendar } from '@/types/icsCalendar';
import { mapDBToIcsCalendar, mapIcsCalendarToDB } from '@/utils/databaseUtils';

export async function fetchIcsCalendars(client: SupabaseClient): Promise<IcsCalendar[]> {
  const query = client.from('ics_calendars').select('*');

  const { data, error } = await query;
  if (error) {
    console.error('fetchIcsCalendars failed', error);
    throw new Error('Could not load ics calendars');
  }

  const rows = data ?? [];
  const mappedRows = rows.map(mapDBToIcsCalendar);
  return mappedRows;
}

export async function upsertIcsCalendar(
  client: SupabaseClient,
  payload: IcsCalendar,
): Promise<IcsCalendar> {
  const {
    data: { user },
    error: authError,
  } = await client.auth.getUser();

  if (authError || !user?.id) {
    console.error('upsertIcsCalendar auth failed', authError);
    throw new Error('User not authenticated');
  }

  const row = mapIcsCalendarToDB(payload, user.id);

  const { data, error } = await client
    .from('ics_calendars')
    .upsert(row, { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    console.error('upsertIcsCalendars failed', error);
    throw new Error('Could not save ics calendar');
  }

  const mappedRow = mapDBToIcsCalendar(data);
  return mappedRow;
}

export async function deleteIcsCalendar(client: SupabaseClient, id: string): Promise<void> {
  const { error } = await client.from('ics_calendars').delete().eq('id', id);

  if (error) {
    console.error('deleteIcsCalendar failed', error);
    throw new Error('Could not delete ics calendar');
  }
}
