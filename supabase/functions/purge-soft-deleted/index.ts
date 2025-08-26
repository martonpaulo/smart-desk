// Purge across all tables that have deleted_at or trashed.
// Rules are implemented in SQL function purge_soft_deleted_v3.
// Scheduler runs daily at 00:00 UTC.
// Uses service_role. RLS does not block service calls.
// No allow list used. Discovery uses PostgREST pg meta.

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

type TableRef = { table_schema: string; table_name: string };

type PurgeResult = {
  table: string;
  deleted: number;
  ok: boolean;
  error?: string;
};

function env(name: string): string {
  const v = Deno.env.get(name);
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

function createServiceClient(): SupabaseClient {
  const url = env('SUPABASE_URL');
  const key = env('SUPABASE_SERVICE_ROLE_KEY'); // service role only in backend
  return createClient(url, key, { auth: { persistSession: false } });
}

async function listTargetTables(): Promise<TableRef[]> {
  // Query metadata for columns. We keep it simple and robust.
  const base = `${env('SUPABASE_URL')}/pg/information_schema.columns`;
  const headers = {
    apikey: env('SUPABASE_SERVICE_ROLE_KEY'),
    Authorization: `Bearer ${env('SUPABASE_SERVICE_ROLE_KEY')}`,
  };

  // Fetch both sets in parallel
  const [deletedResp, trashedResp] = await Promise.all([
    fetch(`${base}?column_name=eq.deleted_at`, { headers }),
    fetch(`${base}?column_name=eq.trashed`, { headers }),
  ]);

  if (!deletedResp.ok) {
    throw new Error(
      `pg-meta deleted_at fetch failed: ${deletedResp.status} ${await deletedResp.text()}`,
    );
  }
  if (!trashedResp.ok) {
    throw new Error(
      `pg-meta trashed fetch failed: ${trashedResp.status} ${await trashedResp.text()}`,
    );
  }

  type ColRow = { table_schema: string; table_name: string; data_type: string };
  const deletedCols: ColRow[] = await deletedResp.json();
  const trashedCols: ColRow[] = await trashedResp.json();

  const out: TableRef[] = [];
  const seen = new Set<string>();

  // Helper that avoids system schemas and duplicates
  const pushIfValid = (c: ColRow, needsTimestampCheck: boolean) => {
    if (c.table_schema === 'pg_catalog' || c.table_schema === 'information_schema') return;
    if (needsTimestampCheck && !c.data_type.startsWith('timestamp')) return;
    const key = `${c.table_schema}.${c.table_name}`;
    if (!seen.has(key)) {
      seen.add(key);
      out.push({ table_schema: c.table_schema, table_name: c.table_name });
    }
  };

  // deleted_at must be timestamp. trashed can be boolean.
  for (const c of deletedCols) pushIfValid(c, true);
  for (const c of trashedCols) pushIfValid(c, false);

  return out;
}

async function purgeOne(client: SupabaseClient, ref: TableRef): Promise<PurgeResult> {
  try {
    const { data, error } = await client.rpc('purge_soft_deleted_v3', {
      p_schema: ref.table_schema,
      p_table: ref.table_name,
    });

    if (error) {
      return {
        table: `${ref.table_schema}.${ref.table_name}`,
        deleted: 0,
        ok: false,
        error: error.message,
      };
    }

    const deleted = typeof data === 'number' ? data : 0;
    return { table: `${ref.table_schema}.${ref.table_name}`, deleted, ok: true };
  } catch (e) {
    return {
      table: `${ref.table_schema}.${ref.table_name}`,
      deleted: 0,
      ok: false,
      error: String(e),
    };
  }
}

Deno.serve(async req => {
  try {
    // Optional protection so only the Scheduler can call it
    // Supabase Scheduler sends x-supabase-schedule: true
    const isScheduler = req.headers.get('x-supabase-schedule') === 'true';
    const token = req.headers.get('x-cron-secret');
    const CRON_SECRET = Deno.env.get('CRON_SECRET');
    if (!isScheduler && (!CRON_SECRET || token !== CRON_SECRET)) {
      return new Response(JSON.stringify({ ok: false, error: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const client = createServiceClient();
    const targets = await listTargetTables();

    if (targets.length === 0) {
      return new Response(
        JSON.stringify({
          ok: true,
          message: 'No tables with deleted_at or trashed found',
          results: [],
        }),
        { headers: { 'Content-Type': 'application/json' } },
      );
    }

    const results: PurgeResult[] = [];
    for (const t of targets) {
      results.push(await purgeOne(client, t));
    }

    const total = results.reduce((acc, r) => acc + (r.deleted ?? 0), 0);

    return new Response(JSON.stringify({ ok: true, total_deleted: total, results }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
