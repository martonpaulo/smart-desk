/* eslint-disable @typescript-eslint/no-explicit-any */
import { fetchUserId } from 'src/core/services/supabaseUserService';
import { TypedSupabaseClient } from 'src/legacy/lib/supabaseClient';
import { IcsCalendar } from 'src/legacy/types/icsCalendar';
import { mapDBToIcsCalendar, mapIcsCalendarToDB } from 'src/legacy/utils/databaseUtils';

export async function fetchIcsCalendars(client: TypedSupabaseClient): Promise<IcsCalendar[]> {
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
  client: TypedSupabaseClient,
  payload: IcsCalendar,
): Promise<IcsCalendar> {
  const userId = await fetchUserId(client as unknown as TypedSupabaseClient);
  if (!userId) {
    throw new Error('User not authenticated');
  }

  const row = mapIcsCalendarToDB(payload, userId);

  const { data, error } = await client
    .from('ics_calendars')
    .upsert([row] as any, { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    console.error('upsertIcsCalendars failed', error);
    throw new Error('Could not save ics calendar');
  }

  const mappedRow = mapDBToIcsCalendar(data);
  return mappedRow;
}

export async function deleteIcsCalendar(client: TypedSupabaseClient, id: string): Promise<void> {
  const { error } = await client.from('ics_calendars').delete().eq('id', id);

  if (error) {
    console.error('deleteIcsCalendar failed', error);
    throw new Error('Could not delete ics calendar');
  }
}
