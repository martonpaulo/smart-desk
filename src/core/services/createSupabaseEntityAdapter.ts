import type { SupabaseClient } from '@supabase/supabase-js';

import { fetchUserId } from '@/core/services/supabaseUserService';
import type { Base } from '@/core/types/Base';
import type { DbRecord } from '@/core/types/DbRecord';
import { camelToSnake, snakeToCamel } from '@/core/utils/caseMapper';
import { baseMapFromDB, baseMapToDB } from '@/core/utils/entityMapper';

/**
 * Optional provider that returns a SupabaseClient instance.
 * If not provided, we lazy import from '@/core/services/supabaseClient'.
 */
type ClientProvider = () => Promise<SupabaseClient> | SupabaseClient;

export function createSupabaseEntityAdapter<E extends Base>(config: {
  table: string;
  dateFields?: Array<Exclude<keyof E, keyof Base>>;
  excludeFields?: Array<Exclude<keyof E, keyof Base>>;
  hasUser?: boolean;
  onConflict?: string;
  clientProvider?: ClientProvider; // optional, enables DI and easy testing
}) {
  const {
    table,
    dateFields = [],
    excludeFields = [],
    hasUser = true,
    onConflict = 'id',
    clientProvider,
  } = config;

  // Cached client to avoid re-creating on every call
  let cachedClient: SupabaseClient | null = null;

  /**
   * Resolve a Supabase client lazily.
   * Tries, in order:
   * 1) user-provided clientProvider
   * 2) dynamic import from '@/core/services/supabaseClient'
   *    supporting common export names.
   */
  async function ensureClient(): Promise<SupabaseClient> {
    if (cachedClient) return cachedClient;

    if (clientProvider) {
      const provided = await clientProvider();
      cachedClient = provided;
      return provided;
    }

    // Dynamic import with tolerant export resolution
    const mod = await import('@/legacy/lib/supabaseClient');
    const candidates = [
      (mod as Record<string, unknown>).supabase,
      (mod as Record<string, unknown>).client,
      (mod as Record<string, unknown>).default,
      (mod as Record<string, unknown>).getClient
        ? (mod as Record<string, () => SupabaseClient>).getClient()
        : undefined,
      (mod as Record<string, unknown>).getSupabaseClient
        ? (mod as Record<string, () => SupabaseClient>).getSupabaseClient()
        : undefined,
    ].filter(Boolean) as SupabaseClient[];

    if (candidates.length === 0) {
      throw new Error(
        'Supabase client not found. Provide config.clientProvider or export a client from "@/core/services/supabaseClient".',
      );
    }

    cachedClient = candidates[0];
    return cachedClient;
  }

  // ---------- Public API (unchanged for callers) ----------

  async function fetchAll(): Promise<E[]> {
    const client = await ensureClient();
    const { data, error } = await client.from(table).select('*');
    if (error) {
      console.error(`fetchAll ${table}`, error);
      throw new Error(`Could not load ${table}`);
    }
    return (data ?? []).map(mapFromDB);
  }

  async function upsert(entity: E): Promise<E> {
    const client = await ensureClient();
    const userId = hasUser ? await fetchUserId(client) : null;
    if (hasUser && !userId) throw new Error('User not authenticated');

    const dbRec = mapToDB(entity, userId ?? '');
    const { data, error } = await client
      .from(table)
      .upsert(dbRec, { onConflict })
      .select()
      .single();

    if (error || !data) {
      console.error(`upsert ${table}`, error);
      throw new Error(`Could not save ${table}`);
    }
    return mapFromDB(data as DbRecord<E>);
  }

  async function softDelete(id: string): Promise<void> {
    const client = await ensureClient();
    const { error } = await client.from(table).update({ trashed: true }).eq('id', id);
    if (error) {
      console.error(`softDelete ${table}`, error);
      throw new Error(`Could not soft delete ${table}`);
    }
  }

  async function hardDelete(id: string): Promise<void> {
    const client = await ensureClient();
    const { error } = await client.from(table).delete().eq('id', id);
    if (error) {
      console.error(`hardDelete ${table}`, error);
      throw new Error(`Could not hard delete ${table}`);
    }
  }

  // ---------- Mapping helpers ----------

  function mapToDB(entity: E, userId: string): DbRecord<E> {
    const base = baseMapToDB(entity, userId); // RawBase
    const rec: Partial<DbRecord<E>> = { ...(base as Partial<DbRecord<E>>) };

    for (const key of Object.keys(entity) as Array<keyof E>) {
      // skip base-type props
      if (['id', 'trashed', 'createdAt', 'updatedAt', 'isSynced'].includes(key as string)) continue;
      // skip excluded fields
      if (excludeFields.includes(key as Exclude<keyof E, keyof Base>)) continue;

      const val = entity[key];
      const snakeKey = camelToSnake(key as string) as keyof DbRecord<E>;

      // Assign without using `any`
      const normalized =
        val instanceof Date ? val.toISOString() : typeof val === 'string' ? val.trim() : val;

      // Use indexing via keyof to keep type-safety boundaries
      (rec as Record<string, unknown>)[snakeKey as string] = normalized as unknown;
    }

    return rec as DbRecord<E>;
  }

  function mapFromDB(raw: DbRecord<E>): E {
    const base = baseMapFromDB(raw); // Base & { isSynced: true }
    const result = { ...base } as E;

    // handle declared dateFields
    for (const field of dateFields) {
      const snake = camelToSnake(field as string) as keyof DbRecord<E>;
      const v = raw[snake];
      if (typeof v === 'string') {
        // @ts-expect-error precise field assignment on generic E
        result[field] = new Date(v);
      }
    }

    // map all other fields
    for (const rawKey of Object.keys(raw)) {
      if (['id', 'user_id', 'trashed', 'created_at', 'updated_at'].includes(rawKey)) continue;

      const camelKey = snakeToCamel(rawKey) as keyof E;
      if (dateFields.includes(camelKey as unknown as Exclude<keyof E, keyof Base>)) continue;
      // skip excluded fields
      if (excludeFields.includes(camelKey as Exclude<keyof E, keyof Base>)) continue;

      const v = raw[rawKey as keyof DbRecord<E>];
      const normalized = typeof v === 'string' ? v.trim() : v;

      result[camelKey] = normalized as unknown as E[typeof camelKey];
    }

    return result;
  }

  return { fetchAll, upsert, softDelete, hardDelete };
}
