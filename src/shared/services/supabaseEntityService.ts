import type { SupabaseClient } from '@supabase/supabase-js';

import { fetchUserId } from '@/shared/services/supabaseUserService';

export function createSupabaseEntityService<T = unknown, DB = unknown>({
  table,
  mapToDB,
  mapFromDB,
  hasUser = true,
  onConflict = 'id',
}: {
  table: string;
  mapToDB: (entity: T, userId: string) => DB;
  mapFromDB: (db: DB) => T;
  hasUser?: boolean;
  onConflict?: string;
}) {
  return {
    async fetchAll(client: SupabaseClient): Promise<T[]> {
      const { data, error } = await client.from(table).select('*');

      if (error) {
        console.error(`fetchAll failed for ${table}`, error);
        throw new Error(`Could not load ${table}`);
      }

      return (data ?? []).map(mapFromDB);
    },

    async upsert(client: SupabaseClient, entity: T): Promise<T> {
      const userId = hasUser ? await fetchUserId(client) : null;

      if (hasUser && !userId) {
        throw new Error('User not authenticated');
      }

      const dbEntity = mapToDB(entity, userId!);

      const { data, error } = await client
        .from(table)
        .upsert(dbEntity, { onConflict })
        .select()
        .single();

      if (error) {
        console.error(`upsert failed for ${table}`, error);
        throw new Error(`Could not save ${table}`);
      }

      return mapFromDB(data);
    },

    async softDelete(client: SupabaseClient, id: string): Promise<void> {
      const { error } = await client.from(table).update({ trashed: true }).eq('id', id);

      if (error) {
        console.error(`softDelete failed for ${table}`, error);
        throw new Error(`Could not soft delete ${table}`);
      }
    },

    async hardDelete(client: SupabaseClient, id: string): Promise<void> {
      const { error } = await client.from(table).delete().eq('id', id);

      if (error) {
        console.error(`hardDelete failed for ${table}`, error);
        throw new Error(`Could not delete ${table}`);
      }
    },
  };
}
