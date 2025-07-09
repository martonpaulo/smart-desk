import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import type { SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

function initClient(): SupabaseClient {
  if (!client) {
    client = createPagesBrowserClient({
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    });
    console.debug('Supabase client initialized');
  }
  return client;
}

export function getSupabaseClient(): SupabaseClient {
  return initClient();
}

export function useSupabaseClient(): SupabaseClient {
  return initClient();
}
