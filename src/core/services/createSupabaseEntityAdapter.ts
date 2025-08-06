import type { SupabaseClient } from '@supabase/supabase-js';

import { fetchUserId } from '@/core/services/supabaseUserService';
import type { BaseType } from '@/core/types/BaseType';
import type { DbRecord } from '@/core/types/DbRecord';
import { camelToSnake, snakeToCamel } from '@/core/utils/caseMapper';
import { baseMapFromDB, baseMapToDB } from '@/core/utils/entityMapper';

export function createSupabaseEntityAdapter<E extends BaseType>(config: {
  table: string;
  dateFields?: Array<Exclude<keyof E, keyof BaseType>>;
  excludeFields?: Array<Exclude<keyof E, keyof BaseType>>;
  hasUser?: boolean;
  onConflict?: string;
}) {
  const { table, dateFields = [], excludeFields = [], hasUser = true, onConflict = 'id' } = config;

  async function fetchAll(client: SupabaseClient): Promise<E[]> {
    const { data, error } = await client.from(table).select('*');
    if (error) {
      console.error(`fetchAll ${table}`, error);
      throw new Error(`Could not load ${table}`);
    }
    return (data ?? []).map(mapFromDB);
  }

  async function upsert(client: SupabaseClient, entity: E): Promise<E> {
    const userId = hasUser ? await fetchUserId(client) : null;
    if (hasUser && !userId) throw new Error('User not authenticated');

    const dbRec = mapToDB(entity, userId!);
    const { data, error } = await client
      .from(table)
      .upsert(dbRec, { onConflict })
      .select()
      .single();

    if (error || !data) {
      console.error(`upsert ${table}`, error);
      throw new Error(`Could not save ${table}`);
    }
    return mapFromDB(data);
  }

  async function softDelete(client: SupabaseClient, id: string): Promise<void> {
    const { error } = await client.from(table).update({ trashed: true }).eq('id', id);
    if (error) {
      console.error(`softDelete ${table}`, error);
      throw new Error(`Could not soft delete ${table}`);
    }
  }

  async function hardDelete(client: SupabaseClient, id: string): Promise<void> {
    const { error } = await client.from(table).delete().eq('id', id);
    if (error) {
      console.error(`hardDelete ${table}`, error);
      throw new Error(`Could not hard delete ${table}`);
    }
  }

  function mapToDB(entity: E, userId: string): DbRecord<E> {
    const base = baseMapToDB(entity, userId); // RawBaseType
    const rec: Partial<DbRecord<E>> = { ...(base as Partial<DbRecord<E>>) };

    for (const key of Object.keys(entity) as Array<keyof E>) {
      // skip base‐type props
      if (['id', 'trashed', 'createdAt', 'updatedAt', 'isSynced'].includes(key as string)) continue;
      // skip excluded fields
      if (excludeFields.includes(key as Exclude<keyof E, keyof BaseType>)) continue;

      const val = entity[key];
      const snakeKey = camelToSnake(key as string) as keyof DbRecord<E>;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (rec as any)[snakeKey] =
        val instanceof Date ? val.toISOString() : typeof val === 'string' ? val.trim() : val;
    }

    return rec as DbRecord<E>;
  }

  function mapFromDB(raw: DbRecord<E>): E {
    const base = baseMapFromDB(raw); // BaseType & { isSynced: true }
    const result = { ...base } as E;

    // handle declared dateFields
    for (const field of dateFields) {
      const snake = camelToSnake(field as string) as keyof DbRecord<E>;
      const v = raw[snake];
      if (typeof v === 'string') {
        result[field] = new Date(v) as E[typeof field];
      }
    }

    // map all other fields
    for (const rawKey of Object.keys(raw)) {
      if (['id', 'user_id', 'trashed', 'created_at', 'updated_at'].includes(rawKey)) continue;

      const camelKey = snakeToCamel(rawKey) as keyof E;
      if (dateFields.includes(camelKey as unknown as Exclude<keyof E, keyof BaseType>)) continue;
      // skip excluded fields
      if (excludeFields.includes(camelKey as Exclude<keyof E, keyof BaseType>)) continue;

      const v = raw[rawKey as keyof DbRecord<E>];
      result[camelKey] =
        typeof v === 'string'
          ? (v.trim() as unknown as E[typeof camelKey])
          : (v as unknown as E[typeof camelKey]);
    }

    return result;
  }

  return { fetchAll, upsert, softDelete, hardDelete };
}
