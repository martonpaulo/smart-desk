'use client';

import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';

import type { Database } from '@/types/supabase'; // <-- adjust or remove if you don't have this

// Prefer the exact return type from the helper to avoid generic mismatches
export type TypedSupabaseClient = ReturnType<typeof createPagesBrowserClient<Database>>;

let client: TypedSupabaseClient | null = null;

function initClient(): TypedSupabaseClient {
  if (!client) {
    // Reads NEXT_PUBLIC_SUPABASE_URL and KEY automatically
    client = createPagesBrowserClient<Database>();
    if (process.env.NODE_ENV !== 'production') {
      // One-time log for debugging only in dev

      console.debug('Supabase client initialized');
    }
  }
  return client;
}

// Simple singleton getter
export function getSupabaseClient(): TypedSupabaseClient {
  return initClient();
}

// Hook-friendly alias that shares the same singleton
export function useSupabaseClient(): TypedSupabaseClient {
  return initClient();
}
